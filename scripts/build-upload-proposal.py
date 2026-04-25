#!/usr/bin/env python
"""Scan data/new-images, compare with IMAGE_MAP and media.csv, and write an
upload-proposal.md showing resolved and unresolved files."""
import os
import re
import csv
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, "scripts/upload-new-images.ts")
NEW_IMG = os.path.join(ROOT, "data/new-images")
CHURCHES = os.path.join(ROOT, "data/churches.csv")
MEDIA = os.path.join(ROOT, "data/media.csv")
OUT = os.path.join(ROOT, "upload-proposal.md")

# --- already mapped files in upload-new-images.ts ---------------------------
script_src = open(SCRIPT, encoding="utf-8").read()
entries = re.findall(
    r'file:\s*"([^"]+)",\s*church_id:\s*"([^"]+)",\s*caption:\s*"([^"]*)",\s*order:\s*"([^"]+)"',
    script_src,
)
mapped_files = set()
mapped_orders = defaultdict(set)  # cid → set of orders already in IMAGE_MAP
mapped_basenames_by_cid = defaultdict(set)  # cid → set of basenames already uploaded for this church
for f, cid, cap, order in entries:
    key = f[len("data/new-images/"):] if f.startswith("data/new-images/") else f
    mapped_files.add(key)
    bn = os.path.splitext(os.path.basename(key))[0].lower()
    mapped_basenames_by_cid[cid].add(bn)
    if order.isdigit():
        mapped_orders[cid].add(int(order))

# --- enumerate all images in new-images ------------------------------------
exts = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff", ".bmp", ".gif"}
all_files = []
for r, d, names in os.walk(NEW_IMG):
    for n in names:
        if os.path.splitext(n)[1].lower() in exts:
            rel = os.path.relpath(os.path.join(r, n), NEW_IMG).replace(os.sep, "/")
            all_files.append(rel)
all_files.sort()
new_files = [f for f in all_files if f not in mapped_files]

