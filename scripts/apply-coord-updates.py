"""Apply coordinate corrections from scripts/coord-updates.json to
data/churches.csv. Each update: {id, lat, lng, confidence, source, note}.
Prints every change; refuses unknown ids.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHURCHES = ROOT / "data" / "churches.csv"
UPDATES = Path(__file__).resolve().parent / "coord-updates.json"

updates = {u["id"]: u for u in json.load(UPDATES.open(encoding="utf-8"))}

with CHURCHES.open(encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    fields = reader.fieldnames
    rows = list(reader)

ids = {r["id"] for r in rows}
unknown = set(updates) - ids
if unknown:
    raise SystemExit(f"unknown ids in updates: {sorted(unknown)}")

changed = 0
for r in rows:
    u = updates.get(r["id"])
    if not u:
        continue
    old = (r["lat"], r["lng"])
    r["lat"], r["lng"] = str(u["lat"]), str(u["lng"])
    changed += 1
    print(f"{r['id']}: {old[0]},{old[1]} -> {r['lat']},{r['lng']}  [{u['confidence']}] {u['note']}")

with CHURCHES.open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

print(f"\nupdated {changed} rows in {CHURCHES}")
