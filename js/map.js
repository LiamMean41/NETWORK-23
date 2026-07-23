/* The map instance itself, plus in-place repainting when the palette changes.
   maplibregl is a global from the CDN <script> tag in index.html. */

import { getPalette } from "./palettes.js";
import { HOME } from "./locations.js";
import { buildStyle } from "./map-style.js";

export const map = new maplibregl.Map({
  container:"map",
  style:buildStyle(getPalette()),
  center:HOME.center, zoom:HOME.zoom, pitch:HOME.pitch, bearing:HOME.bearing,
  attributionControl:{ compact:true, customAttribution:"OpenFreeMap © OpenMapTiles · routing © OSRM · data © OpenStreetMap (ODbL)" },
  maxPitch:75, dragRotate:true, hash:false
});
map.touchZoomRotate.enableRotation();

map.on("error",err=>console.warn("[map]",err && err.error ? err.error.message : err));

/* repaint layers in-place (no style reload) so the camera stays put */
export function restyle(p){
  map.setPaintProperty("bg","background-color",p.bg);
  map.setPaintProperty("water","fill-color",p.water);
  map.setPaintProperty("water","fill-outline-color",p.mid);
  map.setPaintProperty("waterway","line-color",p.mid);
  map.setPaintProperty("park","line-color",p.dim);
  map.setPaintProperty("boundary","line-color",p.dim);
  map.setPaintProperty("road-glow","line-color",p.hud);
  map.setPaintProperty("road","line-color",["match",["get","class"],["motorway","trunk","primary"],p.bright,p.hud]);
  map.setPaintProperty("bld-edge","line-color",p.hud);
  map.setPaintProperty("bld-3d","fill-extrusion-color",p.bld);
  ["road-label","place-label"].forEach(id=>{
    map.setPaintProperty(id,"text-color",p.bright);
    map.setPaintProperty(id,"text-halo-color",p.bg);
  });
  ["route-glow","route-line"].forEach(id=>{ if(map.getLayer(id)) map.setPaintProperty(id,"line-color",p.accent); });
}
