/* Entry point — wires the map to the HUD, controls and directions modules. */

import { getPalette, applyCssPalette } from "./palettes.js";
import "./map.js";
import { initTelemetry } from "./telemetry.js";
import { initBoot } from "./boot.js";
import { initControls } from "./controls.js";
import { initDirections } from "./directions.js";

applyCssPalette(getPalette());
initTelemetry();
initBoot();
initControls();
initDirections();
