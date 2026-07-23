/* Colour schemes, shared by the CSS custom properties and the map style. */

export const PAL = {
  amber:{ label:"AMBER",   bg:"#060402", hud:"#FFB000", bright:"#FFE1A6", dim:"#8A5200", mid:"#C77E00", accent:"#FF4A2E", water:"rgba(255,176,0,0.05)", bld:"#FF9E1B" },
  cyan:{  label:"CYAN",    bg:"#02080C", hud:"#32E1FF", bright:"#BEF3FF", dim:"#125F76", mid:"#1FA6C6", accent:"#FF5470", water:"rgba(50,225,255,0.05)", bld:"#39D6FF" },
  green:{ label:"PHOSPHOR",bg:"#020806", hud:"#3BFF9E", bright:"#C4FFE0", dim:"#0F7048", mid:"#1FBE77", accent:"#FF7A1F", water:"rgba(59,255,158,0.05)", bld:"#3BFF9E" }
};

export const palOrder = ["amber","cyan","green"];

let palKey = "amber";

export const getPalette = ()=> PAL[palKey];

/* advance to the next scheme and return it */
export function cyclePalette(){
  palKey = palOrder[(palOrder.indexOf(palKey)+1)%palOrder.length];
  return PAL[palKey];
}

/* push a palette into the CSS custom properties on :root */
export function applyCssPalette(p){
  const r=document.documentElement.style;
  r.setProperty("--bg",p.bg); r.setProperty("--hud",p.hud); r.setProperty("--bright",p.bright);
  r.setProperty("--dim",p.dim); r.setProperty("--mid",p.mid); r.setProperty("--accent",p.accent);
}
