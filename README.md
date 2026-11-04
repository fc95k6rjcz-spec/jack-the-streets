# Jack the Racer

Top-down street racing / cop-chase game in a single HTML file.

- `index.html` — the game (what pile-up-gp.vercel.app serves). Fonts and original sprites are embedded; no build step.
- `assets/*.webp` — comic artwork and ground materials; keep these alongside the HTML.
- `src/race-to-the-future-claude.html` — the Claude artifact version (uses Claude's sign-in for cloud saves and online play).

Play: https://pile-up-gp.vercel.app

This update adds a comic reader across all nine campaign missions, a loading cover with real asset progress, line-of-sight police searches, officers entering buildings, delayed witness calls, driver resistance, workshop upgrades, balanced prices, and a filtered audio mix. Existing player profiles and wallets use the same save keys.

Enter the City opens the campaign directly. Northern Beaches is the default schematic setting, with more forgiving mission areas. Your own car counts in the opening job. A campaign race returns to the story, pays prize money, and unlocks the Breeze on the first win. The warehouse is a walkable safehouse with tap-to-walk stations, a bed, supplies, stored cars, and comic-style workbench menus. Street officers patrol and react to visible wanted suspects. Helicopters keep their distance and clear on arrest.

Browser checks: `node test-comic.mjs` and `node test-gameplay.mjs` (Node, Playwright, and Chrome required). These check all mission objective chains, retry/reward behavior, police visibility and indoor pursuit, witness calls, workshop purchases, phone comic layout, and the audio graph. Full player-driven balancing and iPhone testing remain necessary before an App Store release.
