# Jack the Streets art

These project assets were generated with the built-in image-generation tool, then encoded as WebP for the game. No external generation API was used. The portraits in `character-looks.webp` are for the picker only; `character-overhead.webp` supplies upright gameplay poses. Surrender is a separate explicit state.

## Final prompt specifications

- `assets/jack-streets-cover.webp`: vertical 3:4 1980s printed adventure comic cover; exact masthead “JACK THE STREETS”; dark-haired Jack in a red jacket beside a battered orange coupe; grey-haired, moustached Ray in his brick garage; Sydney Northern Beaches at dusk; rich brush inks, aged paper and halftone shadows; quiet dark space at the bottom for loading controls.
- `assets/jack-opening-comic.webp`: strict 3 by 2 atlas of six 4:3 panels in a consistent detailed 1980s ink-and-halftone style. Reading order: trophy dream in Jack's bedroom; coastal bus stop and blank race billboard; Ray's workshop and car lift; alley with parked coupe and distant police lights; starting grid and crowd; Ray in pit lane with headset and tyres. No baked captions or speech bubbles; game HTML supplies those.
- `assets/coastal-city-roofs.webp`: strict 3 by 3 equal-cell atlas, overhead Sydney coastal buildings, believable weathered materials and restrained graphic novel shading. Mechanics garage, tile-roof townhouse, apartments, teal corner shop, sawtooth warehouse, beachfront cafe, police station, sandstone municipal building, office. No labels or logos.
- `assets/character-overhead.webp`: transparent 4 by 6 animation atlas; true vertical camera above upright people; compact crowns and shoulders, small shoe tips, no front-facing full bodies and no prone figures. Four frames per row: idle and three walk strides. Rows: red jacket/dark hair; blue mechanic jacket/curly hair; olive hoodie/shaved head; purple jacket/blonde ponytail; white tee/brown hair; mustard jacket/black bob. No floors, labels or baked external shadows.

Phone-layout screenshots are browser emulations, not evidence of physical device performance or Safari compatibility.

## City-wide art pass

Generated with the same built-in image tool and encoded to WebP. Existing comic pages, character choices and the detailed warehouse interior remain intact.

- `assets/comic-cars.webp`: 20-car atlas in five columns/four rows, all noses right, directly overhead. Realistic 1980s ink, restrained halftones, weathered paint, natural glass/tyres, muted colours. Hot hatch, convertible, pickup, muscle coupe, luxury sedan, racing coupe, sports car, wagon, off-road SUV, supercar, boxy hatch, classic coupe, drift sedan, van, utility truck, rally hatch, performance coupe, compact coupe, touring sedan and exotic. No scenery, text or logos. A second image-tool edit removed every exterior background/shadow while preserving the grid and vehicles.
- `assets/comic-special-cars.webp`: two-by-two atlas, directly overhead with noses right: open dune buggy and roll cage; silver electric supercar; sapphire hypercar; black/burnt-red experimental endurance hypercar. Matching ink/material treatment and transparent silhouettes.
- `assets/comic-services.webp`: four-by-two transparent overhead atlas, noses right: Australian police sedan, police wagon, armoured police van, army personnel truck, separate tank hull, separate turret/barrel, helicopter without main rotor, speedboat. No ground, logos or exterior baked shadows. Turret and rotor motion remain code-driven.
- `assets/comic-people.webp`: four frames by three rows, upright overhead people with compact silhouettes. Street police in navy cap/uniform; tactical police with helmet/armour; grey-haired mechanic in blue. Idle/left-step/passing/right-step columns. No floor, full-body front view, labels or exterior shadows.
- `assets/comic-shops.webp`: three-by-three location atlas with textured coastal materials and restrained graphic-novel inks. Fuel station, diner, mechanic, convenience store, bank, gun shop, warehouse, spray booth, waterfront cafe. No text, people or cars. Runtime placement uses existing building parcels so artwork cannot become a building across a road.
- `assets/comic-trees.webp`: three-by-two transparent directly-overhead canopies: Norfolk pine, eucalyptus, jacaranda, palm, coastal shrub, snow-dusted pine. Natural greens, detailed leaves/branches, matching ink and restrained halftones. No floor, horizon, labels or exterior shadows.
