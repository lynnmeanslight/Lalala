import { ethers, network } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from: ${deployer.address}`);
  console.log(`Network: ${network.name} (chainId: ${(await ethers.provider.getNetwork()).chainId})`);

  // ---- Config ----------------------------------------------------------------
  // On testnet/mainnet these come from .env; on localhost we deploy a MockUSDT
  let usdtAddress = process.env.USDT_ADDRESS as string | undefined;
  const feeRecipient = (process.env.FEE_RECIPIENT as string | undefined) ?? deployer.address;

  if (!usdtAddress) {
    if (network.name === 'kubMainnet') {
      throw new Error('USDT_ADDRESS env variable is required for mainnet deployment');
    }
    console.log('No USDT_ADDRESS set — deploying MockUSDT...');
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    const mockUsdt = await MockUSDT.deploy();
    await mockUsdt.waitForDeployment();
    usdtAddress = await mockUsdt.getAddress();
    console.log(`MockUSDT deployed to: ${usdtAddress}`);
  }

  console.log(`USDT address: ${usdtAddress}`);
  console.log(`Fee recipient: ${feeRecipient}`);

  // ---- Deploy LalalaEscrow ---------------------------------------------------
  const LalalaEscrow = await ethers.getContractFactory('LalalaEscrow');
  const escrow = await LalalaEscrow.deploy(usdtAddress, feeRecipient);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log(`\nLalalaEscrow deployed to: ${escrowAddress}`);

  // ---- Summary ---------------------------------------------------------------
  console.log('\n--- Add these to your .env.local ---');
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_USDT_ADDRESS=${usdtAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
