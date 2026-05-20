// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LalalaEscrow
 * @notice USDT escrow contract for the Lalala marketplace on KUB Chain.
 *         Buyers lock USDT when placing an order. Funds are released to the
 *         seller (minus a 1.5% platform fee) when the buyer confirms delivery,
 *         or automatically after AUTO_RELEASE_PERIOD if no action is taken.
 *         Disputes are resolved by the contract owner (platform admin).
 */
contract LalalaEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice Platform fee in basis points (150 = 1.5%)
    uint256 public constant FEE_BPS = 150;

    /// @notice After this period any party can trigger auto-release
    /// @dev Set to 5 minutes for demo; change to 7 days for production
    uint256 public constant AUTO_RELEASE_PERIOD = 5 minutes;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice The USDT token contract
    IERC20 public immutable usdt;

    /// @notice Wallet that receives platform fees
    address public feeRecipient;

    enum Status {
        None,      // order does not exist
        Pending,   // USDT locked, awaiting delivery
        Disputed,  // buyer raised a dispute
        Released,  // funds sent to seller
        Refunded   // funds returned to buyer
    }

    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        Status  status;
    }

    /// @notice orderId => Order  (orderId is keccak256 of off-chain UUID)
    mapping(bytes32 => Order) public orders;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event OrderCreated(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    event OrderReleased(bytes32 indexed orderId, uint256 sellerAmount, uint256 fee);
    event OrderAutoReleased(bytes32 indexed orderId);
    event OrderDisputed(bytes32 indexed orderId, address indexed buyer);
    event OrderRefunded(bytes32 indexed orderId);
    event FeeRecipientUpdated(address indexed newRecipient);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error OrderAlreadyExists();
    error OrderNotFound();
    error NotBuyer();
    error InvalidStatus(Status current);
    error TooEarlyForAutoRelease(uint256 releaseAt);
    error ZeroAmount();
    error ZeroAddress();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address _usdt, address _feeRecipient) Ownable(msg.sender) {
        if (_usdt == address(0) || _feeRecipient == address(0)) revert ZeroAddress();
        usdt = IERC20(_usdt);
        feeRecipient = _feeRecipient;
    }

    // -------------------------------------------------------------------------
    // Buyer actions
    // -------------------------------------------------------------------------

    /**
     * @notice Lock USDT in escrow for an order.
     * @dev Caller must have approved this contract for `amount` USDT first.
     * @param orderId  keccak256 of the off-chain order UUID
     * @param seller   seller wallet address
     * @param amount   USDT amount (in token decimals, e.g. 6 for USDT)
     */
    function createOrder(
        bytes32 orderId,
        address seller,
        uint256 amount
    ) external nonReentrant {
        if (orders[orderId].buyer != address(0)) revert OrderAlreadyExists();
        if (seller == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        usdt.safeTransferFrom(msg.sender, address(this), amount);

        orders[orderId] = Order({
            buyer:     msg.sender,
            seller:    seller,
            amount:    amount,
            createdAt: block.timestamp,
            status:    Status.Pending
        });

        emit OrderCreated(orderId, msg.sender, seller, amount);
    }

    /**
     * @notice Buyer confirms delivery — releases funds to seller.
     * @param orderId keccak256 of the off-chain order UUID
     */
    function confirmDelivery(bytes32 orderId) external nonReentrant {
        Order storage order = _requireOrder(orderId);
        if (msg.sender != order.buyer) revert NotBuyer();
        if (order.status != Status.Pending) revert InvalidStatus(order.status);

        _release(orderId, order);
    }

    /**
     * @notice Buyer raises a dispute — funds are frozen until admin resolves.
     * @param orderId keccak256 of the off-chain order UUID
     */
    function raiseDispute(bytes32 orderId) external {
        Order storage order = _requireOrder(orderId);
        if (msg.sender != order.buyer) revert NotBuyer();
        if (order.status != Status.Pending) revert InvalidStatus(order.status);

        order.status = Status.Disputed;
        emit OrderDisputed(orderId, msg.sender);
    }

    // -------------------------------------------------------------------------
    // Auto-release (callable by anyone after timeout)
    // -------------------------------------------------------------------------

    /**
     * @notice Auto-release funds to seller after AUTO_RELEASE_PERIOD with no action.
     *         Anyone can call this to trigger the release on behalf of the seller.
     * @param orderId keccak256 of the off-chain order UUID
     */
    function autoRelease(bytes32 orderId) external nonReentrant {
        Order storage order = _requireOrder(orderId);
        if (order.status != Status.Pending) revert InvalidStatus(order.status);

        uint256 releaseAt = order.createdAt + AUTO_RELEASE_PERIOD;
        if (block.timestamp < releaseAt) revert TooEarlyForAutoRelease(releaseAt);

        _release(orderId, order);
        emit OrderAutoReleased(orderId);
    }

    // -------------------------------------------------------------------------
    // Admin actions
    // -------------------------------------------------------------------------

    /**
     * @notice Resolve a disputed order.
     * @param orderId     keccak256 of the off-chain order UUID
     * @param refundBuyer true => refund buyer; false => release to seller
     */
    function resolveDispute(
        bytes32 orderId,
        bool refundBuyer
    ) external onlyOwner nonReentrant {
        Order storage order = _requireOrder(orderId);
        if (order.status != Status.Disputed) revert InvalidStatus(order.status);

        if (refundBuyer) {
            order.status = Status.Refunded;
            usdt.safeTransfer(order.buyer, order.amount);
            emit OrderRefunded(orderId);
        } else {
            _release(orderId, order);
        }
    }

    /**
     * @notice Update the fee recipient wallet.
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    // -------------------------------------------------------------------------
    // View helpers
    // -------------------------------------------------------------------------

    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function autoReleaseAt(bytes32 orderId) external view returns (uint256) {
        return orders[orderId].createdAt + AUTO_RELEASE_PERIOD;
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    function _requireOrder(bytes32 orderId) internal view returns (Order storage) {
        Order storage order = orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        return order;
    }

    function _release(bytes32 orderId, Order storage order) internal {
        order.status = Status.Released;
        uint256 fee          = (order.amount * FEE_BPS) / 10_000;
        uint256 sellerAmount = order.amount - fee;

        usdt.safeTransfer(order.seller, sellerAmount);
        if (fee > 0) usdt.safeTransfer(feeRecipient, fee);

        emit OrderReleased(orderId, sellerAmount, fee);
    }
}
