# 30-point review — 21 November 2026

Local working build; not deployed. Existing progress is preserved. Multiplayer is removed from the active gameplay menu at the user's request. This is a review of the original findings, not a claim that the entire game is bug-free.

1. **Fixed — duplicate garage cars.** Retrieval consumes the matching parked owned car and clears its duplicate copies. Other owners and civilian cars remain untouched. Five repeated parking/retrieval cycles passed.
2. **Fixed — free garage fuel.** Fuel is stored per owned car; 10% and empty tanks survived reload. A paid 25% refill deducted $50 and survived reload.
3. **Fixed — mobile map overlap.** Separate phone/tablet placement, safe-area offsets and indoor hiding. Seven screen layouts checked.
4. **Fixed — oversized notifications.** Bounded two-line phone messages near the top; police search countdown retained in the status line. Long messages use an ellipsis.
5. **Fixed — indoor driving controls.** Retail uses its own shop/rob/leave controls and walking stick; no nitro. Layout rebuilds on room type and foot/vehicle transitions.
6. **Fixed — conflicting hardware names.** Phone, story, mission, GPS and shop sign use Bunnings.
7. **Fixed — shop count.** Directory count derives from the catalogue; browser checks expect the current 42 entries.
8. **Improved — starter garage condition.** Unrepaired lights dim the room; roof damage leaves stains and debris; the workbench is boarded.
9. **Improved — repair payoff.** Each corresponding repair removes its damage overlay. Before/after screenshots reviewed. This does not replace all furnished workshop artwork.
10. **Improved — narrow phone interiors.** Wider room framing uses more landscape space. Furniture and actors retain the same coordinate system.
11. **Fixed — oversized shopping card.** Compact balance strip and tighter headings leave more room for products; scrolling remains for longer lists.
12. **Improved, art review still needed — mixed styles.** Existing materials retained; road ironwork receives graded shading and a fine grate instead of a heavy cartoon outline. This is not a replacement of every asset.
13. **Improved — blocky water depth.** Shallow/deep transitions blend across water cells; gameplay collision boundaries are unchanged.
14. **Partially improved — indoor facing.** Actual movement determines animation; left/right facing mirrors the sprite. True front/back directional artwork remains outstanding.
15. **Fixed — missing garage camera.** The seamless camera defers to normal initialization when no valid camera exists. The previously failing scripted null-camera transition now produces a finite zoom.
16. **Fixed — stale checks.** Corrected current rewards/counts and valid loaded artwork expectations. Workshop checks no longer require an obsolete inline background-image path.
17. **Removed from active gameplay UI — multiplayer.** No broken Open Map/Join button. The dormant server implementation remains in the repository; no new server was provisioned.
18. **Fixed — active contract reload.** Saved phase, checkpoint, remaining time, vehicle, fuel, damage, wanted level and safe position. A loaded job resumes when entering the game. Unsafe saved positions fall back to pickup. No offline timer penalty.
19. **Fixed — incorrect race timing distance.** Timing uses the full checkpoint route instead of pickup-to-delivery distance.
20. **Rebalanced — later races.** Added road-detour, turn and checkpoint allowances. The 300-job script found no race requiring the previous >250-unit straight-line average. Full real-time driving of every race remains untested.
21. **Fixed — holstered bank gun.** Ammo is unchanged and officers are not shot while the weapon is holstered.
22. **Fixed — stale petrol quotes.** Recalculate both options after purchase; disable refills when full. Partial-fill test changed the remaining quote to $150.
23. **Fixed — silent save errors.** Visible storage warning on failure, removed after a successful save. Simulated quota failure and recovery checked.
24. **Partially improved — repetitive contracts.** District-specific route descriptions, checkpoint counts and damage-sensitive ride/delivery variants added. The game still uses seven underlying job families, not 300 hand-authored stories.
25. **Fixed — trees hide the car.** Canopies overlapping a nearby player fade to 28% opacity.
26. **Fixed — confusing map naming.** Removed the multiplayer Open Map control, retaining the regional atlas and phone GPS destinations.
27. **Improved — crowded messages.** Shorter notification strip, priority handling and indoor map hiding reduce stacked overlays. Story/mission text still needs visual review in unusually busy scenes.
28. **Improved — copied neighbourhoods.** Less frequent pools and variable garden-tree counts reduce repeated layouts. Houses still share an asset library.
29. **Fixed — dinosaur cargo contradiction.** Only the box truck can load the cargo. A bus leaves the job waiting at pickup rather than triggering failure.
30. **Fixed — phone job instructions.** Reads the actual stage `txt` field; verified a specific delivery instruction appears instead of generic guidance.

## Verification

- 98 Node tests passed at the latest unit run.
- All nine browser suites passed across the full run and focused reruns: expansion, workshop, polish, fleet, suburbs, urban areas, peninsula, 200-car fleet and police/story gameplay.
- All 300 contracts completed in scripted objective-placement tests. This is not 300 manual driving playthroughs.
- Low/empty fuel, paid refilling, contract reload, holstered bank weapon, fuel quote, truck selection, missing camera and storage-failure cases checked in isolated browser saves.
- Mobile controls and touch Leave action checked at 568×320, 844×390 and 1024×768; regional-map layout also checked at other phone/tablet/desktop sizes.
- Production web build succeeded. Nothing was published or merged.
- Physical iPad/iPhone testing and subjective artwork approval remain outside this verification.
