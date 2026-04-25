#!/usr/bin/env python
"""Walk data/new-images/, extract EXIF GPS coordinates from photos,
group by folder (parish/town), compare to churches.csv, and write a report
of (a) churches whose existing coords differ noticeably from photo GPS, and
(b) folders with photo GPS that have no matching church entry."""
import csv
import os
import re
from collections import defaultdict
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEW_IMG = os.path.join(ROOT, "data/new-images")
CHURCHES = os.path.join(ROOT, "data/churches.csv")
OUT = os.path.join(ROOT, "image-gps-report.md")


def gps_from_image(path):
    try:
        img = Image.open(path)
    except Exception:
        return None
    exif = img.getexif()
    if not exif:
        return None
    gps_ifd = exif.get_ifd(0x8825)  # GPSInfo IFD
    if not gps_ifd:
        return None
    gps = {GPSTAGS.get(k, k): v for k, v in gps_ifd.items()}
    if "GPSLatitude" not in gps or "GPSLongitude" not in gps:
        return None
    def to_deg(parts, ref):
        d, m, s = (float(x) for x in parts)
        deg = d + m / 60 + s / 3600
        if ref in ("S", "W"):
            deg = -deg
        return deg
    lat = to_deg(gps["GPSLatitude"], gps.get("GPSLatitudeRef", "N"))
    lng = to_deg(gps["GPSLongitude"], gps.get("GPSLongitudeRef", "E"))
    return lat, lng


def haversine_m(a, b):
    """Approx great-circle distance in meters."""
    import math
    lat1, lng1 = a
    lat2, lng2 = b
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


# load churches.csv
churches = {}
by_parish_town = defaultdict(list)
with open(CHURCHES, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        churches[row["id"]] = row
        by_parish_town[(row["parish"], row["town"].lower())].append(row)

# walk images, group GPS by folder
PARISH_FOLDER = re.compile(r"^(?P<parish>[A-Za-z. ']+?)\s+parish$")
PARISH_ALIASES = {
    "clarendon": "Clarendon", "hanover": "Hanover", "kingston": "Kingston",
    "manchester": "Manchester", "portland": "Portland", "st andrew": "St. Andrew",
    "st ann": "St. Ann", "st catherine": "St. Catherine", "st elizabeth": "St. Elizabeth",
    "st james": "St. James", "st mary": "St. Mary", "st thomas": "St. Thomas",
    "trelawny": "Trelawny", "westmoreland": "Westmoreland",
}

folder_gps = defaultdict(list)  # (parish, town_folder) -> [(file, lat, lng)]
for r, _, names in os.walk(NEW_IMG):
    for n in names:
        ext = os.path.splitext(n)[1].lower()
        if ext not in (".jpg", ".jpeg", ".tif", ".tiff", ".heic", ".heif", ".png", ".webp"):
            continue
        full = os.path.join(r, n)
        rel = os.path.relpath(full, NEW_IMG).replace(os.sep, "/")
        parts = rel.split("/")
        if len(parts) < 3:
            continue
        m = PARISH_FOLDER.match(parts[0])
        if not m:
            continue
        key = re.sub(r"[^a-z ]+", "", m.group("parish").lower()).strip()
        key = re.sub(r"\s+", " ", key)
        parish = PARISH_ALIASES.get(key)
        if not parish:
            continue
        town_folder = parts[1]
        gps = gps_from_image(full)
        if gps is None:
            continue
        folder_gps[(parish, town_folder)].append((rel, gps[0], gps[1]))


def avg(coords):
    if not coords:
        return None
    lat = sum(c[1] for c in coords) / len(coords)
    lng = sum(c[2] for c in coords) / len(coords)
    return lat, lng


# resolve each folder to a churches.csv row by parish + town
def find_church(parish, town_folder):
    q = re.sub(r"[^a-z]+", "", town_folder.lower())
    cands = []
    for cid, info in churches.items():
        if info["parish"] != parish:
            continue
        t = re.sub(r"[^a-z]+", "", info["town"].lower())
        if t == q:
            cands.append(cid)
    if len(cands) == 1:
        return cands[0]
    if not cands:
        # fuzzy
        for cid, info in churches.items():
            if info["parish"] != parish:
                continue
            t = re.sub(r"[^a-z]+", "", info["town"].lower())
            if q and (q in t or t in q) and len(q) >= 3:
                cands.append(cid)
        if len(cands) == 1:
            return cands[0]
    return None


with open(OUT, "w", encoding="utf-8") as w:
    w.write("# EXIF GPS report from images in `data/new-images/`\n\n")
    w.write(f"Folders with GPS-tagged photos: **{len(folder_gps)}**\n\n")

    diffs, no_match, no_diff = [], [], []
    for (parish, town_folder), photos in sorted(folder_gps.items()):
        photo_avg = avg(photos)
        cid = find_church(parish, town_folder)
        if not cid:
            no_match.append((parish, town_folder, photos, photo_avg))
            continue
        info = churches[cid]
        try:
            existing = (float(info["lat"]), float(info["lng"]))
        except (ValueError, KeyError):
            existing = None
        if existing is None:
            diffs.append((parish, town_folder, cid, photos, photo_avg, existing, None))
            continue
        d = haversine_m(existing, photo_avg)
        if d > 50:  # more than 50 m off
            diffs.append((parish, town_folder, cid, photos, photo_avg, existing, d))
        else:
            no_diff.append((parish, town_folder, cid, d))

    w.write(f"## Significant coord discrepancies (>50 m): {len(diffs)}\n\n")
    for parish, town_folder, cid, photos, pavg, existing, d in diffs:
        info = churches[cid]
        w.write(f"### `{cid}` — {info['name']}, {info['town']} ({parish})\n\n")
        if existing:
            w.write(f"- existing coords: `{info['lat']}, {info['lng']}`\n")
        else:
            w.write(f"- existing coords: (unparseable)\n")
        w.write(f"- photo GPS avg: `{pavg[0]:.6f}, {pavg[1]:.6f}` ({len(photos)} photos)\n")
        if d is not None:
            w.write(f"- distance: **{d:.0f} m**\n")
        w.write(f"- per-photo GPS:\n")
        for f, lat, lng in photos:
            w.write(f"  - `{lat:.6f}, {lng:.6f}` — `{f}`\n")
        w.write("\n")

    w.write(f"## Photo GPS for folders with no matching church (possibly new entries): {len(no_match)}\n\n")
    for parish, town_folder, photos, pavg in no_match:
        w.write(f"### {parish} / `{town_folder}` ({len(photos)} photos)\n\n")
        w.write(f"- avg: `{pavg[0]:.6f}, {pavg[1]:.6f}`\n")
        for f, lat, lng in photos:
            w.write(f"  - `{lat:.6f}, {lng:.6f}` — `{f}`\n")
        w.write("\n")

    w.write(f"## Already accurate (≤50 m): {len(no_diff)}\n\n")
    for parish, town_folder, cid, d in no_diff:
        info = churches[cid]
        w.write(f"- `{cid}` — {info['name']}, {info['town']} ({d:.0f} m)\n")

print(f"wrote {OUT}")
print(f"  folders with GPS:       {len(folder_gps)}")
print(f"  significant diffs:      {len(diffs)}")
print(f"  no church match:        {len(no_match)}")
print(f"  already accurate:       {len(no_diff)}")
