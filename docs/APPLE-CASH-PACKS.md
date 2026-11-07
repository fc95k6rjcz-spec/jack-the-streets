# Apple cash packs

The solo garage has **BUY CASH** directly below its balance. Cash packs are consumable Apple In-App Purchases, separate from lifetime premium cars and upgrades. The browser previews the proposed AUD pricing and cannot charge. In the iOS app the buy buttons remain disabled until StoreKit returns a product and its localized display price. Apple presents and confirms payment.

Proposed catalogue (not published in App Store Connect):

| Product suffix | Game cash | Target AUD price |
| --- | ---: | ---: |
| `.cash.pocket` | 10,000 | A$4.99 |
| `.cash.street` | 25,000 | A$9.99 |
| `.cash.garage` | 60,000 | A$19.99 |
| `.cash.empire` | 150,000 | A$39.99 |

Prefix: `com.justinsapps.jackthestreets`. Four matching Consumable entries are in `ios/JackTheStreets/Premium.storekit` for Xcode testing. Prices and pack sizes are draft economy choices and can be adjusted before publication.

## Delivery

Only StoreKit-verified, non-revoked consumable transactions are exposed to the game. The native bridge binds a purchase to its original local profile. The game credits Player 1 and stores a transaction ledger with the wallet in one saved profile, checks that storage succeeded, then acknowledges the transaction. Failed persistence rolls back the in-memory credit and does not finish the transaction. Duplicate delivery and acknowledgement retries do not add currency twice. Another profile's unfulfilled transaction waits for the original profile. The native delivered ledger protects against replay of already finished consumables. Pending and cancelled purchases grant nothing. Buying the same pack again with a new transaction adds another pack. Restoring lifetime purchases does not refill previously spent cash.

Apple's unfinished transaction recovery: https://developer.apple.com/documentation/storekit/transaction/unfinished
Apple purchase-flow guidance: https://developer.apple.com/documentation/storekit/offering-completing-and-restoring-in-app-purchases

## Release work still required

Create these four consumable products in App Store Connect, choose the final available AUD price points, complete purchase metadata and agreements, and test Apple sandbox approval/cancellation/interrupted delivery on a signed device build. This implementation has native compilation and mocked transaction-delivery coverage; it has not completed a real Apple sandbox purchase in this session.

The wallet is saved in the game's existing local profile. No new authoritative cross-device paid-currency service or cash-refund reconciliation is included. A production account-backed wallet needs those before promising reinstall recovery or synchronized purchased balances across devices.
