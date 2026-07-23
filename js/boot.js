/* Boot overlay: waits for the first tile source to load, or explains why it never did. */

import { map } from "./map.js";

const UPLINK_TIMEOUT = 9000;

export function initBoot(){
  let uplink=false;
  const boot=document.getElementById("boot");
  const bootmsg=document.getElementById("bootmsg");
  const boothint=document.getElementById("boothint");
  const link=document.getElementById("link");

  map.on("sourcedata",e=>{
    if(e.sourceId==="openmaptiles" && e.isSourceLoaded && !uplink){
      uplink=true; link.textContent="LOCKED"; link.style.color="var(--bright)";
      bootmsg.textContent="UPLINK ESTABLISHED"; bootmsg.classList.remove("cur");
      setTimeout(()=>boot.classList.add("hidden"),400);
      setTimeout(()=>boot.style.display="none",950);
    }
  });

  setTimeout(()=>{
    if(uplink) return;
    link.textContent="NO SIGNAL"; link.style.color="var(--accent)";
    bootmsg.textContent="TILE UPLINK BLOCKED"; bootmsg.classList.remove("cur");
    boothint.style.opacity=".85";
    boothint.innerHTML="Most likely cause: this file was opened as a file:// document. MapLibre and ES modules both need to be <b>served over http</b> — browsers block them on file://.<br><br>Run <b>python3 -m http.server</b> in this folder, then open <b>http://localhost:8000/</b><br><br>If that still fails, your network is blocking tiles.openfreemap.org.";
    boot.style.pointerEvents="auto";
  },UPLINK_TIMEOUT);
}
