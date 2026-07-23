/* Address lookup via Nominatim (keyless OSM). */

const NOMINATIM="https://nominatim.openstreetmap.org/search";

export async function geocodeList(q){
  const url=NOMINATIM+"?format=jsonv2&addressdetails=0&limit=5&q="+encodeURIComponent(q);
  const res=await fetch(url,{ headers:{ "Accept":"application/json" } });
  const d=await res.json();
  return Array.isArray(d) ? d.map(x=>({ name:x.display_name, lon:parseFloat(x.lon), lat:parseFloat(x.lat) })) : [];
}

/* best match only, as [lon,lat] */
export async function geocode(q){
  const list=await geocodeList(q);
  if(!list.length) throw new Error("address not found");
  return [list[0].lon, list[0].lat];
}
