# Jack the Streets

## Local city expansion (7 November 2026)

Run `npm install` and `npm run dev`, then open http://127.0.0.1:4174. SMS dispatch has 300 route contracts, the premium garage and messages; Open Map supports up to eight drivers on the companion server. See [implementation status](docs/implementation-status.md) for the completed changes, verification and remaining production work. The iOS StoreKit wrapper is in `ios/JackTheStreets.xcodeproj`; live App Store products/signing are not configured.

Run `npm test` for automated checks and `npm run test:browser` for the interactive browser suite. After editing `city-expansion.inc.js`, `suburbs.inc.js`, `urban.inc.js` or `workshop.inc.js`, run `npm run build`. The Northern Beaches residential pass adds individual houses with precise collision footprints, lawns, driveways, pools, mature trees and local cul-de-sacs; Sydney and commercial centres use denser perimeter blocks, terrace rows, loading courts and through service lanes. City diagonal-road corridors remain clear of building collisions.

Top-down street racing / cop-chase game in a single HTML file.

- `index.html` — the game (what pile-up-gp.vercel.app serves). Fonts and original sprites are embedded; no build step.
- `assets/*.webp` — comic artwork and ground materials; keep these alongside the HTML.
- `src/race-to-the-future-claude.html` — the Claude artifact version (uses Claude's sign-in for cloud saves and online play).

Play: https://pile-up-gp.vercel.app

This update adds a comic reader across all nine campaign missions, a loading cover with real asset progress, line-of-sight police searches, officers entering buildings, delayed witness calls, driver resistance, workshop upgrades, balanced prices, and a filtered audio mix. Existing player profiles and wallets use the same save keys.

Enter the City opens the campaign directly. Northern Beaches is the default schematic setting, with more forgiving mission areas. Your own car counts in the opening job. A campaign race returns to the story, pays prize money, and unlocks the Breeze on the first win. The warehouse is a walkable safehouse with tap-to-walk stations, a bed, supplies, stored cars, and comic-style workbench menus. Street officers patrol and react to visible wanted suspects. Helicopters keep their distance and clear on arrest.

The opening now uses a printed comic cover and six distinct story scenes; the old animated chase is replaced on launch and replay. Character portraits are separate from the compact overhead walking sprites, so standing characters no longer look prone. New Northern Beaches building art, progressive car steering, braking before reverse, retained corner momentum, smaller markers and a smoother camera bring the live game closer to the comic direction.

Touch layouts have a compact HUD, separated thumb controls, a collapsible objective at the top, and a portrait rotation screen that suspends solo simulation. Expanded folding-screen layouts resize without a portrait lock. Desktop keyboard controls remain available; touch help uses button names.

City/race roads no longer spawn weapons, mystery crates, coins, repair pickups, boost pads or ramps. Building loot is cash, guns and limited ammunition require an explicit gun-shop purchase, and combat jobs no longer give free guns or automatic ammunition. The helicopter mission requires a paid launcher before escalation; an empty weapon can be refilled at the shop. The separate balloon arena retains its arcade pickups. Tanks have finite onboard shells rather than granting a carried 99-rocket launcher.

The world art pass covers all 21 player cars, traffic, police/SWAT/army vehicles, a separately rotating tank turret, helicopters, boats, walking civilians/officers, coastal foliage and service buildings. Sprite frames are cached and cutout transparency is checked. Shop art attaches to real building parcels while the existing service entrances remain usable. Asset direction and prompt specifications are in `docs/art-direction.md`.

Browser checks: `node test-comic.mjs`, `node test-gameplay.mjs`, and `node test-mobile.mjs` (Node, Playwright, and Chrome required). These check mission objective chains, retry/reward behavior, police visibility and indoor pursuit, witness calls, purchases, sprite perspective/transparency, car handling, five touch viewport sizes, rotation pause/resume, comic navigation, and the audio graph. Physical iPhone/Safari testing and player-driven handling/balancing remain necessary before an App Store release.
