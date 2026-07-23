# NETWORK 23 — Terrain Scan

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A retro CRT map terminal for OpenStreetMap. Amber phosphor, scanlines, extruded buildings and
turn-by-turn directions, built on MapLibre GL JS with no build step and no API keys.

<!-- Drop a screenshot at docs/screenshot.png and uncomment:
![NETWORK 23 terminal showing amber wireframe buildings over Dublin](docs/screenshot.png)
-->

Everything runs client-side against free, keyless services: vector tiles from
[OpenFreeMap](https://openfreemap.org/), geocoding from
[Nominatim](https://nominatim.openstreetmap.org/), routing from the public
[OSRM](https://project-osrm.org/) demo server.

## Features

- **Custom vector style** — roads, water, boundaries and 3D building extrusions styled from raw
  OpenMapTiles layers, with a blurred glow underlay beneath every road.
- **Three palettes** — amber, cyan and phosphor green, swapped live via CSS custom properties and
  in-place MapLibre paint updates, so the camera never resets.
- **Directions** — set A and B by tapping the map or typing an address, drag either marker to
  re-route, get distance, duration and a turn-by-turn list.
- **CRT overlay** — grid, scanlines, vignette and a periodic flicker, all toggleable and disabled
  under `prefers-reduced-motion`.
- **Live telemetry** — latitude, longitude, zoom, bearing and pitch.
- **No dependencies to install** — MapLibre loads from CDN; the app is plain ES modules.

## Quick start

The app **must be served over HTTP**. Opening `index.html` from disk will not work: browsers block
both ES modules and MapLibre's web worker on `file://`.

```bash
git clone <your-repo-url>
cd network-23-terrain-scan
python3 -m http.server 8000
```

Open <http://localhost:8000/>. Any static server works — `npx serve`, `php -S localhost:8000`,
VS Code Live Server, or a GitHub Pages deployment straight from the repo root.

If the boot screen stalls on `TILE UPLINK BLOCKED`, either the page is not being served over HTTP
or your network is blocking `tiles.openfreemap.org`.

## Controls

| Button | Action |
| --- | --- |
| `DUBLIN` `BLANCH` `NYC` `LONDON` `TOKYO` | Fly to a camera preset |
| `◱ BUILDINGS` | Toggle 3D extrusions and footprint edges |
| `▚ SCAN` | Toggle the CRT overlay |
| `◈ ORBIT` | Slow auto-rotate; cancelled by any drag |
| `⬡ AMBER` | Cycle palette (amber → cyan → phosphor) |
| `◎ NORTH` | Face north, flatten pitch |
| `⇄ ROUTE` | Open the directions panel |
| `⌖ RESET` | Return to the home view |

Drag to pan, scroll to zoom, right-drag (or two-finger drag) to rotate and pitch up to 75°.
In route mode, the first tap sets **A**, the second sets **B**, and a third starts over.

## Project layout

```
index.html            markup only — HUD, control bar, directions panel, boot screen
css/
  base.css            palette custom properties, reset, map surface, MapLibre overrides
  effects.css         CRT layer: grid, scanlines, vignette, flicker + reduced-motion
  hud.css             corner brackets, header, reticle, telemetry, status
  controls.css        bottom control bar and .btn styling
  directions.css      routing panel, autocomplete, turn-by-turn, readout, A/B markers
  boot.css            uplink / boot overlay
js/
  main.js             entry point; wires everything together
  map.js              the map instance + in-place restyle on palette change
  map-style.js        MapLibre style spec built from OpenMapTiles layers
  palettes.js         amber / cyan / phosphor schemes + CSS variable application
  locations.js        camera presets for the location buttons
  telemetry.js        lat / lon / zoom / bearing / pitch readout
  boot.js             tile-uplink detection and the boot overlay
  controls.js         control bar behaviour
  directions.js       A/B points, route drawing, address fields
  geocode.js          Nominatim lookup
  osrm.js             OSRM route request
  steps.js            turn-by-turn instruction rendering
```

`map.js` constructs and exports the single map instance; every other module imports it rather than
passing it around. `maplibregl` itself stays a global, loaded from the CDN `<script>` tag in
`index.html`. Palette state is private to `palettes.js` and read through `getPalette()`.

## Customising

**Add a location** — add an entry to `LOC` in [`js/locations.js`](js/locations.js), then a button
with a matching `data-go` attribute in the control bar:

```js
paris: { center:[2.3364,48.8606], zoom:15.3, pitch:60, bearing:-15 }
```

```html
<button class="btn" data-go="paris">PARIS</button>
```

**Add a palette** — add an entry to `PAL` in [`js/palettes.js`](js/palettes.js) and push its key
onto `palOrder`. Every colour is consumed by both the CSS variables and the map style, so no other
file needs touching.

**Restyle the map** — layer definitions live in [`js/map-style.js`](js/map-style.js). If you change
a paint property that varies by palette, mirror it in `restyle()` in [`js/map.js`](js/map.js) so
palette switching stays consistent.

**Change the routing profile** — the OSRM endpoint is at the top of [`js/osrm.js`](js/osrm.js). Note
that the public demo server only serves the driving profile; walking or cycling needs your own OSRM
instance or a different provider.

## Third-party services

All three backends are free community infrastructure with **no SLA**. This project is fine as a
demo or personal tool, but read the policies before pointing real traffic at them:

| Service | Used for | Policy |
| --- | --- | --- |
| OpenFreeMap | Vector tiles | [openfreemap.org](https://openfreemap.org/) — free, no key, but consider self-hosting for production |
| Nominatim | Address search | [Usage policy](https://operations.osmfoundation.org/policies/nominatim/) — max 1 request/sec, no heavy or bulk use |
| OSRM demo | Driving directions | [Demo server](https://project-osrm.org/) — for demonstration only, not for production traffic |

Address suggestions are debounced to 600 ms and need at least 3 characters, which keeps typing
within Nominatim's rate limit. If you fork this into something people actually use, self-host the
tiles and routing, or move to a commercial provider.

## Browser support

Any current browser with WebGL and ES module support — Chrome, Edge, Firefox and Safari, desktop and
mobile. There is no transpilation or polyfill layer.

## Attribution

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, available under
the [Open Database License](https://opendatacommons.org/licenses/odbl/). Tiles ©
[OpenFreeMap](https://openfreemap.org/) / [OpenMapTiles](https://openmaptiles.org/). Routing ©
[OSRM](https://project-osrm.org/). Rendering by [MapLibre GL JS](https://maplibre.org/)
(3-Clause BSD).

The ODbL attribution notice is rendered by the map's attribution control and must stay visible in
any fork or deployment.

## License

Released under the [MIT License](LICENSE).

MIT covers this repository's own code and styling only. It does not extend to the data and services
the app consumes: OpenStreetMap data remains under [ODbL](https://opendatacommons.org/licenses/odbl/)
regardless of how you license your fork, and the attribution requirements in the section above still
apply. MapLibre GL JS is separately licensed under 3-Clause BSD.
