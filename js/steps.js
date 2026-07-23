/* Turn-by-turn rendering: OSRM manoeuvres -> arrow glyph + English instruction. */

const stepsBox=document.getElementById("steps");

function fmtDist(m){ return m>=1000 ? (m/1000).toFixed(1)+" km" : Math.round(m)+" m"; }
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function compass(b){ if(b==null) return ""; return ["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round((b%360)/45)%8]; }

function stepArrow(s){
  const m=s.maneuver, mod=m.modifier||"", t=m.type||"";
  if(t==="arrive") return "◉";
  if(t==="depart") return "◇";
  if(t.indexOf("roundabout")>=0||t==="rotary") return "↻";
  if(mod==="uturn") return "↩";
  if(mod.indexOf("left")>=0)  return mod.indexOf("slight")>=0?"↖":(mod.indexOf("sharp")>=0?"⬐":"←");
  if(mod.indexOf("right")>=0) return mod.indexOf("slight")>=0?"↗":(mod.indexOf("sharp")>=0?"⬎":"→");
  return "↑";
}

function stepText(s){
  const m=s.maneuver, mod=m.modifier||"", name=s.name||"", on=name?" onto "+name:"";
  switch(m.type){
    case "depart": return "Head "+(compass(m.bearing_after)||"out")+(name?" on "+name:"");
    case "arrive": return "Arrive at destination";
    case "turn": return "Turn "+(mod||"")+on;
    case "new name": return "Continue"+(name?" onto "+name:"");
    case "merge": return "Merge"+(mod?" "+mod:"")+on;
    case "on ramp": return "Take the ramp"+(mod?" "+mod:"")+on;
    case "off ramp": return "Take the exit"+(mod?" "+mod:"")+on;
    case "fork": return "Keep "+(mod||"straight")+on;
    case "end of road": return "Turn "+(mod||"")+on;
    case "continue": return "Continue "+(mod&&mod!=="straight"?mod:"straight")+(name?" on "+name:"");
    case "roundabout": case "rotary": return "At the roundabout, take exit "+(m.exit||"?")+on;
    case "roundabout turn": return "At the roundabout, turn "+(mod||"")+on;
    default: { const cap=m.type?m.type[0].toUpperCase()+m.type.slice(1):"Proceed"; return cap+(mod?" "+mod:"")+on; }
  }
}

export function hideSteps(){ if(stepsBox){ stepsBox.classList.remove("on"); stepsBox.innerHTML=""; } }

export function renderSteps(rt){
  const steps=(rt.legs||[]).reduce((a,l)=>a.concat(l.steps||[]),[]);
  if(!steps.length){ hideSteps(); return; }
  const km=(rt.distance/1000).toFixed(1), min=Math.round(rt.duration/60);
  let html=`<div class="shead"><span>Route · ${steps.length} steps</span><span>${km} km · ${min} min</span></div>`;
  html+=steps.map(s=>`<div class="step"><span class="ar">${stepArrow(s)}</span><span>${esc(stepText(s))}<div class="d">${fmtDist(s.distance)}</div></span></div>`).join("");
  stepsBox.innerHTML=html;
  stepsBox.classList.add("on");
}
