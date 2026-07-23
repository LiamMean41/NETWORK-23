/* Bottom control bar: location jumps, buildings, CRT scan, orbit, palette, north, reset. */

import { map, restyle } from "./map.js";
import { LOC, HOME } from "./locations.js";
import { cyclePalette, applyCssPalette } from "./palettes.js";

let orbit=false, raf=null;

function stopOrbit(){
  if(!orbit) return;
  orbit=false;
  if(raf) cancelAnimationFrame(raf);
  document.getElementById("tOrbit").classList.remove("on");
}
function spin(){ if(!orbit) return; map.setBearing(map.getBearing()+0.06); raf=requestAnimationFrame(spin); }

export function initControls(){
  /* location presets */
  document.querySelectorAll("[data-go]").forEach(b=>{
    b.addEventListener("click",()=>{ const l=LOC[b.dataset.go]; if(l) map.flyTo({...l,duration:2200,essential:true}); });
  });

  /* 3D buildings */
  let bld=true;
  document.getElementById("tBld").addEventListener("click",e=>{
    bld=!bld; e.currentTarget.classList.toggle("on",bld);
    const v=bld?"visible":"none";
    ["bld-3d","bld-edge"].forEach(id=>{ if(map.getLayer(id)) map.setLayoutProperty(id,"visibility",v); });
  });

  /* CRT overlay */
  const fx=document.getElementById("fx");
  document.getElementById("tScan").addEventListener("click",e=>{
    const on=fx.style.display!=="none"; fx.style.display=on?"none":"block"; e.currentTarget.classList.toggle("on",!on);
  });

  /* slow auto-rotate; any drag cancels it */
  document.getElementById("tOrbit").addEventListener("click",e=>{
    if(orbit){ stopOrbit(); return; }
    orbit=true; e.currentTarget.classList.add("on"); spin();
  });
  map.on("mousedown",stopOrbit);

  /* palette cycle */
  document.getElementById("tPal").addEventListener("click",e=>{
    const p=cyclePalette();
    e.currentTarget.textContent="⬡ "+p.label;
    applyCssPalette(p);
    restyle(p);
  });

  /* compass: centre & face north */
  document.getElementById("tNorth").addEventListener("click",()=>{
    stopOrbit();
    map.easeTo({ bearing:0, pitch:0, duration:900, essential:true });
  });

  document.getElementById("tReset").addEventListener("click",()=>{
    stopOrbit();
    map.flyTo({...HOME,duration:1800,essential:true});
  });
}
