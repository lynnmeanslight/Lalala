import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { LalalaEscrow, MockUSDT } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const USDT_DECIMALS = 6n;
const ONE_USDT = 10n ** USDT_DECIMALS;
const ORDER_AMOUNT = 100n * ONE_USDT; // 100 USDT
const FEE_BPS = 150n;
const SEVEN_DAYS = 7 * 24 * 60 * 60;

function makeOrderId(seed: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(seed));
}

describe('LalalaEscrow', function () {
  let escrow: LalalaEscrow;
  let usdt: MockUSDT;
  let owner: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let seller: HardhatEthersSigner;
  let feeRecipient: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, buyer, seller, feeRecipient, other] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory('MockUSDT');
    usdt = (await USDT.deploy()) as unknown as MockUSDT;

    const Escrow = await ethers.getContractFactory('LalalaEscrow');
    escrow = (await Escrow.deploy(
      await usdt.getAddress(),
      feeRecipient.address
    )) as unknown as LalalaEscrow;

    // Mint 1,000 USDT to buyer
    await usdt.mint(buyer.address, 1000n * ONE_USDT);

    // Buyer approves escrow
    await usdt
      .connect(buyer)
      .approve(await escrow.getAddress(), ethers.MaxUint256);
  });

  // ---------------------------------------------------------------------------
  // createOrder
  // ---------------------------------------------------------------------------
  describe('createOrder', function () {
    it('locks USDT and emits OrderCreated', async function () {
      const orderId = makeOrderId('order-1');

      await expect(
        escrow
          .connect(buyer)
          .createOrder(orderId, seller.address, ORDER_AMOUNT)
      )
        .to.emit(escrow, 'OrderCreated')
        .withArgs(orderId, buyer.address, seller.address, ORDER_AMOUNT);

      const order = await escrow.getOrder(orderId);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.seller).to.equal(seller.address);
      expect(order.amount).to.equal(ORDER_AMOUNT);
      expect(order.status).to.equal(1); // Status.Pending

      expect(await usdt.balanceOf(await escrow.getAddress())).to.equal(
        ORDER_AMOUNT
      );
    });

    it('reverts if orderId already exists', async function () {
      const orderId = makeOrderId('order-dup');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await expect(
        escrow
          .connect(buyer)
          .createOrder(orderId, seller.address, ORDER_AMOUNT)
      ).to.be.revertedWithCustomError(escrow, 'OrderAlreadyExists');
    });

    it('reverts with zero amount', async function () {
      await expect(
        escrow.connect(buyer).createOrder(makeOrderId('z'), seller.address, 0n)
      ).to.be.revertedWithCustomError(escrow, 'ZeroAmount');
    });

    it('reverts with zero seller address', async function () {
      await expect(
        escrow
          .connect(buyer)
          .createOrder(makeOrderId('z2'), ethers.ZeroAddress, ORDER_AMOUNT)
      ).to.be.revertedWithCustomError(escrow, 'ZeroAddress');
    });
  });

  // ---------------------------------------------------------------------------
  // confirmDelivery
  // ---------------------------------------------------------------------------
  describe('confirmDelivery', function () {
    it('releases funds with 1.5% fee and emits OrderReleased', async function () {
      const orderId = makeOrderId('order-confirm');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      const sellerBefore = await usdt.balanceOf(seller.address);
      const feeBefore = await usdt.balanceOf(feeRecipient.address);

      await expect(escrow.connect(buyer).confirmDelivery(orderId)).to.emit(
        escrow,
        'OrderReleased'
      );

      const expectedFee = (ORDER_AMOUNT * FEE_BPS) / 10_000n;
      const expectedSeller = ORDER_AMOUNT - expectedFee;

      expect(await usdt.balanceOf(seller.address)).to.equal(
        sellerBefore + expectedSeller
      );
      expect(await usdt.balanceOf(feeRecipient.address)).to.equal(
        feeBefore + expectedFee
      );

      const order = await escrow.getOrder(orderId);
      expect(order.status).to.equal(3); // Status.Released
    });

    it('reverts if called by non-buyer', async function () {
      const orderId = makeOrderId('order-nobuyer');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await expect(
        escrow.connect(other).confirmDelivery(orderId)
      ).to.be.revertedWithCustomError(escrow, 'NotBuyer');
    });

    it('reverts if order does not exist', async function () {
      await expect(
        escrow.connect(buyer).confirmDelivery(makeOrderId('ghost'))
      ).to.be.revertedWithCustomError(escrow, 'OrderNotFound');
    });

    it('reverts if called twice (already Released)', async function () {
      const orderId = makeOrderId('order-double');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);
      await escrow.connect(buyer).confirmDelivery(orderId);

      await expect(
        escrow.connect(buyer).confirmDelivery(orderId)
      ).to.be.revertedWithCustomError(escrow, 'InvalidStatus');
    });
  });

  // ---------------------------------------------------------------------------
  // raiseDispute
  // ---------------------------------------------------------------------------
  describe('raiseDispute', function () {
    it('sets status to Disputed and emits event', async function () {
      const orderId = makeOrderId('order-dispute');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await expect(escrow.connect(buyer).raiseDispute(orderId))
        .to.emit(escrow, 'OrderDisputed')
        .withArgs(orderId, buyer.address);

      const order = await escrow.getOrder(orderId);
      expect(order.status).to.equal(2); // Status.Disputed
    });

    it('reverts if called by non-buyer', async function () {
      const orderId = makeOrderId('order-dispute-nonbuyer');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await expect(
        escrow.connect(other).raiseDispute(orderId)
      ).to.be.revertedWithCustomError(escrow, 'NotBuyer');
    });
  });

  // ---------------------------------------------------------------------------
  // autoRelease
  // ---------------------------------------------------------------------------
  describe('autoRelease', function () {
    it('reverts before 7 days', async function () {
      const orderId = makeOrderId('order-auto-early');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await expect(
        escrow.connect(other).autoRelease(orderId)
      ).to.be.revertedWithCustomError(escrow, 'TooEarlyForAutoRelease');
    });

    it('releases after 7 days by anyone', async function () {
      const orderId = makeOrderId('order-auto-release');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await time.increase(SEVEN_DAYS + 1);

      await expect(escrow.connect(other).autoRelease(orderId))
        .to.emit(escrow, 'OrderReleased')
        .and.to.emit(escrow, 'OrderAutoReleased');

      const order = await escrow.getOrder(orderId);
      expect(order.status).to.equal(3); // Status.Released
    });
  });

  // ---------------------------------------------------------------------------
  // resolveDispute (admin)
  // ---------------------------------------------------------------------------
  describe('resolveDispute', function () {
    it('refunds buyer when refundBuyer = true', async function () {
      const orderId = makeOrderId('order-resolve-refund');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);
      await escrow.connect(buyer).raiseDispute(orderId);

      const buyerBefore = await usdt.balanceOf(buyer.address);

      await expect(
        escrow.connect(owner).resolveDispute(orderId, true)
      ).to.emit(escrow, 'OrderRefunded');

      expect(await usdt.balanceOf(buyer.address)).to.equal(
        buyerBefore + ORDER_AMOUNT
      );

      const order = await escrow.getOrder(orderId);
      expect(order.status).to.equal(4); // Status.Refunded
    });

    it('releases to seller when refundBuyer = false', async function () {
      const orderId = makeOrderId('order-resolve-release');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);
      await escrow.connect(buyer).raiseDispute(orderId);

      const sellerBefore = await usdt.balanceOf(seller.address);

      await escrow.connect(owner).resolveDispute(orderId, false);

      const expectedFee = (ORDER_AMOUNT * FEE_BPS) / 10_000n;
      expect(await usdt.balanceOf(seller.address)).to.equal(
        sellerBefore + ORDER_AMOUNT - expectedFee
      );
    });

    it('reverts if called by non-owner', async function () {
      const orderId = makeOrderId('order-resolve-nonowner');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);
      await escrow.connect(buyer).raiseDispute(orderId);

      await expect(
        escrow.connect(other).resolveDispute(orderId, true)
      ).to.be.revertedWithCustomError(escrow, 'OwnableUnauthorizedAccount');
    });

    it('reverts if order is not Disputed', async function () {
      const orderId = makeOrderId('order-resolve-pending');
      await escrow
        .connect(buyer)
        .createOrder(orderId, seller.address, ORDER_AMOUNT);

      await expect(
        escrow.connect(owner).resolveDispute(orderId, true)
      ).to.be.revertedWithCustomError(escrow, 'InvalidStatus');
    });
  });

  // ---------------------------------------------------------------------------
  // setFeeRecipient
  // ---------------------------------------------------------------------------
  describe('setFeeRecipient', function () {
    it('updates fee recipient', async function () {
      await escrow.connect(owner).setFeeRecipient(other.address);
      expect(await escrow.feeRecipient()).to.equal(other.address);
    });

    it('reverts with zero address', async function () {
      await expect(
        escrow.connect(owner).setFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(escrow, 'ZeroAddress');
    });

    it('reverts if called by non-owner', async function () {
      await expect(
        escrow.connect(other).setFeeRecipient(other.address)
      ).to.be.revertedWithCustomError(escrow, 'OwnableUnauthorizedAccount');
    });
  });
});
