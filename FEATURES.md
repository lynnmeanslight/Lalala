# Lalala Features

> Scope is set for a 24-hour hackathon MVP. Every feature listed here must be demonstrable on pitch day. Post-hackathon roadmap items are noted separately at the bottom.

---

## 1. Authentication and Wallet

- **Buyer and seller registration / login** — email and password; single shared form with a role selector (buyer / seller)
- **KUB Chain wallet connect** — connect a KUB Chain-compatible wallet (e.g. MetaMask pointed at KUB Chain RPC); required to pay or receive USDT
- **Session persistence** — stay logged in across page refreshes using JWT stored in localStorage

---

## 2. Product Listings

- **Create listing** — title, description, category, one or more photos, price in USDT, stock quantity
- **Browse listings** — homepage grid of all active listings with photo, title, price, and seller name
- **Product detail page** — full photos, description, seller info, verified review score, and a Buy button

---

## 3. USDT Escrow on KUB Chain

- **Pay with USDT** — buyer clicks Buy, connects wallet, and sends USDT to the escrow smart contract
- **Smart contract escrow** — USDT is locked in the contract on payment; neither buyer nor seller can access it until the order is resolved
- **Automatic 1.5% platform fee** — deducted from the locked amount by the contract at the moment of release; no manual step required
- **Confirm delivery and release** — buyer taps Confirm Delivery; contract releases USDT to the seller minus the fee instantly
- **Auto-release fallback** — if the buyer takes no action within 7 days, the contract automatically releases funds to the seller

---

## 4. Verified Reviews

- **Purchase-gated** — the review form is only unlocked after the smart contract emits a delivery-confirmed event for that order
- **Star rating and text** — 1 to 5 stars plus a written comment
- **One review per completed order** — enforced by checking the order ID on submit
- **Displayed on listing and seller profile** — aggregate star average and all individual reviews are publicly visible

---

## 5. Seller Dashboard

- **Order list** — all orders with status (paid / shipped / delivered / disputed) and buyer wallet address
- **Mark as shipped** — seller enters a tracking number to advance the order status
- **Earnings summary** — total USDT received, amount currently locked in escrow, and total fees paid

---

## 6. Buyer Dashboard

- **My orders** — list of all orders with current status and a Confirm Delivery button for orders in the shipped state
- **Order detail** — transaction hash on KUB Chain, seller info, and review form once delivery is confirmed

---

## 7. Basic Dispute Flag

- **Raise a dispute** — buyer or seller can flag an order before the auto-release timer expires; flagging pauses the auto-release and marks the order as disputed
- **Disputed state** — both parties see a "disputed" badge; manual admin resolution handles it post-hackathon

---

## Post-Hackathon Roadmap

Features intentionally left out of the 24-hour build but planned for the full product:

- KYC / Thai National ID verification for sellers
- Community arbitration with token-holder voting
- Loyalty token earn and redemption
- Seller subscription tiers (Free / Standard / Pro)
- Featured placement auctions
- Courier API integration (Flash, Kerry, J&T)
- Push and email notifications
- Admin panel
- Full search with filters and sorting