# --- church id lookup ------------------------------------------------------
churches = {}
with open(CHURCHES, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        churches[row["id"]] = {
            "name": row["name"], "town": row["town"], "parish": row["parish"],
            "classification": row["classification"],
        }

# --- already used orders per church + existing URL bases (from media.csv) -
current_orders = defaultdict(set)
url_basenames = set()  # lowercased basenames (sans extension) of URLs already in media.csv
url_basenames_by_cid = defaultdict(set)
with open(MEDIA, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        cid = (row.get("church_id") or "").strip()
        order = (row.get("order") or "").strip()
        url = (row.get("url") or "").strip()
        if cid and order.isdigit():
            current_orders[cid].add(int(order))
        if url:
            tail = url.rsplit("/", 1)[-1].split("?")[0]
            base, _ = os.path.splitext(tail)
            # Cloudinary often appends `_aAbBcC` (6-char hash). Strip it.
            m = re.match(r"^(.+)_[A-Za-z0-9]{6}$", base)
            clean = (m.group(1) if m else base).lower()
            url_basenames.add(clean)
            url_basenames.add(base.lower())  # also keep unstripped form
            if cid:
                url_basenames_by_cid[cid].add(clean)

# --- folder → church_id mapping hints --------------------------------------
folder_hints = {
    "Accompong": "st-martin-s-accompong-st-elizabeth",
    "AenonTown": "st-matthew-s-aenon-town-clarendon",
    "Alley Clarendon": "st-peter-s-church-alley-clarendon",
    "Annotto Bay": "st-james-annotto-bay-st-mary",
    "ArthursSeat": "st-michael-s-arthurs-seat-clarendon",
    "AugustTown": "st-cyprians-august-town-st-andrew",
    "Balaclava": "st-luke-s-balaclava-st-elizabeth",
    "BarbaryHall": "st-paul-s-barbary-hall-st-elizabeth",
    "Bath": "st-thomas-bath-st-thomas",
    "Belfield": "__SKIP__",  # filename mismatch (St_Mary_s vs St. Michael's) — awaiting clarification
    "Bog Walk": "st-thomas-ye-vale-bog-walk-st-catherine",
    "Boscobel": "st-matthew-s-boscobel-st-mary",
    "Boston": "st-mark-s-boston-portland",
    "Brampton": "all-souls-brompton-st-elizabeth",
    "Buff Bay": "st-george-s-buff-bay-portland",
    "BullSavannah": "st-aidan-s-bull-savannah-st-elizabeth",
    "Catadupa": "st-matthew-s-catadupa-st-james",
    "Cavaliers": "st-christopher-s-cavaliers-st-andrew",
    "Chapelton": "st-paul-s-chapelton-clarendon",
    "ChesterCastle": "all-saints-chester-castle-st-james",
    "Chichester": "st-saviour-s-chichester-st-james",
    "Clark_s_Town": "st-michael-s-clarks-town-trelawny",
    "Darliston": "st-john-s-darliston-westmoreland",
    "Craighton": "st-mark-s-craighton-st-andrew",
    "Crawford": "st-barnabas-s-crawford-st-elizabeth",
    "CroftsHill": "all-saints-crofts-hill-clarendon",
    "Ewarton": "ss-simon-and-jude-ewarton-st-catherine",
    "Falmouth": "st-peter-s-parish-church-falmouth-trelawny",
    "Gilnock": "st-andrew-s-gilnock-st-elizabeth",
    "GoodShepherd": "church-of-the-good-shepherd-constant-spring-st-andrew",
    "GrangeGlenislay": "st-james-grange-westmoreland",
    "GrangeHill": "holy-trinity-grange-hill-westmoreland",
    "HarbourView": "st-boniface-harbour-view-kingston",
    "Hope Bay": "st-peter-s-hope-bay-portland",
    "JacksonTown": "st-matthew-s-jackson-town-trelawny",
    "Kingston": "__NESTED__",
    "Lacovia": "st-thomas-lacovia-st-elizabeth",
    "Linstead": "church-of-the-holy-trinity-linstead-st-catherine",
    "LLuidas Vale": "st-peter-s-lluidas-vale-st-catherine",
    "Lucea": "hanover-parish-church-lucea-hanover",
    "Malvern": "st-mary-s-malvern-st-elizabeth",
    "MalvernSouthfield": "st-mary-s-malvern-st-elizabeth",
    "Manchioneal": "st-thomas-manchioneal-portland",
    "Margarets Bay": "st-stephen-s-church-st-margaret-s-bay-portland",
    "Marley": "st-andrew-s-marley-hill-st-catherine",
    "Mile Gully": None,
    "Mocho": "st-paul-s-mocho-clarendon",
    "Moneague": "christ-church-moneague-st-ann",
    "Montpelier": "st-mary-s-montpelier-st-james",
    "Morningside": "st-david-s-morningside-st-elizabeth",
    "MountHermon": "st-james-mount-hermon-st-elizabeth",
    "Nain": "st-stephen-s-nain-st-elizabeth",
    "Negril": "st-mary-s-negril-westmoreland",
    "NewHope": "st-paul-s-little-london-westmoreland",  # same church, alternate district name
    "NewRoads": "st-james-new-roads-westmoreland-westmoreland",
    "Old Harbour": "st-dorothy-s-church-old-harbour-st-catherine",
    "Old Harbour Bay": "st-philip-s-old-harbour-bay-st-catherine",
    "Orange Bay": "st-dunstan-s-orange-bay-portland",
    "OrangeGrove": "__SKIP__",  # filename mismatch (St_Stephen_s vs St. Matthew's) — awaiting clarification
    "PedroPlains": "st-peter-s-pedro-plains-st-elizabeth",
    "Pondside": "st-boniface-pondside-st-elizabeth",
    "Port Antonio": "christ-church-parish-church-port-antonio-portland",
    "Port Maria": "st-mary-parish-church-port-maria-st-mary",
    "Port Morant": "st-barnabas-port-morant-st-thomas",
    "PortRoyal": "st-peter-s-port-royal-kingston",
    "RioBueno": "st-mark-s-rio-bueno-trelawny",
    "SantaCruz": "st-matthew-s-santa-cruz-st-elizabeth",
    "Savannah-la-Mar": "st-george-s-savanna-la-mar-parish-church-westmoreland",
    "Siloah": "st-barnabas-siloah-st-elizabeth",
    "Sligoville": "st-john-s-sligoville-st-catherine",
    "Southfield": "st-mark-s-southfield-st-elizabeth",
    "St Ann's Bay": "st-ann-parish-church-st-ann-s-bay-st-ann",
    "St Davids": None,  # user wavered: "maybe not Yallah's" — ask again
    "St Luke": None,
    "St Silas": "st-silas-s-troy-trelawny",
    "StewartTown": "st-thomas-stewart-town-trelawny",
    "StMargaret": "st-margaret-s-liguanea-st-andrew",
    "Troy": "st-silas-s-troy-trelawny",
    "Vere": "st-saviour-s-milk-river-clarendon",
    "Wait_a_bit": "st-peter-s-wait-a-bit-trelawny",
    "Warsop": "st-barnabas-warsop-trelawny",
    "Whitehall": "__SKIP__",  # user confirmed same church as existing Holy Trinity Whitehall — content duplicates
    "Woodford": "st-mary-s-church-woodford-st-andrew",
    "Yallah's": "st-david-s-yallahs-st-thomas",
    "Anglican Churches": "__NESTED__",
    "(root)": None,
}

nested_hints = {
    "Anglican Churches/Accompong": "st-martin-s-accompong-st-elizabeth",
    "Anglican Churches/Balaclava": "st-luke-s-balaclava-st-elizabeth",
    "Anglican Churches/Gilnock": "st-andrew-s-gilnock-st-elizabeth",
    "Anglican Churches/Kingston/St George's": "st-george-s-church-83-east-street-kingston",
    "Anglican Churches/Lacovia": "st-thomas-lacovia-st-elizabeth",
    "Anglican Churches/Lucea": "hanover-parish-church-lucea-hanover",
    "Anglican Churches/Mile Gully": None,
    "Anglican Churches/Negril": "st-mary-s-negril-westmoreland",
    "Anglican Churches/Savannah-la-Mar": "st-george-s-savanna-la-mar-parish-church-westmoreland",
    "Anglican Churches/Siloah": "st-barnabas-siloah-st-elizabeth",
    "Anglican Churches/Southfield": "st-mark-s-southfield-st-elizabeth",
    "Anglican Churches/St Ann's Bay": "st-ann-parish-church-st-ann-s-bay-st-ann",
    "AugustTown/GoodShepherd": "church-of-the-good-shepherd-constant-spring-st-andrew",
    "AugustTown/StMargaret": "st-margaret-s-liguanea-st-andrew",
    "Kingston/All Saints": "all-saints-west-branch-kingston",
    "Kingston/Kingston Parish Church": "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston",
    "Kingston/St Boniface": "st-boniface-harbour-view-kingston",
    "Kingston/St George's": "st-george-s-church-83-east-street-kingston",
    "Kingston/St Matthew's": "st-matthew-s-allman-town-kingston",
    "Kingston/St Michael's": "st-michael-s-church-hannah-town-kingston",
    "Kingston/St Patrick's": "st-patrick-s-windward-road-kingston",
}

# Folders whose filename-vs-church mismatch has been confirmed by the user
# (e.g. user said "Linstead → Holy Trinity" even though filename says St_George_s).
USER_CONFIRMED = {"Linstead"}

PARISH_FOLDER = re.compile(r"^(?P<parish>[A-Za-z. ']+?)\s+parish$")

# map of parish-folder stem → canonical parish string in churches.csv
PARISH_ALIASES = {
    "clarendon": "Clarendon",
    "hanover": "Hanover",
    "kingston": "Kingston",
    "manchester": "Manchester",
    "portland": "Portland",
    "st andrew": "St. Andrew",
    "st ann": "St. Ann",
    "st catherine": "St. Catherine",
    "st elizabeth": "St. Elizabeth",
    "st james": "St. James",
    "st mary": "St. Mary",
    "st thomas": "St. Thomas",
    "trelawny": "Trelawny",
    "westmoreland": "Westmoreland",
}

def _norm(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())

def _church_name_from_filename(name):
    """Extract a normalized church-name hint from a local filename.
    e.g. 'St_Mark_s_Southfield_3.jpg' → 'stmarks';
         'Good_Shepherd_1.jpg' → 'goodshepherd';
         'Hanover Parish Church Lucea_8.jpg' → 'hanoverparishchurch'."""
    base = os.path.splitext(name)[0]
    # drop trailing _N or -N (image number)
    base = re.sub(r"[_\-\s]\d+$", "", base)
    # drop trailing town suffix tokens that are commonly appended after the saint
    # (we only want the saint/church-name prefix)
    # heuristic: take everything up to the second-to-last token if file ends with "_<TownFragment>_<n>"
    return _norm(base)

def churches_in(parish_canonical, town_folder):
    """All churches in parish whose town matches the folder name (exact or fuzzy)."""
    q = _norm(town_folder)
    exact, fuzzy = [], []
    for cid, info in churches.items():
        if info["parish"] != parish_canonical:
            continue
        t = _norm(info["town"])
        if not t:
            continue
        if t == q:
            exact.append(cid)
        elif q and (q in t or t in q):
            fuzzy.append(cid)
    return exact if exact else fuzzy

def resolve_parish_town(parish_canonical, town_folder, filename=None):
    """Resolve (parish, town[, filename]) → unique cid, or None if ambiguous.
    When filename is provided and the (parish, town) lookup is ambiguous,
    narrow by matching the filename's saint hint to the church name."""
    candidates = churches_in(parish_canonical, town_folder)
    if len(candidates) == 1:
        return candidates[0]
    if not candidates:
        return None
    if filename:
        hint = _church_name_from_filename(filename)
        if hint:
            scored = []
            for cid in candidates:
                cname = _norm(churches[cid]["name"])
                # require non-trivial overlap
                if cname == hint or cname in hint or hint in cname:
                    scored.append((cid, len(set(cname) & set(hint))))
                else:
                    # token-level prefix match: e.g., "stmark" vs "stmarkschurch"
                    if cname[:6] == hint[:6] and len(hint) >= 6:
                        scored.append((cid, 4))
            if len(scored) == 1:
                return scored[0][0]
    return None

def guess(f):
    parts = f.split("/")

    # 1. parish-folder prefix → try inner 2-level nested hint first, then town lookup
    parish_canonical = None
    if len(parts) >= 2:
        m = PARISH_FOLDER.match(parts[0])
        if m:
            key = re.sub(r"[^a-z ]+", "", m.group("parish").lower()).strip()
            key = re.sub(r"\s+", " ", key)
            parish_canonical = PARISH_ALIASES.get(key)

    if parish_canonical:
        # 1a. nested hint two levels under parish (e.g. "AugustTown/GoodShepherd")
        if len(parts) >= 3:
            inner_two = "/".join(parts[1:3])
            if inner_two in nested_hints and nested_hints[inner_two] is not None:
                return nested_hints[inner_two], f"{parts[0]}/{inner_two}"
        town_folder = parts[1]
        filename = parts[-1]
        # 1b. user_confirmed override
        if town_folder in USER_CONFIRMED and town_folder in folder_hints:
            val = folder_hints[town_folder]
            if val not in (None, "__NESTED__", "__SKIP__"):
                return val, f"{parts[0]}/{town_folder}"
        # 1c. resolve <town_folder> + filename hint against churches in this parish
        cid = resolve_parish_town(parish_canonical, town_folder, filename)
        if cid:
            return cid, f"{parts[0]}/{town_folder}"
        # 1d. fall back to top-level folder_hint for the town folder
        if town_folder in folder_hints:
            val = folder_hints[town_folder]
            if val == "__SKIP__":
                return "__SKIP__", f"{parts[0]}/{town_folder}"
            if val not in (None, "__NESTED__"):
                return val, f"{parts[0]}/{town_folder}"
        # 1e. legacy nested_hint with bare-parish prefix (e.g. "Kingston/All Saints")
        legacy_key = f"{parish_canonical.split('.')[0].strip()}/{town_folder}"
        if legacy_key in nested_hints and nested_hints[legacy_key] is not None:
            return nested_hints[legacy_key], f"{parts[0]}/{town_folder}"

    # 2. legacy: nested_hints at depth 2 from root
    if len(parts) >= 3:
        folder2 = "/".join(parts[:2])
        if folder2 in nested_hints and nested_hints[folder2] is not None:
            return nested_hints[folder2], folder2

    # 3. legacy top-level folder_hints
    folder = parts[0] if len(parts) > 1 else "(root)"
    if folder in folder_hints:
        val = folder_hints[folder]
        if val == "__SKIP__":
            return "__SKIP__", folder
        if val not in (None, "__NESTED__"):
            return val, folder
    return None, folder

def already_uploaded(file_rel):
    """True if the file's basename (without ext) already appears as the basename
    of a Cloudinary URL in media.csv (after stripping the optional _aAbBcC
    hash suffix Cloudinary appends). Also normalizes case and _/- separators."""
    bn = os.path.splitext(os.path.basename(file_rel))[0].lower()
    norm_bn = bn.replace("_", "-")
    if bn in url_basenames or norm_bn in url_basenames:
        return True
    for existing in url_basenames:
        en = existing.replace("_", "-")
        if en == norm_bn:
            return True
        if en.startswith(norm_bn + "-") or norm_bn.startswith(en + "-"):
            return True
    return False

# flag filename/folder mismatches — filename hints at a saint's name that
# doesn't match the folder's expected church
SAINTS = [
    "st_mary","st_mark","st_luke","st_john","st_james","st_matthew","st_matthias",
    "st_paul","st_peter","st_philip","st_stephen","st_andrew","st_thomas","st_simon",
    "st_silas","st_saviour","st_patrick","st_margaret","st_martin","st_michael",
    "st_gabriel","st_george","st_giles","st_joseph","st_jude","st_leonard","st_faith",
    "st_francis","st_dunstan","st_christopher","st_cuthbert","st_cyprian","st_dorothy",
    "st_david","st_elizabeth","st_helena","st_agnes","st_agatha","st_aidan","st_alban",
    "st_augustine","st_barnabas","st_bartholomew","st_boniface","st_clement",
    "all_saints","all_souls","holy_trinity","holy_cross","christ_church","epiphany",
    "transfiguration","mary_magdalene","good_shepherd","ascension","resurrection",
]

def saint_hint(filename):
    base = os.path.splitext(filename)[0].lower().replace("-","_").replace(" ","_").replace(".","_")
    # collapse repeats
    while "__" in base:
        base = base.replace("__","_")
    for s in SAINTS:
        if re.search(r"(^|_)" + re.escape(s) + r"(?=$|_)", base):
            return s
    return None

def normalize_saint(s):
    return re.sub(r"[^a-z]+", "", (s or "").lower())

resolved = []
duplicates = []
mismatches = []
unresolved = []
skipped = []
batch_duplicates = []
batch_seen = {}  # (cid, basename-without-ext-lower) -> first file
used = defaultdict(set)
for cid, s in current_orders.items():
    used[cid] |= s
for cid, s in mapped_orders.items():
    used[cid] |= s
for f in new_files:
    cid, folder = guess(f)
    if cid == "__SKIP__":
        skipped.append((folder, f))
        continue
    if cid is None:
        unresolved.append((folder, f, None))
        continue
    if cid not in churches:
        unresolved.append((folder, f, f"CID NOT IN churches.csv: {cid}"))
        continue
    if already_uploaded(f):
        duplicates.append((folder, f, cid))
        continue
    bn = os.path.splitext(os.path.basename(f))[0].lower()
    # skip if another file with same basename has been uploaded for this church previously
    if bn in mapped_basenames_by_cid.get(cid, set()):
        duplicates.append((folder, f, cid))
        continue
    batch_key = (cid, bn)
    if batch_key in batch_seen:
        batch_duplicates.append((folder, f, cid, batch_seen[batch_key]))
        continue
    batch_seen[batch_key] = f
    # mismatch check: does filename's saint name appear in the target church's name?
    if folder not in USER_CONFIRMED:
        name_norm = normalize_saint(churches[cid]["name"])
        hint = saint_hint(os.path.basename(f))
        if hint:
            h_norm = normalize_saint(hint)
            if h_norm and name_norm and not (h_norm in name_norm or name_norm in h_norm):
                mismatches.append((folder, f, cid, hint))
                continue
    n = 1
    while n in used.get(cid, set()):
        n += 1
    used.setdefault(cid, set()).add(n)
    resolved.append((folder, f, cid, n))

with open(OUT, "w", encoding="utf-8") as w:
    w.write(f"# Upload proposal\n\n")
    w.write(f"- Total images in `data/new-images/`: **{len(all_files)}**\n")
    w.write(f"- Already in IMAGE_MAP: **{len(all_files)-len(new_files)}**\n")
    w.write(f"- New candidates: **{len(new_files)}**\n")
    w.write(f"- **Skipped as duplicates** (filename matches existing URL): **{len(duplicates)}**\n")
    w.write(f"- **Skipped as in-batch duplicates** (same file in two folders): **{len(batch_duplicates)}**\n")
    w.write(f"- **Auto-resolved, ready to upload**: **{len(resolved)}**\n")
    w.write(f"- **Filename/folder mismatches** (awaiting your answer): **{len(mismatches)}**\n")
    w.write(f"- **Unresolved folders** (awaiting your answer): **{len(unresolved)}**\n\n")

    w.write("## Auto-resolved (grouped by church)\n\n")
    by_cid = defaultdict(list)
    for folder, f, cid, order in resolved:
        by_cid[cid].append((folder, f, order))
    for cid in sorted(by_cid.keys()):
        info = churches[cid]
        existing = sorted(current_orders.get(cid, set()))
        tag = f" (already has orders: {existing})" if existing else " (no existing images)"
        w.write(f"\n### {info['name']}, {info['town']} ({info['parish']}){tag}\n")
        w.write(f"`{cid}`\n\n")
        for folder, f, order in by_cid[cid]:
            w.write(f"- order **{order}** &larr; `{f}`\n")

    w.write("\n---\n\n## Duplicates — skipped (filename already on Cloudinary)\n\n")
    by_cid_dup = defaultdict(list)
    for folder, f, cid in duplicates:
        by_cid_dup[cid].append(f)
    for cid in sorted(by_cid_dup.keys()):
        info = churches.get(cid, {})
        w.write(f"- **{info.get('name','?')}, {info.get('town','?')}** (`{cid}`): {len(by_cid_dup[cid])} file(s)\n")

    w.write("\n---\n\n## Filename/folder mismatches — please confirm or re-map\n\n")
    for folder, f, cid, hint in mismatches:
        info = churches[cid]
        w.write(f"- `{f}` — folder maps to **{info['name']}, {info['town']}** but filename hints **{hint}**\n")

    w.write("\n---\n\n## Unresolved folders — please tell me which church each belongs to\n\n")
    by_folder_un = defaultdict(list)
    for folder, f, why in unresolved:
        by_folder_un[folder].append((f, why))
    for folder in sorted(by_folder_un.keys(), key=str.lower):
        w.write(f"\n### folder: `{folder}`\n\n")
        # show candidate churches for that folder name
        q = re.sub(r"[^a-z]+", "", folder.lower())
        cands = []
        for cid, info in churches.items():
            t = re.sub(r"[^a-z]+", "", info["town"].lower())
            if t and len(q) >= 3 and (q == t or q in t or t in q):
                cands.append((cid, info))
        if cands:
            w.write("**candidates:**\n\n")
            for cid, info in cands[:10]:
                w.write(f"- `{cid}` — {info['name']}, {info['town']} ({info['parish']})\n")
            w.write("\n")
        w.write("**files:**\n\n")
        for f, why in by_folder_un[folder]:
            extra = f" — {why}" if why else ""
            w.write(f"- `{f}`{extra}\n")

print(f"wrote {OUT}")
print(f"total new: {len(new_files)}")
print(f"  duplicates skipped: {len(duplicates)}")
print(f"  explicitly skipped: {len(skipped)}")
print(f"  resolved (ready): {len(resolved)}")
print(f"  mismatches (ask): {len(mismatches)}")
print(f"  unresolved folders: {len(unresolved)}")

# also emit TS snippet of new IMAGE_MAP entries
TS_OUT = os.path.join(ROOT, "scripts/new-map-entries.generated.ts")
with open(TS_OUT, "w", encoding="utf-8") as ts:
    for folder, f, cid, order in resolved:
        info = churches[cid]
        # caption: "<Church name>, <town>"
        cap = f'{info["name"]}, {info["town"]}'.replace('"', '\\"')
        ts.write(f'  {{ file: "data/new-images/{f}", church_id: "{cid}", caption: "{cap}", order: "{order}" }},\n')
print(f"  TS snippet written to {TS_OUT}")
