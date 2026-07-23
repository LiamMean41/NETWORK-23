/* Custom MapLibre style built from OpenFreeMap raw vector tiles. */

export function buildStyle(p){
  /* road width ramp; m scales the whole ramp so the glow underlay can be fatter than the crisp line */
  const rw = (m)=>{ const s=(a)=> m===1?a:["*",a,m]; return ["interpolate",["exponential",1.4],["zoom"],
    11,s(["match",["get","class"],["motorway","trunk"],1.4,["primary"],1.0,["secondary","tertiary"],0.55,0.25]),
    16,s(["match",["get","class"],["motorway","trunk"],3.4,["primary"],2.5,["secondary","tertiary"],1.5,["minor","service","track"],0.9,0.55]),
    19,s(["match",["get","class"],["motorway","trunk"],8,["primary"],6,["secondary","tertiary"],4,["minor","service","track"],2.4,1.4])
  ]; };

  return {
    version:8,
    glyphs:"https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources:{ openmaptiles:{ type:"vector", url:"https://tiles.openfreemap.org/planet" } },
    layers:[
      { id:"bg", type:"background", paint:{ "background-color":p.bg } },

      { id:"water", type:"fill", source:"openmaptiles","source-layer":"water",
        filter:["!=",["get","brunnel"],"tunnel"],
        paint:{ "fill-color":p.water, "fill-outline-color":p.mid } },

      { id:"waterway", type:"line", source:"openmaptiles","source-layer":"waterway",
        paint:{ "line-color":p.mid, "line-opacity":.6,
          "line-width":["interpolate",["exponential",1.3],["zoom"],11,0.4,20,4] } },

      { id:"park", type:"line", source:"openmaptiles","source-layer":"park", minzoom:11,
        paint:{ "line-color":p.dim, "line-dasharray":[2,3], "line-opacity":.5, "line-width":0.8 } },

      { id:"boundary", type:"line", source:"openmaptiles","source-layer":"boundary",
        filter:["all",[">=",["get","admin_level"],2],["<=",["get","admin_level"],6],["!=",["get","maritime"],1]],
        paint:{ "line-color":p.dim, "line-dasharray":[3,3], "line-opacity":.7,
          "line-width":["interpolate",["linear"],["zoom"],5,0.6,12,1.6] } },

      /* road glow underlay */
      { id:"road-glow", type:"line", source:"openmaptiles","source-layer":"transportation",
        filter:["match",["geometry-type"],["LineString","MultiLineString"],true,false],
        layout:{ "line-cap":"round","line-join":"round" },
        paint:{ "line-color":p.hud, "line-blur":3, "line-opacity":.16,
          "line-width":rw(3) } },

      /* road crisp */
      { id:"road", type:"line", source:"openmaptiles","source-layer":"transportation",
        filter:["match",["geometry-type"],["LineString","MultiLineString"],true,false],
        layout:{ "line-cap":"round","line-join":"round" },
        paint:{
          "line-color":["match",["get","class"],["motorway","trunk","primary"],p.bright,p.hud],
          "line-width":rw(1),
          "line-opacity":["interpolate",["linear"],["zoom"],
            11,["match",["get","class"],["motorway","trunk","primary","secondary"],0.9,0.28],
            14,0.9] } },

      /* building footprint edges */
      { id:"bld-edge", type:"line", source:"openmaptiles","source-layer":"building", minzoom:14,
        paint:{ "line-color":p.hud, "line-opacity":.35, "line-width":0.6 } },

      /* extruded volumes */
      { id:"bld-3d", type:"fill-extrusion", source:"openmaptiles","source-layer":"building", minzoom:14,
        paint:{
          "fill-extrusion-color":p.bld,
          "fill-extrusion-base":["get","render_min_height"],
          "fill-extrusion-height":["get","render_height"],
          "fill-extrusion-opacity":0.28 } },

      /* labels */
      { id:"road-label", type:"symbol", source:"openmaptiles","source-layer":"transportation_name", minzoom:13.5,
        filter:["match",["get","class"],["motorway","trunk","primary","secondary","tertiary"],true,false],
        layout:{ "symbol-placement":"line",
          "text-field":["coalesce",["get","name:latin"],["get","name"]],
          "text-font":["Noto Sans Regular"], "text-size":10, "text-letter-spacing":0.12,
          "text-transform":"uppercase" },
        paint:{ "text-color":p.bright, "text-halo-color":p.bg, "text-halo-width":1.4 } },

      { id:"place-label", type:"symbol", source:"openmaptiles","source-layer":"place",
        filter:["match",["get","class"],["city","town","suburb","neighbourhood","village"],true,false],
        layout:{ "text-field":["coalesce",["get","name:latin"],["get","name"]],
          "text-font":["Noto Sans Regular"], "text-transform":"uppercase",
          "text-letter-spacing":0.18, "text-max-width":8,
          "text-size":["interpolate",["linear"],["zoom"],8,10,14,13] },
        paint:{ "text-color":p.bright, "text-halo-color":p.bg, "text-halo-width":1.6, "text-opacity":.85 } }
    ]
  };
}
