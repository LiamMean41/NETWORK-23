/* Directions: A/B points from map taps or typed addresses, route drawing, readout. */

import { map } from "./map.js";
import { getPalette } from "./palettes.js";
import { route } from "./osrm.js";
import { geocode, geocodeList } from "./geocode.js";
import { renderSteps, hideSteps } from "./steps.js";

const ri=document.getElementById("route-info");
let routeMode=false, ptA=null, ptB=null, mkA=null, mkB=null;

/* ---- readout ---- */
function setRI(txt,accent){
  ri.textContent=txt;
  ri.style.color       = accent ? "var(--accent)" : "var(--hud)";
  ri.style.borderColor = accent ? "var(--accent)" : "var(--hud)";
  ri.classList.remove("hidden");
}
const hideRI=()=>ri.classList.add("hidden");

/* ---- markers ---- */
function mark(c,label){
  const el=document.createElement("div"); el.className="rmark";
  const s=document.createElement("span"); s.textContent=label; el.appendChild(s);
  const m=new maplibregl.Marker({element:el,anchor:"center",draggable:true}).setLngLat(c).addTo(map);
  m.on("dragend",()=>{ const l=m.getLngLat(); if(label==="A") ptA=[l.lng,l.lat]; else ptB=[l.lng,l.lat]; commit(); });
  return m;
}
function place(which,ll){
  if(which==="A"){ if(mkA)mkA.remove(); ptA=ll; mkA=mark(ll,"A"); }
  else          { if(mkB)mkB.remove(); ptB=ll; mkB=mark(ll,"B"); }
}
function clearRoute(clearInputs){
  ptA=ptB=null;
  if(mkA){ mkA.remove(); mkA=null; }
  if(mkB){ mkB.remove(); mkB=null; }
  if(map.getSource("route")) map.getSource("route").setData({type:"FeatureCollection",features:[]});
  if(clearInputs){ const f=document.getElementById("addrA"), t=document.getElementById("addrB"); if(f)f.value=""; if(t)t.value=""; }
  hideSteps();
  document.querySelectorAll(".ac").forEach(a=>{ a.classList.remove("on"); a.innerHTML=""; });
}

/* ---- route geometry ---- */
function drawRoute(geom){
  const data={type:"Feature",properties:{},geometry:geom};
  if(map.getSource("route")){ map.getSource("route").setData(data); return; }
  const p=getPalette();
  map.addSource("route",{type:"geojson",data});
  map.addLayer({ id:"route-glow", type:"line", source:"route",
    layout:{"line-cap":"round","line-join":"round"},
    paint:{"line-color":p.accent,"line-width":11,"line-blur":6,"line-opacity":.30} });
  map.addLayer({ id:"route-line", type:"line", source:"route",
    layout:{"line-cap":"round","line-join":"round"},
    paint:{"line-color":p.accent,"line-width":2.6,"line-opacity":.95,"line-dasharray":[2,1.2]} });
}

/* frame the whole path — extend bounds over every coordinate (fixes the globe-wrap jump) */
function fitRoute(geom){
  const cs=geom.coordinates; if(!cs||!cs.length) return;
  const b=new maplibregl.LngLatBounds(cs[0],cs[0]);
  for(const c of cs) b.extend(c);
  map.fitBounds(b,{ padding:{top:96,bottom:132,left:48,right:48}, maxZoom:16,
                    bearing:map.getBearing(), pitch:map.getPitch(), duration:1400 });
}

/* ---- flow ---- */
async function plot(){
  setRI("plotting route…",false);
  try{
    const rt=await route(ptA,ptB);
    drawRoute(rt.geometry);
    const km=(rt.distance/1000).toFixed(1), min=Math.round(rt.duration/60);
    setRI(`${km} km · ${min} min · drive`, true);
    fitRoute(rt.geometry);
    renderSteps(rt);
  }catch(err){ setRI("no route — "+(err.message||"uplink down"), true); hideSteps(); }
}
/* decide what to do after any point changes */
async function commit(){
  if(ptA && ptB){ await plot(); return; }
  const only=ptA||ptB;
  setRI(ptA ? "origin set — set destination" : "destination set — set origin", false);
  if(only) map.easeTo({ center:only, duration:800, essential:true });
}
async function resolveField(which,input){
  const q=input.value.trim(); if(!q) return;
  setRI(which==="A"?"locating origin…":"locating destination…",false);
  try{ place(which, await geocode(q)); await commit(); }
  catch(err){ setRI((which==="A"?"origin":"destination")+" not found",true); }
}

/* ---- suggestion dropdown ---- */
function renderAC(ac, items, onPick){
  ac.innerHTML="";
  items.forEach(it=>{
    const o=document.createElement("div"); o.className="opt"; o.textContent=it.name;
    o.addEventListener("click",()=>onPick(it));
    ac.appendChild(o);
  });
  ac.classList.toggle("on", items.length>0);
}
function wireField(which, input, ac){
  let timer=null;
  const pick=it=>{
    input.value=it.name.split(",").slice(0,2).join(",").trim();
    ac.classList.remove("on"); ac.innerHTML="";
    place(which,[it.lon,it.lat]); commit();
  };
  input.addEventListener("input",()=>{
    const q=input.value.trim(); clearTimeout(timer);
    if(q.length<3){ ac.classList.remove("on"); ac.innerHTML=""; return; }
    timer=setTimeout(async()=>{ try{ renderAC(ac, await geocodeList(q), pick); }catch(e){} },600);
  });
  input.addEventListener("keydown",ev=>{
    if(ev.key==="Enter"){
      ev.preventDefault();
      const first=ac.querySelector(".opt");
      if(first) first.click(); else resolveField(which,input);
    } else if(ev.key==="Escape"){ ac.classList.remove("on"); }
  });
}

export function initDirections(){
  const boxEl=document.getElementById("routebox");
  const addrA=document.getElementById("addrA");
  const addrB=document.getElementById("addrB");

  wireField("A",addrA,document.getElementById("acA"));
  wireField("B",addrB,document.getElementById("acB"));

  document.getElementById("tRoute").addEventListener("click",e=>{
    routeMode=!routeMode;
    e.currentTarget.classList.toggle("on",routeMode);
    boxEl.classList.toggle("on",routeMode);
    map.getCanvas().style.cursor = routeMode ? "crosshair" : "";
    clearRoute(true);
    if(routeMode) setRI("type an address or tap the map",false); else hideRI();
  });

  map.on("click",e=>{
    if(!routeMode) return;
    const c=[e.lngLat.lng,e.lngLat.lat];
    if(!ptA) place("A",c);
    else if(!ptB) place("B",c);
    else { clearRoute(false); place("A",c); }
    commit();
  });

  document.getElementById("rPlot").addEventListener("click",async()=>{
    try{
      if(!ptA && addrA.value.trim()) place("A", await geocode(addrA.value.trim()));
      if(!ptB && addrB.value.trim()) place("B", await geocode(addrB.value.trim()));
      if(ptA && ptB) await plot();
      else setRI("enter origin and destination",false);
    }catch(err){ setRI("address not found",true); }
  });

  document.getElementById("rClear").addEventListener("click",()=>{
    clearRoute(true); setRI("type an address or tap the map",false);
  });
}
