# Interior furniture artwork

Generated using the built-in image-generation tool and integrated into the game.

Asset: `assets/interior-furniture-v2.webp` (1448 × 1086, transparent 4 × 3 atlas).
Runtime: `interior-renderer.js`.

Generation prompt:
Production game sprite atlas, 4 columns by 3 rows exactly, twelve equal square cells, transparent background. Strict straight down 90-degree bird’s-eye orthographic view, no isometric view. Detailed realistic hand-painted late-1980s coastal Sydney furnishings. Warm upper-left light and subtle contact shadows. Isolated objects with transparent margins, no text or grid. Row 1: rust-linen bed, olive sofa, walnut dining table with chairs, vintage TV console. Row 2: potted palm, faded Persian rug, walnut bookshelf, L-shaped checkout counter. Row 3: steel refrigerator, oak computer desk, leather armchair, timber sideboard. Tactile fabric, wood grain and metal, fine detail, no thick cartoon outlines.

Final cleanup prompt:
Edit this game furniture atlas only to remove ALL pale beige/white/grey background haze around objects. Each sprite must be a clean isolated cutout on fully transparent alpha=0 space, no pale rectangular tile around any sprite, no floor, no cloudy semi-transparent backdrop. Preserve exact 4 columns x 3 rows, exact object positions and sizes, exact image dimensions and artwork. Keep only a very tight subtle dark contact shadow under furniture. All twelve sprites and their geometry must remain unchanged. Crisp transparent cutouts ready to overlay on dark wooden game floors.

Converted the resulting PNG to WebP with Pillow, preserving alpha. Floors and lighting are cached canvas materials, not generated images.

## Garage before restoration

Built-in image-generation edit of `assets/safehouse-interior.webp`, saved as `assets/garage-before.webp` with the same room layout and pristine orange car.

Prompt:
Create the BEFORE-RESTORATION state of this exact top-down game garage. Keep the same composition, camera angle, dimensions, floor plan, walkable open middle, bed top left, workbench upper centre, supply shelves upper right, fridge left middle and doorway bottom centre. The orange sports car on the right must remain absolutely immaculate, polished stunning paint, pristine glass and wheels: it is Jack's treasured car. The garage around it is neglected and needs repairing: cracked damp concrete with a few puddles, broken overhead lamps, peeling paint on the walls, rusty sagging workbench, sparse crooked shelves, patched bed, boarded or cracked left windows. Keep loose debris close to walls, not obstructing walkable space. Believable modestly dilapidated workshop, no rubble blocking stations, no destroyed car. Rich detailed realistic hand-painted 1980s comic game aesthetic matching reference. No text or UI. This is a playable background whose repaired version is the supplied reference.
