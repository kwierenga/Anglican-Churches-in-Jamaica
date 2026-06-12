#!/usr/bin/env python
"""Match churches.csv rows against OSM places of worship (data/osm-pow.json)
and propose coordinate corrections.

A proposal is made when an OSM place of worship has a matching dedication
name and is within a plausible distance of the current coords (placeholder
rows get a wider search radius). Writes coord-osm-matches.md.
"""
import csv
import json
import math
import os
import re
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHURCHES = os.path.join(ROOT, "data", "churches.csv")
POW = os.path.join(ROOT, "data", "osm-pow.json")
OUT = os.path.join(ROOT, "coord-osm-matches.md")

STOP = {"church", "anglican", "the", "of", "chapel", "mission", "parish",
        "old", "ruins", "ruin", "and", "all", "angels", "st", "saint"}

# OSM names containing these are other denominations — never propose them
WRONG_DENOM = re.compile(
    r"catholic|baptist|adventist|pentecostal|methodist|moravian|latter-?day"
    r"|new testament|gospel|apostolic|united|jehovah|kingdom hall|mosque"
    r"|salvation army|church of god|nazarene|brethren|quaker|presbyterian",
    re.I,
)


def norm_tokens(name: str) -> set:
    s = name.lower()
    s = s.replace("’", "'").replace("`", "'")
    s = re.sub(r"\bsaint\b", "st", s)
    s = re.sub(r"st\.\s*", "st ", s)
    s = re.sub(r"'s\b", "", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    toks = {t for t in s.split() if t and t not in STOP}
    return toks


def dedication(name: str) -> set:
    """Tokens that identify the dedication, e.g. {'st','matthew'}."""
    return norm_tokens(name)


def haversine_m(lat1, lng1, lat2, lng2):
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def decimal_places(s):
    if "." not in s:
        return 0
    return len(s.split(".")[1].rstrip("0"))


def is_round(v):
    return abs((v * 20) - round(v * 20)) < 1e-3


churches = list(csv.DictReader(open(CHURCHES, encoding="utf-8")))
pow_rows = json.load(open(POW, encoding="utf-8"))
named = [p for p in pow_rows if p["name"]]
for p in named:
    p["toks"] = norm_tokens(p["name"])

exact_key = Counter((r["lat"], r["lng"]) for r in churches)

results = []
for r in churches:
    try:
        lat, lng = float(r["lat"]), float(r["lng"])
    except ValueError:
        continue
    dp = min(decimal_places(r["lat"]), decimal_places(r["lng"]))
    placeholder = dp <= 2 or (is_round(lat) and is_round(lng)) or exact_key[(r["lat"], r["lng"])] > 1
    radius = 15000 if placeholder else 5000

    ded = dedication(r["name"])
    town_toks = norm_tokens(r["town"])
    cands = []
    for p in named:
        d = haversine_m(lat, lng, p["lat"], p["lng"])
        if d > radius:
            continue
        if not ded & p["toks"]:
            continue
        denom = p["denomination"].lower()
        if denom and denom != "anglican":
            continue
        if not denom and WRONG_DENOM.search(p["name"]):
            continue
        # name similarity: overlap of dedication tokens
        overlap = len(ded & p["toks"]) / max(1, len(ded))
        score = overlap * 10
        if p["denomination"].lower() == "anglican":
            score += 5
        if "anglican" in p["name"].lower():
            score += 5
        if town_toks & p["toks"]:
            score += 2
        # prefer closer
        score -= d / 5000
        cands.append((score, d, p))
    if not cands:
        continue
    cands.sort(key=lambda x: -x[0])
    score, d, p = cands[0]
    moved = d > 120  # only report meaningful moves
    if moved:
        results.append({
            "id": r["id"], "name": r["name"], "town": r["town"],
            "parish": r["parish"], "cur": (lat, lng),
            "new": (p["lat"], p["lng"]), "dist": d, "osm": p,
            "placeholder": placeholder, "score": score,
        })

results.sort(key=lambda x: (-x["placeholder"], -x["dist"]))
with open(OUT, "w", encoding="utf-8") as w:
    w.write("# OSM place-of-worship coordinate matches\n\n")
    w.write(f"{len(results)} proposed moves (>120 m) out of {len(churches)} churches.\n\n")
    w.write("| PH | Church | Town | Parish | Current | OSM match | Proposed | Move |\n")
    w.write("|---|---|---|---|---|---|---|---|\n")
    for x in results:
        ph = "**YES**" if x["placeholder"] else ""
        anglican = " (anglican)" if x["osm"]["denomination"].lower() == "anglican" or "anglican" in x["osm"]["name"].lower() else ""
        w.write(
            f"| {ph} | {x['name']} | {x['town']} | {x['parish']} | "
            f"`{x['cur'][0]:.5f}, {x['cur'][1]:.5f}` | {x['osm']['name']}{anglican} "
            f"[{x['osm']['osm']}] | `{x['new'][0]:.6f}, {x['new'][1]:.6f}` | "
            f"{x['dist']:.0f} m |\n"
        )

print(f"wrote {OUT}: {len(results)} proposals")
for x in results:
    flag = "PH" if x["placeholder"] else "  "
    print(f"  {flag} {x['dist']:>6.0f}m  {x['name']} ({x['town']}, {x['parish']})"
          f" -> {x['osm']['name']} [{x['osm']['osm']}]")
