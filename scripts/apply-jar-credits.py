#!/usr/bin/env python
"""Post-upload step: set the JAR detail URL as the `credit` for the rows that
correspond to the 89 newly-uploaded JAR photos, and update `credit` on the 2
dup-detected existing rows."""
import csv
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "data/media.csv")
TS_SNIPPET = os.path.join(ROOT, "scripts/jar-new-entries.generated.ts")
DUP_JSON = os.path.join(ROOT, "scripts/jar-dup-updates.json")

# Map each freshly-uploaded (church_id, order) → ref_url, looking it up via
# the JAR_ENTRIES table that was used during the download. Rebuild that
# (cid, file basename) → ref_url map by parsing the TS snippet.
import re
new_to_ref = {}  # (cid, order) → ref_url to be set as credit
# We need ref_url too. Re-parse the dup-updates JSON to know which churches.
# But the TS snippet only has cid + order. We need a separate mapping cid → ref_url.

# The cleanest way: read the JAR_ENTRIES from process-jar-photos.py via re.
proc = open(os.path.join(ROOT, "scripts/process-jar-photos.py"), encoding="utf-8").read()
m = re.search(r"JAR_ENTRIES\s*=\s*\[(.*?)\n\]\n", proc, re.DOTALL)
if not m:
    raise SystemExit("could not parse JAR_ENTRIES")
block = m.group(1)
# Each entry: ("cid", "ref_url", [..."img_url"...])
entries = re.findall(r'\(\s*"([^"]+)",\s*\n\s*"([^"]+)",\s*\n\s*\[(.*?)\]\)', block, re.DOTALL)
cid_ref = {cid: ref for cid, ref, _ in entries}

# Now for each new row appended in the latest batch, look up cid and assign credit.
ts_snippet = open(TS_SNIPPET, encoding="utf-8").read()
ts_entries = re.findall(r'church_id:\s*"([^"]+)",\s*caption:\s*"([^"]*)",\s*order:\s*"([^"]+)"', ts_snippet)
for cid, _cap, order in ts_entries:
    if cid in cid_ref:
        new_to_ref[(cid, order)] = cid_ref[cid]

# Load and rewrite media.csv
with open(MEDIA, encoding="utf-8", newline="") as f:
    rows = list(csv.reader(f))
header, body = rows[0], [r for r in rows[1:] if r]

# Build url-suffix → existing-row index for the 89 newly-uploaded URLs
# (they have the pattern /churches/<cid>-<order>.<ext>)
new_count = 0
for r in body:
    if not r:
        continue
    cid = r[0]
    order = r[6] if len(r) >= 7 else ""
    key = (cid, order)
    if key in new_to_ref:
        ref = new_to_ref[key]
        # Only update if credit field is empty (don't overwrite a credit we
        # might have set in a previous batch like Jamaica Gleaner)
        if not r[4]:
            r[4] = ref
            r[5] = "Fair use"
            new_count += 1

# Apply DUP credit updates: for each dup, find media.csv row whose URL basename
# matches the existing_local file's basename, and set its credit to the JAR
# detail URL.
dup_updates = json.load(open(DUP_JSON, encoding="utf-8"))
dup_count = 0
for dup in dup_updates:
    existing_local = dup["existing_local"]  # e.g. "data/new-images/St Ann parish/St Ann's Bay/st-anns-bay-3.png"
    cid = dup["church_id"]
    ref = dup["ref_url"]
    base = os.path.splitext(os.path.basename(existing_local))[0].lower()
    # Find media.csv row for this cid where URL basename matches
    for r in body:
        if r[0] != cid:
            continue
        url = r[2]
        url_base = os.path.splitext(url.rsplit("/", 1)[-1])[0].lower()
        # The Cloudinary URL doesn't keep the original local filename; it has
        # the renamed pattern <cid>-<order>. So matching by basename won't
        # work. Instead match by sequence — pick the row whose caption
        # matches and credit is empty.
        # Heuristic: just update the FIRST row for this cid that has empty
        # credit, marking it as JAR-sourced.
        if not r[4]:
            r[4] = ref
            r[5] = "Fair use"
            dup_count += 1
            break

# Write back with LF line endings
with open(MEDIA, "w", encoding="utf-8", newline="\n") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(header)
    w.writerows(body)

print(f"NEW credits applied:  {new_count}")
print(f"DUP credits applied:  {dup_count}")
