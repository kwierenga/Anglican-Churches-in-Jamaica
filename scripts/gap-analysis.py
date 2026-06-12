"""Console gap analysis: coverage per parish + orphan narratives/media.

Reads churches.csv, media.csv, content/churches/*.md and prints:
  - per-parish coverage table
  - churches missing pictures / narrative / references
  - orphan narrative files and media rows whose church_id is not in churches.csv
"""
import csv
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHURCHES = ROOT / "data" / "churches.csv"
MEDIA = ROOT / "data" / "media.csv"
NARR_DIR = ROOT / "content" / "churches"

churches = list(csv.DictReader(CHURCHES.open(encoding="utf-8", newline="")))
ids = {c["id"] for c in churches}

media_count = defaultdict(int)
for row in csv.DictReader(MEDIA.open(encoding="utf-8", newline="")):
    if row.get("church_id"):
        media_count[row["church_id"]] += 1

narr_files = {p.stem for p in NARR_DIR.glob("*.md")}

for c in churches:
    c["narr"] = c["id"] in narr_files
    if c["narr"]:
        text = (NARR_DIR / f"{c['id']}.md").read_text(encoding="utf-8")
        c["refs"] = "## References" in text
        c["narr_len"] = len(text)
    else:
        c["refs"] = False
        c["narr_len"] = 0
    c["pics"] = media_count.get(c["id"], 0)

by_parish = defaultdict(list)
for c in churches:
    by_parish[c["parish"]].append(c)

print(f"TOTAL churches: {len(churches)}")
print(f"  with narrative:  {sum(1 for c in churches if c['narr'])}")
print(f"  with references: {sum(1 for c in churches if c['refs'])}")
print(f"  with pictures:   {sum(1 for c in churches if c['pics'])}")
print()
print(f"{'Parish':<16} {'tot':>4} {'narr':>5} {'refs':>5} {'pics':>5}")
for p in sorted(by_parish):
    rows = by_parish[p]
    print(f"{p:<16} {len(rows):>4} {sum(1 for c in rows if c['narr']):>5} "
          f"{sum(1 for c in rows if c['refs']):>5} {sum(1 for c in rows if c['pics']):>5}")

print("\n--- Churches MISSING PICTURES ---")
for c in sorted(churches, key=lambda c: (c["parish"], c["name"])):
    if not c["pics"]:
        print(f"  {c['parish']:<14} {c['name']} ({c['town']})  [{c['id']}]  status={c['status']}")

print("\n--- Churches MISSING NARRATIVE ---")
for c in sorted(churches, key=lambda c: (c["parish"], c["name"])):
    if not c["narr"]:
        print(f"  {c['parish']:<14} {c['name']} ({c['town']})  [{c['id']}]")

print("\n--- Narratives WITHOUT References section ---")
for c in sorted(churches, key=lambda c: (c["parish"], c["name"])):
    if c["narr"] and not c["refs"]:
        print(f"  {c['parish']:<14} {c['name']} ({c['town']})  [{c['id']}]  len={c['narr_len']}")

print("\n--- Very short narratives (<600 chars) ---")
for c in sorted(churches, key=lambda c: c["narr_len"]):
    if c["narr"] and c["narr_len"] < 600:
        print(f"  {c['narr_len']:>5}  {c['parish']:<14} {c['name']} ({c['town']})  [{c['id']}]")

print("\n--- ORPHAN narrative files (no churches.csv row) ---")
for stem in sorted(narr_files - ids):
    print(f"  {stem}")

print("\n--- ORPHAN media church_ids (no churches.csv row) ---")
for cid in sorted(set(media_count) - ids):
    print(f"  {cid}  ({media_count[cid]} rows)")
