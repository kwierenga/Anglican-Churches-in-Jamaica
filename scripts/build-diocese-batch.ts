// Generate scripts/diocese-batch.json for upload-from-url.ts
// Source: https://www.anglicandioceseja.org/wp-content/uploads/{YYYY/MM}/
// Mapping is hand-curated below; non-CSV churches and non-portrait files are skipped.

import fs from "node:fs";

type SrcFile = { ym: string; file: string };
type Entry = {
  url: string;
  church_id: string;
  caption: string;
  credit: string;
  license: string;
  order: string;
};

// filename -> CSV slug; null = skip (no row in churches.csv or non-portrait)
const slugMap: Record<string, string | null> = {
  // 2014/03 — main diocesan-churches dump
  "All-Saints-Belvedere-Chester-Castle-Hanover.jpg": "all-saints-chester-castle-st-james",
  "All-Saints-Church-1181-2-West-Street-Kingston.jpg": "all-saints-west-branch-kingston",
  "All-Saints-Church-Crofts-Hill-Kingston.jpg": "all-saints-crofts-hill-clarendon",
  "All-Saints-Church-Water-Level-Guys-Hill-St-Catherine.jpg": "all-saints-guys-hill-st-catherine",
  "All-Saints-Fellowship-Portland.jpg": "all-saints-fellowship-portland",
  "All-Saints-Newell-Plantation-St.-Elizabeth.jpg": "all-saints-newell-st-elizabeth",
  "All-Saints-West-Street-Kingston.jpg": "all-saints-west-branch-kingston",
  "Christ-Church-1-East-Street-Morant-Bay.jpg": "christ-church-morant-bay-st-thomas",
  "Christ-Church-6-Antrim-Road-Kingston-3-Kingston.jpg": "christ-church-vineyard-town-kingston",
  "Christ-Church-Christiana-Sedburgh-Manchester-.jpg": "christ-church-christiana-manchester",
  "Christ-Church-Chudleigh-Pen-Christiana-Manchester.jpg": "christ-church-christiana-manchester",
  "Christ-Church-Harbour-Street-Port-Antonio-Portland.jpg": "christ-church-parish-church-port-antonio-portland",
  "Christ-Church-Marley-Lands-Falmouth-St.James-.jpg": "christ-church-adelphi-st-james",
  "Christ-Church-Purcell-Hall-Moneague-St.-Ann.jpg": "christ-church-moneague-st-ann",
  "Church-of-Ascension-Lot-V-739-Daisy-Avenue-Mona-Heights-Kingston-6-St.-Andrew.jpg": "church-of-ascension-mona-st-andrew",
  "Church-of-The-Holy-Spirit-Hermons-Pepper-Run-St.-Elizabeth.jpg": null,
  "Church-of-The-Transfiguration-Leeds-St.-Elizabeth.jpg": "the-transfiguration-leeds-st-elizabeth",
  "Church-of-Transfiguration-Lot-426A-Meadowbrook-144-Red-Hills-Road-Kingston-19.jpg": "church-of-the-transfiguration-havendale-st-andrew",
  "Church-of-the-Resurrection-No.1D-Dickens-Avenue-Duhaney-Park.jpg": "church-of-the-resurrection-duhaney-park-st-andrew",
  "Holy-Trinity-Church-Green-Island-Hanover.jpg": "church-of-the-holy-trinity-green-island-hanover",
  "Holy-Trinity-Church-Lincoln-Grange-Hill-Westmoreland.jpg": "holy-trinity-grange-hill-westmoreland",
  "Holy-Trinity-Church-Linstead-St.-Catherine.jpg": "church-of-the-holy-trinity-linstead-st-catherine",
  "Holy-Trinity-Church-Westgate-Catherine-Hall-St-James.jpg": "holy-trinity-westgate-st-james",
  "Holy-Trinity-Church-Whitehall-New-Market.jpg": "holy-trinity-whitehall-st-elizabeth",
  "St-Andrews-Church-Glebe-St.-Elzabeth.jpg": null,
  "St-Francis-Church-Glendevon-St-James.jpg": "st-francis-glendevon-st-james",
  "St-James-Parish-Church-Church-Street-St-James.jpg": "st-james-parish-church-sam-sharpe-square-st-james",
  "St-Mary-The-Virgin-Church-Hermitage-Negril-Westmoreland.jpg": "st-mary-s-negril-westmoreland",
  "St-Michaels-Church-Swanswick-Clarks-Town-Trelawny.jpg": "st-michael-s-clarks-town-trelawny",
  "St-Saviours-Church-Harewood-St.-Catherine.jpg": "st-saviour-s-harewood-st-catherine",
  "St-Saviours-Church-Lime-Hall-St.-Ann.jpg": "st-saviour-s-lime-hall-st-ann",
  "St-Thomas-Church-Clarendon.jpg": "st-thomas-race-course-clarendon",
  "St-Thomas-Church-Manchioneal-Portland.jpg": "st-thomas-manchioneal-portland",
  "St.-Albans-Church-Stanmore-Hill-St.-Elizabeth.jpg": "st-alban-s-stanmore-hill-st-elizabeth",
  "St.-Andrews-Church-Albert-Town-Trelawny.jpg": "st-andrew-s-albert-town-trelawny",
  "St.-Andrews-Parish-Church-6-Hagley-Park-Road-Kingston-10-St.-Andrew.jpg": "st-andrew-parish-church-half-way-tree-st-andrew",
  "St.-Anns-Bay-Parish-Church-Hall-St.-Ann.jpg": "st-ann-parish-church-st-ann-s-bay-st-ann",
  "St.-Augustines-Church-Coral-Gardens-St.-James.jpg": "st-augustine-s-coral-gardens-st-james",
  "St.-Augustines-Church-Manchester.jpg": "st-augustine-s-porus-manchester",
  "St.-Augustines-Church-Salem-Mountain-Side-St.-Elizabeth.jpg": "st-augustine-s-mountainside-st-elizabeth",
  "St.-Barnabas-Church-Crawford-St.-Elizabeth.jpg": "st-barnabas-s-crawford-st-elizabeth",
  "St.-Barnabas-Church-Enfield-St.-Mary.jpg": "st-barnabas-enfield-st-mary",
  "St.-Barnabas-Church-Harbour-Head-Port-Morant-St.-Thomas.jpg": "st-barnabas-port-morant-st-thomas",
  "St.-Barnabas-Church-Richmond-Hill-Mile-Gully-Manchester.jpg": "st-barnabas-mile-gully-manchester",
  "St.-Barnabas-Church-Warsop-Trelawny.jpg": "st-barnabas-warsop-trelawny",
  "St.-Bartholomews-Church-Frankfield-Clarendon.jpg": "st-bartholomew-s-frankfield-clarendon",
  "St.-Bartholomews-Church-Kellitts-Clarendon.jpg": null,
  "St.-Boniface-Church-St.-Thomas-Road-Kingston-17-St.-Andrew.jpg": null,
  "St.-Cyprians-Church-79-August-Town-Road-Kingston-7-St.-Andrew.jpg": "st-cyprians-august-town-st-andrew",
  "St.-Davids-Church-Morningside-St.-Elizabeth.jpg": "st-david-s-morningside-st-elizabeth",
  "St.-Davids-Church-School-Snowdon-Manchester.jpg": "st-david-s-snowdon-manchester",
  "St.-Gabriels-Church-10-Church-Street-May-Pen-Clarendon.jpg": "st-gabriel-s-may-pen-clarendon",
  "St.-Georges-Church-95-Great-George-Street-Savanna-la-Mar-Westmoreland.jpg": "st-george-s-savanna-la-mar-parish-church-westmoreland",
  "St.-Georges-Church-Blackstonedge-St.-Catherine.jpg": "st-george-s-blackstonedge-st-catherine",
  "St.-Georges-Church-No.83-East-Street-Kingston.jpg": null,
  "St.-Georges-Church-Point-Hill-St.-Catherine.jpg": "st-george-s-point-hill-st-catherine",
  "St.-James-Church-Annotto-Bay-St.-Mary.jpg": "st-james-annotto-bay-st-mary",
  "St.-James-Church-Blackheath-Mountain-Grange-Glenislay-Westmoreland.jpg": "st-james-grange-westmoreland",
  "St.-James-Church-Craighead-Manchester.jpg": "st-james-s-craighead-manchester",
  "St.-James-Church-Cruise-New-Roads-Westmoreland.jpg": "st-james-new-roads-westmoreland-westmoreland",
  "St.-James-Church-Hayes-Clarendon.jpg": "st-james-hayes-clarendon",
  "St.-James-Church-Kendal-Mandeville-Manchester.jpg": "st-james-kendal-manchester",
  "St.-James-Church-Mt.-Hermon-Parsonage-St-Elizabeth.jpg": "st-james-mount-hermon-st-elizabeth",
  "St.-James-Church-Stewart-Castle-Endeavour-Gibraltar-St.-Ann.jpg": "st-james-gibraltar-st-ann",
  // 2014/04
  "Christ-Church-Harbour-Street-Port-Antonio-Portland-edit.jpg": "christ-church-parish-church-port-antonio-portland",
  // 2014/06
  "Kingston-Parish-Church.jpg": "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston",
  // 2024/04
  "St-Michaels-Clarkes-Town.jpg": "st-michael-s-clarks-town-trelawny",
  // 2024/06
  "Church-of-the-Reconciliation.jpg": "church-of-reconciliation-portmore-st-catherine",
  // 2022/12
  "st_andrew_parish_church_000.jpg": "st-andrew-parish-church-half-way-tree-st-andrew",
};

