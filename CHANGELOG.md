# Changelog

## [Unreleased] — 2026-04-27

### Content

- **+17 new photographs** from Hazel Bennett's *Anglican Churches of Eighteenth-Century Jamaica* on the Victorian Web (photographer Tim Willasey-Wilsey, fair-use credit). Distributed across the 8 churches Bennett surveys: St. Peter's Port Royal (4 — exterior, interior, organ loft, churchyard grave), St. Jago de la Vega Cathedral (3 — exterior, Modyford gravestone, interior), Kingston Parish Church (4 — modern view, pre-1907 view, pineapple-motif pew, Benbow gravestone), St. Andrew Half-Way-Tree (2), St. James Montego Bay (1), St. Peter's Falmouth (1), Hanover Parish Church Lucea (1), St. Mark's Rio Bueno (1).
- **Architecture-section enrichment** for Port Royal (Bennett's cruciform-as-earthquake-resistance thesis + Col. Christian Lilly attribution) and Falmouth (William Danny as 1791 contractor at £9,000). Bennett's article added to the References section of all 8 covered churches.
- **Parish correction**: All Saints', Chester Castle reassigned from St. James to **Hanover** (with id renamed `all-saints-chester-castle-st-james` → `all-saints-chester-castle-hanover`). JAR confirms Hanover; near-identical coords retained. 2 existing photos preserved under the new id.

### Tooling

- New one-shot importer `scripts/upload-victorian-web.ts` (downloads, dedup-by-key, Cloudinary-uploads, appends to media.csv).
- `data/media.csv` line endings normalized from mixed CRLF/LF to consistent LF (was breaking csv-parse on appends).

## [2.0.0] — 2026-04-27

Major content + UX release. The site now indexes 309 churches with comprehensive
photo coverage, authoritative architectural classification, and improved
navigation.

### Content

- **+46 net new church photographs** sourced from the [Anglican Diocese of
  Jamaica website](https://www.anglicandioceseja.org) and the
  [St. John the Evangelist Meadowbrook parish website](https://stjohnevangelistja.com/).
  Diocese harvest used three channels: the diocesan-churches NextGen gallery,
  the `wp-content/uploads/2014/03` survey dump (NIKON COOLPIX L21, 2011-2012),
  and the WP REST API at `/wp-json/wp/v2/media` (2,318 items inventoried,
  ~22 building shots filtered + 11 mappable to existing slugs).
- **+5 new church rows** in `data/churches.csv`:
  - Holy Spirit, Pepper / Hermons (St. Elizabeth) — St. Matthew's Santa Cruz cure
  - St. Andrew's, Glebe (St. Elizabeth)
  - St. Bartholomew's, Kellitts (Clarendon)
  - St. Anne's Chapel, Hillcrest Retreat (St. Ann — Brown's Town diocesan retreat)
  - One row corrected: previously-misidentified `st-john-s-merrivale-st-andrew`
    is actually St. John the Evangelist, Meadowbrook (Mannings Hill Road)
- **+4 new church narratives** in Chapelton format (founding → slavery →
  emancipation → independence) for the new rows.
- **8 JNHT-confirmed architecture-style overrides** cross-referenced against
  jnht.com authoritative descriptions: Spanish Town Cathedral (Georgian +
  Gothic Revival hybrid), St. John's Black River (hybrid), Christ Church Port
  Antonio (hybrid), Hanover Parish Church Lucea (Georgian, was wrongly Gothic),
  St. Peter's Alley (Georgian), Christ Church Morant Bay (Gothic Revival),
  St. George's Buff Bay (Georgian), St. Peter's Falmouth (Georgian).
- **18 date-inferred architecture-style designations** for churches whose
  narratives mention construction years but didn't trip the regex. Era rules:
  pre-1830 → Georgian; 1830–1880 → Gothic Revival; 1880–1920 → Vernacular
  (mission/chapel) or Gothic Revival (parish_church/cathedral); 1920–1950 →
  Vernacular; 1950+ → Modernist.
- **Extended architecture-style regex patterns** to catch the boilerplate
  vernacular Caribbean phrasing common in rural-parish narratives — vernacular
  count rose from 12 to 144 churches, correctly reflecting that most rural
  Jamaican Anglican churches are vernacular masonry chapels.

### Coordinates

- Refined coordinates for Galina (St. Peter's), Gayle (St. John's), Highgate
  (St. Cyprian's). Approximate placeholder coords for the 4 newly-added churches
  pending verification.
- Two row corrections during content sweep: Hillcrest's parish (St. Andrew →
  St. Ann) + slug rename, and the duplicate St. Boniface row merged into the
  existing `st-boniface-harbour-view-kingston` (the "Kingston 17 / St. Thomas
  Road" address resolves to Harbour View, eastern Kingston).

### Media-pipeline cleanup

- **27 URL-duplicate rows dropped**: Cloudinary `overwrite: false` returned
  existing public_id URLs, leaving the new diocese-credited row pointing to
  an older asset with mis-attributed credit. Older row kept (correct
  provenance).
- **Visual deduplication via 16×16 grayscale perceptual hash (aHash)** through
  Cloudinary's URL-transform endpoint. Three passes at increasing Hamming
  thresholds (4, 20, 36) dropped 216 near-duplicate rows. Within each cluster,
  preferred order: URL-credited (JAR/parish-site) > diocese-credited >
  text-credited > "Unknown" > empty.
- **Per-church reorder**: regular photos first (preserving relative order),
  Hurricane Melissa damage photos pushed to end. Order field renumbered 1..N
  per church. Total photo rows: 631 → 414 (-217, all visual duplicates).

### UX fixes

- **Scroll-position reset on church-to-church navigation.** Two paths needed
  separate fixes:
  - Standalone Church Detail page (`#/church/<slug>`): `key={route}` on
    `<ChurchDetailPage>` in App.tsx forces fresh mount; `useLayoutEffect`
    multi-frame hammer pins window/document/body scroll to top.
  - Directory/map page (`#/churches?id=<slug>`): the church preview lives in
    an `overflow-auto` `<main>` column, not the window. Added a ref + same
    multi-frame reset on `id` change. `<ChurchCard>` keyed by id so its
    horizontal image strip remounts at scrollLeft=0.
- **Map flyToChurch animation** restored to a deliberate 3-second arc with
  Leaflet's default easing (after iteration through 0.4s, 0.6s, 0.7s, 1.4s).
- **Browser scroll-restoration** disabled globally on app load
  (`history.scrollRestoration = 'manual'`).

### Tooling

- New `scripts/upload-from-url.ts` — Cloudinary upload helper that takes a
  JSON file of `{url, church_id, caption, credit, license, order}` entries
  and appends them to `data/media.csv`.
- `scripts/build-data.ts` extended with:
  - `MANUAL_STYLE_OVERRIDES` map for slug → ArchStyle[] designations
    (JNHT-confirmed and date-inferred).
  - More inclusive style-detection regexes.
- `architecture-report.md` — auto-generated 486-line breakdown of all
  classified churches by style, grouped by parish, with description excerpts.
- `church-inventory.csv` — committed snapshot of all 309 churches with photo
  counts and the "No Photos" flag, sorted by parish then town.
- `exifr` added as dev-dependency, used to verify diocese gallery photos
  carry no GPS metadata (NIKON COOLPIX L21 has no GPS hardware; Hurricane
  Melissa Nov 2025 photos had EXIF stripped on WP upload).

### Deploy

GitHub Pages via `.github/workflows/deploy.yml`, triggered on every push to
`main`. The 3.0.0 release ships ~131 commits since v1.0.0.

## [1.0.0] — 2026-04-22

Initial tagged release.
