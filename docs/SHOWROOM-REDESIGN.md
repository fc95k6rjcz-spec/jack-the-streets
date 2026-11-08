# Garage and purchase-menu redesign

The solo showroom now uses accessible front-view image cards with four filters: All Cars, My Garage, Game-Cash Cars, Premium Cars. The selected car has a large portrait, ownership badge and explicit primary action. Game-cash prices are labelled separately from real-money Apple purchases. Buy Cash stays beside the balance. Apple checkout still uses the existing verified StoreKit flow; this visual change does not publish products or enable real payments in the browser.

The car and cash purchase sheets use the same showroom palette and clearer typography. On short landscape phone screens the portrait and purchase action stay visible, with the catalogue scrolling separately. Owned-car repair and sale remain available; the starter cannot be sold. Choosing an owned car explicitly overrides the initial starter-only selection, so buying a car and driving it is meaningful.

## Artwork

Generated with the built-in image generation tool. Saved asset: `assets/showroom-front-v2.webp`. The nine formerly overhead-only portraits are a 3×3 transparent atlas: Rustbucket, Ferrari 458, Porsche Macan; Mercedes SL500, G-Wagon, Ford Raptor; Subaru STI, Coastal Sport Wagon, Rocket X. Existing front three-quarter artwork is retained for the other cars. All 28 catalogue cars use front portraits; gameplay retains its overhead sprites.

Prompt: Re-render the supplied overhead fleet and battered starter references into a polished realistic graphic-novel front three-quarter portrait atlas. Uniform eye-height camera slightly above bonnet, front bumper toward lower right, complete isolated cars in equal square cells, transparent alpha, no text or scenery. Rustbucket remains grey-green with a beige bonnet and door, dents, rust and steel wheels. Ferrari red, Macan graphite, SL500 silver convertible, G-Wagon black, Raptor orange, STI blue with gold wheels, Australian wagon silver, Rocket X yellow with black and red accents. Preserve vehicle types and use generous cell margins.
