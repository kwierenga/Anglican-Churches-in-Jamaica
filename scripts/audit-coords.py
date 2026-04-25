#!/usr/bin/env python
"""Heuristic audit of coordinate quality in churches.csv.

Flags candidates for fixing without doing any external lookups. Output: a
markdown report sorted from most-suspect to least.

Heuristics:
  1. Low precision  — fewer than 4 decimal places on either axis.
  2. Round-number   — coords end in .00, .05, .10, .15, .20, etc. (multiples of 0.05).
  3. Cluster suspect — multiple churches share the *exact* same coords.
  4. Far from cluster — Z-score > 2 vs. parish median (for parishes with >5 churches).

A church can be flagged for multiple reasons, scored cumulatively. Higher
scores → more likely to be a placeholder.
"""
import csv
import os
import statistics
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHURCHES = os.path.join(ROOT, "data/churches.csv")
OUT = os.path.join(ROOT, "coord-audit.md")


def decimal_places(s):
    if "." not in s:
        return 0
    return len(s.split(".")[1].rstrip("0"))


def is_round(v):
    """True if v is a multiple of 0.05 within tolerance."""
    if v is None:
        return False
    return abs((v * 20) - round(v * 20)) < 1e-3


churches = []
with open(CHURCHES, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        churches.append(row)


# Cluster suspect: count churches sharing exact coords
exact_key = Counter()
for r in churches:
    exact_key[(r["lat"], r["lng"])] += 1


# Parish-level cluster: median per axis, MAD threshold
by_parish_lat = defaultdict(list)
by_parish_lng = defaultdict(list)
for r in churches:
    try:
        by_parish_lat[r["parish"]].append(float(r["lat"]))
        by_parish_lng[r["parish"]].append(float(r["lng"]))
    except ValueError:
        continue

parish_stats = {}
for p in by_parish_lat:
    if len(by_parish_lat[p]) >= 5:
        med_lat = statistics.median(by_parish_lat[p])
        med_lng = statistics.median(by_parish_lng[p])
        mad_lat = statistics.median([abs(x - med_lat) for x in by_parish_lat[p]]) or 0.001
        mad_lng = statistics.median([abs(x - med_lng) for x in by_parish_lng[p]]) or 0.001
        parish_stats[p] = (med_lat, med_lng, mad_lat, mad_lng)


flagged = []
for r in churches:
    lat_s, lng_s = r["lat"], r["lng"]
    try:
        lat = float(lat_s)
        lng = float(lng_s)
    except ValueError:
        flagged.append((10, r, "unparseable coords"))
        continue
    score = 0
    reasons = []
    # Heuristic 1: low precision
    p = min(decimal_places(lat_s), decimal_places(lng_s))
    if p < 4:
        score += 4 - p  # score 1-4
        reasons.append(f"low precision ({p} dp)")
    # Heuristic 2: round-number
    if is_round(lat) and is_round(lng):
        score += 2
        reasons.append("round-number coords")
    # Heuristic 3: cluster
    if exact_key[(lat_s, lng_s)] > 1:
        score += 3
        reasons.append(f"shares coords with {exact_key[(lat_s, lng_s)] - 1} other church(es)")
    # Heuristic 4: far from parish median
    s = parish_stats.get(r["parish"])
    if s:
        med_lat, med_lng, mad_lat, mad_lng = s
        z_lat = abs(lat - med_lat) / mad_lat
        z_lng = abs(lng - med_lng) / mad_lng
        # threshold "modified Z": MAD-based, ~3.5 means very suspect
        if z_lat > 5 or z_lng > 5:
            score += 3
            reasons.append(f"outlier in {r['parish']} (Z lat={z_lat:.1f}, Z lng={z_lng:.1f})")
        elif z_lat > 3 or z_lng > 3:
            score += 1
            reasons.append(f"borderline outlier in {r['parish']}")
    if reasons:
        flagged.append((score, r, "; ".join(reasons)))


flagged.sort(key=lambda x: -x[0])

with open(OUT, "w", encoding="utf-8") as w:
    w.write(f"# Coordinate audit — {len(flagged)}/{len(churches)} suspect rows\n\n")
    w.write("Score reflects how many heuristics fired. **High score** ≈ likely placeholder.\n\n")
    w.write("Heuristics:\n")
    w.write("- low precision (≤3 decimal places)\n")
    w.write("- round-number coords (multiples of 0.05)\n")
    w.write("- coords shared verbatim with another church\n")
    w.write("- outlier from parish median (modified Z-score)\n\n")
    w.write("---\n\n")
    w.write("| Score | Church | Town | Parish | Coords | Reasons |\n")
    w.write("|---|---|---|---|---|---|\n")
    for score, r, reasons in flagged:
        w.write(f"| {score} | {r['name']} | {r['town']} | {r['parish']} | `{r['lat']}, {r['lng']}` | {reasons} |\n")

print(f"wrote {OUT}")
print(f"  {len(flagged)} flagged churches out of {len(churches)}")
print(f"  highest score: {flagged[0][0] if flagged else 0}")
