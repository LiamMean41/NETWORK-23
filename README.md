# NETWORK 23 — Terrain Scan

Retro CRT-styled OpenStreetMap terminal: MapLibre GL vector tiles from OpenFreeMap,
geocoding via Nominatim, driving directions via the public OSRM demo server.

## Running

It must be served over HTTP — browsers block both MapLibre's worker and ES modules on `file://`.

```
python3 -m http.server
```

Then open <http://localhost:8000/>.

## Layout

```
index.html          markup only — HUD, control bar, directions panel, boot screen
css/
  base.css          palette custom properties, reset, map surface, MapLibre overrides
  effects.css       CRT layer: grid, scanlines, vignette, flicker + reduced-motion
  hud.css           corner brackets, header, reticle, telemetry, status
  controls.css      bottom control bar and .btn styling
  directions.css    routing panel, autocomplete, turn-by-turn, route readout, A/B markers
  boot.css          uplink / boot overlay
js/
  main.js           entry point; wires everything together
  palettes.js       amber / cyan / phosphor schemes + CSS variable application
  locations.js      camera presets for the location buttons
  map-style.js      MapLibre style spec built from OpenMapTiles layers
  map.js            map instance + in-place restyle on palette change
  telemetry.js      lat/lon/zoom/bearing/pitch readout
  boot.js           tile-uplink detection and the boot overlay
  controls.js       control bar behaviour (buildings, scan, orbit, palette, north, reset)
  directions.js     A/B points, route drawing, address fields
  geocode.js        Nominatim lookup
  osrm.js           OSRM route request
  steps.js          turn-by-turn instruction rendering
```

`maplibregl` is a global loaded from CDN in `index.html`; the modules use it directly.

Data © OpenStreetMap contributors (ODbL) · tiles © OpenFreeMap / OpenMapTiles · routing © OSRM.