const sources: SrcFile[] = [
  ...Object.keys(slugMap)
    .filter((f) => !["Christ-Church-Harbour-Street-Port-Antonio-Portland-edit.jpg", "Kingston-Parish-Church.jpg", "St-Michaels-Clarkes-Town.jpg", "Church-of-the-Reconciliation.jpg", "st_andrew_parish_church_000.jpg"].includes(f))
    .map((f) => ({ ym: "2014/03", file: f })),
  { ym: "2014/04", file: "Christ-Church-Harbour-Street-Port-Antonio-Portland-edit.jpg" },
  { ym: "2014/06", file: "Kingston-Parish-Church.jpg" },
  { ym: "2024/04", file: "St-Michaels-Clarkes-Town.jpg" },
  { ym: "2024/06", file: "Church-of-the-Reconciliation.jpg" },
  { ym: "2022/12", file: "st_andrew_parish_church_000.jpg" },
];

// Existing media.csv -> per-slug max order
const mLines = fs
  .readFileSync("data/media.csv", "utf8")
  .split("\n")
  .slice(1)
  .filter(Boolean);
const orderBySlug: Record<string, number> = {};
for (const l of mLines) {
  const c = l.split(",");
  const slug = c[0];
  const order = parseInt(c[6] || "1", 10);
  orderBySlug[slug] = Math.max(orderBySlug[slug] || 0, order);
}

const within: Record<string, number> = {};
const entries: Entry[] = [];
const skipped: string[] = [];

for (const s of sources) {
  const slug = slugMap[s.file];
  if (!slug) {
    skipped.push(`${s.ym}/${s.file}`);
    continue;
  }
  const baseOrder = (orderBySlug[slug] || 0) + (within[slug] || 0) + 1;
  within[slug] = (within[slug] || 0) + 1;
  const caption = s.file
    .replace(/\.(jpg|jpeg|png)$/i, "")
    .replace(/-/g, " ")
    .replace(/  +/g, " ")
    .trim();
  entries.push({
    url: `https://www.anglicandioceseja.org/wp-content/uploads/${s.ym}/${s.file}`,
    church_id: slug,
    caption,
    credit: "anglicandioceseja.org",
    license: "Fair use",
    order: String(baseOrder),
  });
}

fs.writeFileSync("scripts/diocese-batch.json", JSON.stringify(entries, null, 2));
fs.writeFileSync("tmp/diocese-skipped.txt", skipped.join("\n"));
console.log(`Will upload: ${entries.length}`);
console.log(`Skipped: ${skipped.length}`);
console.log("--- Skipped (no slug):");
skipped.forEach((s) => console.log(" ", s));
