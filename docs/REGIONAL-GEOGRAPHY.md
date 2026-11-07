# Northern Beaches geographic foundation

Status: the **REGIONAL MAP** button opens a responsive, offline atlas using actual road and shoreline geometry. It supports panning, zooming, keyboard navigation and road-name inspection. Opening it pauses the game. The playable campaign remains on its existing map; this atlas does not claim to relocate existing missions, traffic or the player.

Extent: 151.14–151.34 E, 33.90–33.65 S. Extracted 8 November 2026. 29,046 connected road edges and 37 suburb labels. Land shading is illustrative: built-up areas are inferred from proximity to local roads, rather than satellite imagery or a land-use survey. Shorelines are generalised and small discrepancies are expected. No Apple Maps imagery or personal location marker is included.

## Sources and attribution

Roads: © State of New South Wales (Spatial Services, a business unit of the Department of Customer Service NSW). For current information go to spatial.nsw.gov.au. NSW Transport Theme road segment layer:
https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Transport_Theme_multiCRS/FeatureServer/5

Water bodies: NSW Hydrography water-area layer:
https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Hydrography/MapServer/10

Shoreline: © Commonwealth of Australia (Geoscience Australia) 2016. Australian Shoreline, nominal 1:250,000:
https://services.ga.gov.au/gis/rest/services/Australian_Shoreline/MapServer/0

Licensed CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
NSW attribution policy: https://www.spatial.nsw.gov.au/copyright
Adaptations: clipped to region, projected to game coordinates, simplified, filtered to operational roads through local-road hierarchy, largest endpoint-connected network retained, degree-two edges merged, shoreline polygonised with water areas removed, illustrative terrain raster encoded as runs. Bridge/tunnel flags are approximate and must be reviewed before gameplay use.

## Regeneration

The committed asset requires no external service at runtime. To regenerate, provide the three source extracts (`roads.geojson`, `shore.geojson`, `hydro-all.json`) in a directory, install Pillow and Shapely in an isolated Python environment and run `python scripts/build-geography.py EXTRACT_DIRECTORY`. The source script documents field selection and transformations. Ordinary `npm run build` does not require these packages.

## Driving-world migration still required

Replace the campaign's grid-dependent collision, road drawing, traffic spawning/steering, GPS routing, mission locations and multiplayer coordinate bounds together. Stream nearby buildings and scenery rather than materialising the whole region. Validate connected harbour crossings, road access to all shops, starter-garage onboarding and mobile frame rate before switching the campaign. Keep regional map and playable positions distinct until then.
