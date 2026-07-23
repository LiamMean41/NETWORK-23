/* Bottom-left readout: lat / lon / zoom / bearing / pitch. */

import { map } from "./map.js";

const dms = (v,pos,neg)=>{ const h=v>=0?pos:neg; return Math.abs(v).toFixed(4)+"° "+h; };

export function updateTelemetry(){
  const c=map.getCenter();
  document.getElementById("lat").textContent = dms(c.lat,"N","S");
  document.getElementById("lon").textContent = dms(c.lng,"E","W");
  document.getElementById("zm").textContent  = "Z"+map.getZoom().toFixed(2);
  document.getElementById("brg").textContent = (((map.getBearing()%360)+360)%360).toFixed(0).padStart(3,"0")+"°";
  document.getElementById("ptc").textContent = map.getPitch().toFixed(0)+"°";
}

export function initTelemetry(){
  map.on("move",updateTelemetry);
  map.on("load",updateTelemetry);
}
