#!/usr/bin/env python
"""For every coord-suspect church, query OSM Nominatim and propose a
better-precision lat/lng. Output: coord-osm-proposals.md for user review.

Usage policy: throttle to 1 req/sec, set User-Agent."""
import csv
import json
import math
import os
import re
import time
import urllib.parse
import urllib.request
import statistics
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHURCHES = os.path.join(ROOT, "data/churches.csv")
OUT = os.path.join(ROOT, "coord-osm-proposals.md")
USER_AGENT = "Anglican-Churches-Jamaica research script (klaaswierenga@gmail.com)"


def decimal_places(s):
    if "." not in s:
        return 0
    return len(s.split(".")[1].rstrip("0"))


def is_round(v):
    return abs((v * 20) - round(v * 20)) < 1e-3


def haversine_m(a, b):
    R = 6371000
    lat1, lng1 = a
    lat2, lng2 = b
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def osm_search(query):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
        "q": query, "format": "json", "limit": 5, "countrycodes": "jm",
    })
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"_error": str(e)}


# Load churches
churches = []
with open(CHURCHES, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        churches.append(row)

# Compute parish centroid (median) for sanity-check
by_parish_lat = defaultdict(list)
by_parish_lng = defaultdict(list)
for r in churches:
    try:
        by_parish_lat[r["parish"]].append(float(r["lat"]))
        by_parish_lng[r["parish"]].append(float(r["lng"]))
    except ValueError:
        continue
parish_centroid = {
    p: (statistics.median(by_parish_lat[p]), statistics.median(by_parish_lng[p]))
    for p in by_parish_lat if len(by_parish_lat[p]) >= 5
}

# Identify suspect churches (same heuristic as audit-coords.py, score >= 4)
exact_key = Counter((r["lat"], r["lng"]) for r in churches)
suspects = []
for r in churches:
    try:
        lat = float(r["lat"]); lng = float(r["lng"])
    except ValueError:
        continue
    score = 0
    p = min(decimal_places(r["lat"]), decimal_places(r["lng"]))
    if p < 4:
        score += 4 - p
    if is_round(lat) and is_round(lng):
        score += 2
    if exact_key[(r["lat"], r["lng"])] > 1:
        score += 3
    if score >= 4:
        suspects.append(r)

print(f"Suspects to query: {len(suspects)}")


def best_result(results, parish, current):
    """Pick best plausible result. Prefer church/place=village/town within
    parish, and not too far from current coords."""
    if not isinstance(results, list) or not results:
        return None
    cand = []
    for hit in results:
        lat = float(hit["lat"]); lng = float(hit["lon"])
        # Must be in Jamaica bounds
        if not (17 < lat < 19 and -79 < lng < -75):
            continue
        # Distance to current — flag the one nearest current as most likely
        # the right village (since current was at least ROUGHLY right).
        # But don't pick something <500m from a placeholder either.
        d = haversine_m((lat, lng), current)
        # Class/type hints
        cls = hit.get("class", "")
        typ = hit.get("type", "")
        score = 0
        if cls in ("amenity",) and typ in ("place_of_worship", "church"):
            score += 10
        elif cls in ("place",) and typ in ("village", "town", "hamlet", "suburb", "neighbourhood", "locality"):
            score += 5
        elif cls in ("place",) and typ == "city":
            score += 4
        # Penalize very far from current (>20km)
        if d > 20000:
            score -= 5
        # Bonus if display_name contains parish
        if parish.lower().split(".")[0].strip() in hit.get("display_name", "").lower():
            score += 3
        cand.append((score, d, lat, lng, hit))
    if not cand:
        return None
    cand.sort(key=lambda x: (-x[0], x[1]))
    return cand[0]


with open(OUT, "w", encoding="utf-8") as w:
    w.write("# OSM Nominatim coord proposals\n\n")
    w.write(f"Suspects audited: {len(suspects)}\n")
    w.write("Hits per row are limited to 5 from Nominatim. The proposed coord is the highest-scoring hit (church/place type, parish match, sane distance).\n\n")
    w.write("| Church | Town | Parish | Current | Proposed | Distance | Source / Note |\n")
    w.write("|---|---|---|---|---|---|---|\n")

    for r in suspects:
        try:
            cur = (float(r["lat"]), float(r["lng"]))
        except ValueError:
            cur = None
        # Try increasingly broad queries
        queries = [
            f'{r["name"]} Anglican {r["town"]} {r["parish"]} Jamaica',
            f'{r["name"]} {r["town"]} {r["parish"]} Jamaica',
            f'{r["town"]} {r["parish"]} Jamaica',
            f'{r["town"]} Jamaica',
        ]
        chosen = None
        for q in queries:
            time.sleep(1.1)  # respect 1 req/sec
            results = osm_search(q)
            if isinstance(results, dict) and "_error" in results:
                continue
            best = best_result(results, r["parish"], cur or (18, -77))
            if best:
                chosen = (q, best)
                break
        if not chosen:
            w.write(f"| {r['name']} | {r['town']} | {r['parish']} | `{r['lat']}, {r['lng']}` | — | — | NO OSM RESULT |\n")
            print(f"  no result: {r['town']} {r['parish']}")
            continue
        q, (score, dist, lat, lng, hit) = chosen
        cls = hit.get("class", "")
        typ = hit.get("type", "")
        disp = hit.get("display_name", "")
        note = f"{cls}/{typ}; {disp[:60]}; query=&quot;{q[:50]}…&quot;"
        w.write(f"| {r['name']} | {r['town']} | {r['parish']} | `{r['lat']}, {r['lng']}` | `{lat:.6f}, {lng:.6f}` | {dist:.0f} m | {note} |\n")
        print(f"  {r['town']} {r['parish']}: {r['lat']},{r['lng']} -> {lat:.6f},{lng:.6f} ({dist:.0f}m)")

print(f"\nwrote {OUT}")
