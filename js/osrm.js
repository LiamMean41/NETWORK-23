/* Routing via the public keyless OSRM demo server. */

const OSRM="https://router.project-osrm.org/route/v1/driving/";

export async function route(a,b){
  const url=OSRM+`${a[0]},${a[1]};${b[0]},${b[1]}?overview=full&geometries=geojson&steps=true`;
  const res=await fetch(url);
  const d=await res.json();
  if(d.code!=="Ok"||!d.routes||!d.routes.length) throw new Error(d.message||"no route");
  return d.routes[0];
}
