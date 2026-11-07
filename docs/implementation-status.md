# City expansion — implementation status

7 November 2026

The updated game is implemented in the local checkout. It has not been pushed to GitHub or deployed over the existing production game.

## Play and develop

From the repository directory:

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:4174`. The **SMS · JOBS** button opens dispatch, messages and the premium garage. Set the story aside from dispatch to take independent contracts; return to the story when ready. **OPEN MAP** joins other drivers on this server.

Edit `city-expansion.inc.js`, `suburbs.inc.js` or `workshop.inc.js`, then run `npm run build` to embed it into the standalone `index.html`. Existing core engine changes remain in `index.html`. No bundler is needed to play.

## Implemented

| Area | Current behaviour |
| --- | --- |
| Streets and suburbs | Named streets and suburb display; Northern Beaches residential parcels have individual roofs, driveways, lawns, pools, denser trees and some local cul-de-sacs. Shopping and industrial centres retain their separate layouts. |
| Motorway | Three full-width lanes in each direction, median, shoulders, motorway traffic lanes and six crossing decks on the campaign grid. Crossing vehicles use separate collision layers. |
| Bridges and tunnel | Bridge details on existing water crossings; a lit harbour-tunnel segment hides the player from airborne observation and helicopter fire. |
| Street life | Existing pedestrians/crossings retained; bus stops, trees, street signs and lamps added. Motorway crossings exclude ordinary pedestrian crossing spawns. |
| Car parks and helipads | Driveable paved parking areas and marked helipads. Parking out of police sight can conceal a stationary car after a delay. |
| Building access | Generic building thresholds require using their doors. Service entrances continue to open their relevant interiors. |
| Retail | Rebuilt convenience and electronics shops with walkable aisles, shelf collisions, checkout zones, a marked exit, robbery alarms and police intrusion. Card purchases spend in-game money. |
| Fuel | Stop on the forecourt and tap a card to buy fuel. Moving, insufficient funds and a full tank are handled. |
| Fleet | Ferrari 458, Porsche Macan, Mercedes SL500, G-Wagon, Ford Raptor and Subaru STI added, plus buses, delivery trucks, garbage trucks and crane trucks. New vehicles have cached procedural top-down bodywork. |
| Driving and combat | Vehicle length affects steering; tyre damage affects grip, acceleration and braking; heavier vehicles brake differently. Punching now includes an attached arm instead of a floating fist. |
| Theft and security | Some ordinary cars are locked; premium cars are locked. Some drivers are armed. Per-car security provides auto-locking, an alarm and a parked-car GPS tracker. Owners keep access to their own locked vehicles. |
| Helicopters | Acceleration-limited movement, gradual heading changes, standoff avoidance and military missiles. Arrest/escape removes air pursuit. Existing police spike strips and tyre damage are retained. |
| Dispatch | 300 deterministic route contracts across seven job families and ten tiers. Pickup, stopped drop-off, timing, failure/retry, cargo damage, avoiding police, races and electronics robbery are implemented. Completion pays once and persists. |
| SMS | Persistent messages, job acceptance, objective updates, failure and payout messages. |
| Multiplayer | Companion WebSocket server supports eight drivers per city, interpolated player presence, first-come job claims and release of abandoned jobs. Different cities have separate rooms. |
| Premium purchases | SwiftUI/WKWebView iOS wrapper and StoreKit 2 bridge, verified non-consumable entitlements, restoration, revocation handling, and transaction completion after ownership is saved. Browser purchases remain unavailable. |

## Apple App Store setup

The chosen storefront is Australia/AUD. Target car pricing is **A$7.99 for lifetime ownership**. The implementation uses **A$4.99 for an engine**, **A$9.99 for security**, and **A$27.00 for a tyres-and-armour package**. Security pricing and packaging are implementation choices; the original brief did not specify their exact breakdown.

Open `ios/JackTheStreets.xcodeproj` in Xcode. The shared scheme is `JackTheStreets`. `ios/JackTheStreets/Premium.storekit` contains 28 local non-consumable test products: seven cars and three upgrades for each car. Confirm this file is selected under Edit Scheme → Run → Options when testing local purchases.

Product IDs use `com.justinsapps.jackthestreets.car.<car>` and `com.justinsapps.jackthestreets.upgrade.<car>.<upgrade>`. Their complete list and test prices are in the StoreKit configuration. The app displays Apple's actual localized product prices before purchase rather than charging based on a JavaScript label.

Live sales require the Apple Developer team/signing configuration, a matching App Store Connect app and products, actual Australian price-point selection, sandbox purchase/restore/refund testing, and App Store submission. No products were created in App Store Connect and no real purchases were performed in this task.

The generic simulator build compiles successfully. Launching and exercising StoreKit inside an iOS simulator was not verified: the local CoreSimulator runtime service was unavailable to this execution environment. The web entitlement-delivery logic has automated tests; these are not a substitute for Apple's sandbox transaction tests.

## Multiplayer scope

The local Node server is runnable and was tested with two browser sessions and two automated WebSocket clients. Traffic and police remain local simulations, remote players do not have shared collision physics, and mission completion is client reported. Job claims/completions live in server memory and are not an account-backed, cheat-resistant economy.

Public deployment is not configured. The server binds to loopback by default. For a separately deployed server, configure its host/TLS and an appropriate origin policy. The native wrapper accepts an optional `OpenMapWebSocketURL` Info.plist string; without it, the iOS build remains solo. `ALLOWED_ORIGINS` allows an explicitly configured native WebSocket origin on the companion server; same-origin is the default.

## Remaining development

- The 300 jobs are generated variations across seven families, not 300 individually authored story missions. Passenger/heist pickups are objective-driven prototypes; bespoke character staging, dialogue and a full campaign narrative still need authoring.
- Vehicle engine profiles are differentiated synthesis, not authentic recordings of the named cars.
- The road system is an arcade grid expansion, not a surveyed Sydney road network. Ramps, traffic navigation across grade changes and player-driven map/handling balance need further playtesting.
- Added fleet art is procedural; final manufacturer-specific illustration/detail passes remain.
- Complete shared-world simulation, persistent accounts, production mission validation and public hosting remain.
- Device playtesting, live StoreKit sandbox transactions, app icons/metadata, signing and release preparation remain.
- Boats, trailers and islands were not expanded. Island-trip entry points were removed from the active phone/service flow. Soccer and basketball were not added.

## Verification

- 35 existing browser regression checks passed, covering all nine story objective chains, rewards, weapons, police visibility/search, driver resistance, driving, safehouse and workshop behaviour.
- 12 expansion browser checks passed, covering the generated catalogue, road facilities, fleet rendering, spending, fuel, job payout/retry, shelf collisions, helicopter movement/missiles, tyres, locks/owner keys and overpass layers.
- Eight Node tests passed: standalone script/source consistency, multiplayer synchronisation and claim arbitration, and native entitlement delivery/restoration/revocation and catalogue pricing.
- Actual checkout UI was exercised: a $12 in-game sandwich reduced the balance from $100 to $88.
- Two browser sessions showed ONLINE 2/8 on the companion server.
- Xcode generic iOS Simulator build succeeded with signing disabled.

Run automated tests with `npm test`. For browser checks, run `npm run test:browser`, open `http://127.0.0.1:4173/?test=1`, and use the expansion/regression controls. `http://127.0.0.1:4173/responsive?w=844&h=390` embeds the game in an actual landscape-phone viewport for layout checks. Test hooks are served only by the separate test server and are absent from the normal game server.

StoreKit implementation follows Apple's transaction verification, current-entitlement, transaction-finishing and WebKit reply-handler APIs:

- https://developer.apple.com/documentation/storekit/transaction
- https://developer.apple.com/documentation/storekit/transaction/currententitlements
- https://developer.apple.com/documentation/webkit/wkscriptmessagehandlerwithreply

## iPhone comic fit correction

The phone comic reader now uses the visible viewport height, including changes caused by Safari browser bars, and keeps its controls within safe-area padding. Dialogue moves into a separate text area on phone layouts so it cannot be cropped by artwork. Portrait phones stack artwork and text; landscape phones show them side by side. The existing full-size iPad layout is preserved.

All 26 comic panels passed at ten simulated phone/tablet configurations (260 panel-layout checks), including older/current Max portrait and landscape sizes, reduced browser height, and iPad portrait/landscape. This is browser viewport verification, not a physical iPhone Safari test. Run `npm run test:comic-fit` and open http://127.0.0.1:4175 to repeat it.
