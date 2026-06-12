"""Remove duplicate (church_id, url) rows from data/media.csv.

Keeps the row with the most filled-in fields (credit/caption/license);
ties go to the earliest row. Renumbers `order` per church to a clean
1..N sequence preserving prior relative order.
"""
import csv
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "data" / "media.csv"

with MEDIA.open(encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    fields = reader.fieldnames
    rows = list(reader)

def richness(r):
    return sum(1 for k in ("caption", "credit", "license") if (r.get(k) or "").strip() and r.get(k) != "Unknown")

best = {}
order_seen = []
for i, r in enumerate(rows):
    key = (r["church_id"], r["url"])
    if key not in best:
        best[key] = (i, r)
        order_seen.append(key)
    else:
        old_i, old_r = best[key]
        if richness(r) > richness(old_r):
            best[key] = (old_i, r)  # keep original position, richer content

deduped = [best[k][1] for k in order_seen]
removed = len(rows) - len(deduped)

by_church = defaultdict(list)
for r in deduped:
    by_church[r["church_id"]].append(r)
for cid, rs in by_church.items():
    rs.sort(key=lambda r: int(r["order"] or 0))
    for n, r in enumerate(rs, 1):
        r["order"] = str(n)

with MEDIA.open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(deduped)

print(f"removed {removed} duplicate rows; {len(deduped)} rows remain")
