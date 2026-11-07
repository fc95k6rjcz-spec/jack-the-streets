# Jack the Streets — Development Brief

Recorded: 7 November 2026

## Purpose and status

Build a polished, top-down Sydney-style open-world driving game with walkable interiors, varied vehicles, an expanding mission campaign and open-map multiplayer. This document records requested development work; it does not mean these features are implemented.

The local repository is `fc95k6rjcz-spec/jack-the-streets`. Current local changes add city buses and delivery trucks to traffic, with distinct procedural top-down bodywork, slower traffic speeds and heavier mass. Local changes also lock about 45% of ordinary traffic vehicles and all designated supercars, blocking entry while locked. These changes have passed syntax and focused logic checks, but need browser playtesting and are not published.

## World and map

- Give streets names and display suburb labels.
- Replace basic roads with a richer Sydney-style network: three-lane freeways, overpasses, underpasses and harbour tunnels.
- Add bridges throughout the map.
- Add or improve pedestrian crossings and pedestrians on streets.
- Add street lights and street trees.
- Give buildings working doors so players can walk in and out.
- Rework the convenience store interior.
- Make car parks driveable and usable as hiding places from police.
- Make petrol stations drive-in locations where vehicles can refuel.
- Add helipads.
- Add bus stops.

## Vehicles and presentation

Add a broader fleet with polished top-down views:

- Ferrari 458.
- Porsche Macan.
- Mercedes SL500.
- Mercedes G-Wagon.
- Ford Raptor.
- Subaru STI.
- Buses.
- Trucks, including heavy transport trucks.
- Garbage trucks.
- Crane trucks.

Use the supplied super-car image as a visual reference for the premium fleet, finishes and colour variety. Preserve readable vehicle silhouettes at gameplay scale.

Provide authentic, recognisably different engine sounds per car, including the Ferrari and Subaru STI. Improve driving mechanics overall. Specific handling targets still need to be agreed through playtesting.

## Vehicle ownership, security and purchases

- Premium cars are purchased with real money; Ferrari 458 is an example.
- Each premium car costs $7.99 and is owned for life.
- Offer colour options, including yellow and red.
- Allow upgrades to engines, armour and security, with tyres also part of the upgrade offering.
- Upgrade prices start at $4.99 for a new engine and rise to $27 for tyres and armour. The exact intermediate price ladder and whether $27 is a package or an individual upgrade remain to be defined.
- Some vehicle doors are locked. Premium cars must not be instantly stealable: drivers lock their doors, and some drivers are armed and resist theft.
- Support legitimate purchases by tapping a credit card, alongside robbery interactions.

Currency, purchase platform, account ownership/restoration rules and the distinction between in-game card payments and real-money checkout remain to be specified. Do not treat displayed prices as an implemented payment system.

## Police, combat and helicopters

- Improve helicopter flight behaviour; current movement looks odd.
- Military helicopters should fire missiles.
- Police should deploy spike strips that destroy tyres.
- Fix the punching animation.
- Players can leave vehicles and use weapons, including a machine gun and rocket launcher.
- Car parks should offer useful police-evasion opportunities.
- Vehicle theft should respect door locks and driver resistance, including armed drivers where applicable.

## Mission campaign

Target approximately 300 missions, escalating in complexity. The ideas below are the captured mission list and mission families, not a completed set of 300 authored missions.

| Mission or family | Requested scenario |
| --- | --- |
| Sister’s netball run | Drop the player’s sister at netball within a time limit. |
| Apple Store robbery | Rob an Apple Store. |
| Uber driving | Receive calls, pick up passengers and deliver them to their destinations. |
| Dinosaur transport | Move a dinosaur across town in a heavy truck without alerting police; Jurassic Park-style inspiration. |
| Night street racing | Tokyo Drift-style races with crowds, laser lights and dance music. |
| Heist crew pickups | Pick up crew members from heist jobs. |
| General transport | Passenger and other transport assignments. |
| Deliveries | General delivery missions. |

Add an in-game SMS system to deepen mission delivery and world interaction. Exact message flows and how calls/SMS connect to mission acceptance remain to be designed.

Develop the campaign from these families with increasing challenge rather than treating the target count as permission to invent 300 approved mission plots. A detailed mission catalogue, progression structure and reward balance are subsequent work.

## Multiplayer

- Provide an open map that anyone can join.
- Let players compete for missions.
- Define shared mission availability, acceptance, completion and rewards before implementation so competing players see consistent outcomes.

Player capacity, hosting, persistence, matchmaking and handling of simultaneous mission claims remain design decisions.

## Shelved or removed scope

- Boats, trailers and island expansion are shelved for now because of complexity. Do not expand these systems as part of this brief.
- Soccer and basketball ideas are scrapped.

## Suggested delivery order

This is a proposed implementation sequence, not an additional approved feature list.

1. Improve core driving, theft rules, combat animation and helicopter behaviour; playtest the existing local bus, truck and lock changes.
2. Improve the map foundation: roads, crossings, bridges, labels, doors and usable destinations.
3. Expand the polished fleet, vehicle audio and ownership/upgrade interfaces; define and integrate real purchases separately.
4. Build mission and SMS systems, then expand the authored campaign toward approximately 300 missions.
5. Implement and test shared-map multiplayer and competition for missions.

## Follow-up specifications needed

- Map scale, suburb boundaries and the intended three-lane freeway layout.
- Vehicle-by-vehicle specifications, artwork and audio sources.
- Premium ownership, colour and upgrade catalogue; currency and exact prices.
- Locked-car interaction beyond blocked entry and the rules for armed driver resistance.
- Mission progression, difficulty, payouts and detailed individual mission scripts.
- Multiplayer session size, persistence and mission competition rules.

The immediate requested deliverable is this logged development brief. Implementation of the wider roadmap is future work.
