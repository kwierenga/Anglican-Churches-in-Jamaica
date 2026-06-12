#!/usr/bin/env python
"""Fetch every place_of_worship in Jamaica from OSM Overpass and cache to
data/osm-pow.json (id, name, denomination, religion, lat, lng).

One request, building-level precision — better than Nominatim village centers.
"""
import json
import os
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "osm-pow.json")
USER_AGENT = "Anglican-Churches-Jamaica research script (klaaswierenga@gmail.com)"

QUERY = """
[out:json][timeout:180];
area["ISO3166-1"="JM"][admin_level=2]->.jm;
nwr["amenity"="place_of_worship"](area.jm);
out center tags;
"""

url = "https://overpass-api.de/api/interpreter?" + urllib.parse.urlencode({"data": QUERY})
req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
with urllib.request.urlopen(req, timeout=300) as resp:
    data = json.loads(resp.read())

rows = []
for el in data.get("elements", []):
    tags = el.get("tags", {})
    if el["type"] == "node":
        lat, lng = el.get("lat"), el.get("lon")
    else:
        c = el.get("center") or {}
        lat, lng = c.get("lat"), c.get("lon")
    if lat is None:
        continue
    rows.append({
        "osm": f'{el["type"]}/{el["id"]}',
        "name": tags.get("name", ""),
        "religion": tags.get("religion", ""),
        "denomination": tags.get("denomination", ""),
        "lat": lat,
        "lng": lng,
    })

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=1)

print(f"wrote {OUT}: {len(rows)} places of worship")
anglican = [r for r in rows if r["denomination"].lower() == "anglican"]
named = [r for r in rows if r["name"]]
print(f"  anglican-tagged: {len(anglican)}; named: {len(named)}")
