import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { ChurchRow, ChurchRowSchema, MediaRow, MediaRowSchema, validParishes } from '../src/lib/schemas.js'

const SRC = path.resolve('data/churches.csv')
const OUT = path.resolve('data/build')
const CONTENT_DIR = path.resolve('content/churches')
fs.mkdirSync(OUT, { recursive: true })

function warn(msg: string){ console.warn(`⚠️  ${msg}`) }
function err(msg: string){ console.error(`❌ ${msg}`) }

if(!fs.existsSync(SRC)){ err(`Missing ${SRC}. Create data/churches.csv first.`); process.exit(1) }

const csv = fs.readFileSync(SRC, 'utf8')
// relax_column_count so optional metadata columns (#3) can be added to the
// header and filled in for only some rows without padding every row. Required
// fields are still enforced by the Zod schema below.
const rows: any[] = parse(csv, { columns: true, skip_empty_lines: true, relax_column_count: true })

const seen = new Set<string>()
const valid: ChurchRow[] = []
let errors = 0

for(const r of rows){
  const z = ChurchRowSchema.safeParse(r)
  if(!z.success){
    errors++
    err(`Invalid row for id="${r.id ?? '(missing)'}"`)
    z.error.issues.forEach(i => warn(`  - ${i.path.join('.')}: ${i.message}`))
    continue
  }
  const row = z.data

  // Duplicate ID check
  if(seen.has(row.id)){ errors++; err(`Duplicate id "${row.id}"`); continue }
  seen.add(row.id)

  // Parish whitelist (soft warn if not recognized)
  if(!validParishes.has(row.parish)){
    warn(`Row id="${row.id}" uses unrecognized parish "${row.parish}". Check spelling.`)
  }

  valid.push(row)
}

if(errors>0){
  err(`Aborting due to ${errors} error(s). Fix CSV and retry.`)
  process.exit(1)
}

// Emit media index
const MEDIA_SRC = path.resolve('data/media.csv')
type MediaByChurch = Record<string, MediaRow[]>
const mediaIndex: MediaByChurch = {}

if(fs.existsSync(MEDIA_SRC)){
  const mediaRows: any[] = parse(fs.readFileSync(MEDIA_SRC, 'utf8'), { columns: true, skip_empty_lines: true })
  for(const r of mediaRows){
    const z = MediaRowSchema.safeParse(r)
    if(!z.success){
      warn(`Skipping invalid media row for church_id="${r.church_id ?? '(missing)'}": ${z.error.issues.map(i=>i.message).join(', ')}`)
      continue
    }
    const row = z.data
    if(!mediaIndex[row.church_id]) mediaIndex[row.church_id] = []
    mediaIndex[row.church_id].push(row)
  }
  // Sort each church's media by order
  for(const id of Object.keys(mediaIndex))
    mediaIndex[id].sort((a,b)=>a.order - b.order)
}

fs.writeFileSync(path.join(OUT,'media-index.json'), JSON.stringify(mediaIndex, null, 2))

// --- Derived indices from narrative markdown ---------------------------------

type ArchStyle = 'georgian' | 'gothic_revival' | 'vernacular' | 'estate_chapel' | 'modernist'
type StyleIndex = Record<ArchStyle, string[]>
const styleIndex: StyleIndex = { georgian: [], gothic_revival: [], vernacular: [], estate_chapel: [], modernist: [] }
// Per-church architectural styles, injected into geo + search-index so the
// church page Key Facts panel can show them without an extra fetch.
const stylesById: Record<string, ArchStyle[]> = {}

interface NarrativeChurch {
  id: string
  name: string
  parish: string
  classification: ChurchRow['classification']
  status: ChurchRow['status']
  town: string
  styles: ArchStyle[]
  clergy: string[]
}
const narrativeIndex: NarrativeChurch[] = []

// Clergy-mention regex: capture "Rev. X", "Bishop X", "Archbishop X", "Archdeacon X",
// "Canon X", "Rt. Rev. X", "Very Revd. X" — two or three capitalised words after the title.
// Deliberately permissive; we post-filter against a common-word blocklist.
const CLERGY_RE = /\b((?:Rt\.?\s+Revd?|Very\s+Revd?|Revd?\.?|Rev\.?|Canon|Dean|Bishop|Archbishop|Archdeacon|Father|Mother|Sister)\.?)\s+([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){1,3})/g

const CLERGY_BLOCKLIST = new Set([
  'Jamaica', 'London', 'Kingston', 'The', 'Our', 'His', 'Her', 'Of', 'In', 'At',
  'Act', 'Emancipation', 'Baptist', 'War', 'Church', 'God', 'Lord', 'Christ',
  'Holy Orders', 'Candidates', 'Canterbury', 'West Indies', 'Diocese', 'Native',
  'Anglican', 'Baptist Missionary', 'Archbishop of',
])

const STYLE_PATTERNS: Record<ArchStyle, RegExp> = {
  georgian: /\bgeorgian\b/i,
  gothic_revival: /\bgothic(?:\s+revival)?\b|\b(?:lancet|pointed\s+arch|buttress|flying\s+buttress|trefoil|quatrefoil|tracery|battlemented|crenellated)\b/i,
  vernacular: /\bvernacular\b|\blouvred\b|\bverandah\b|\btimber[-\s]?frame\b|\bshingle[d]?\s+roof\b|\bmasonry\s+(?:chapel|mission|church)\s+of\s+the\s+kind\b|\bmodest\s+masonry\s+(?:church|chapel|building)\b|\bmodest\s+(?:church|chapel)\s+of\s+the\s+kind\b|\bbuilt\s+by\s+the\s+anglican\s+diocese\s+(?:across|in)\s+rural\b|\bzinc\s+roof\b|\bgalvani[sz]ed\s+(?:roof|sheet)/i,
  estate_chapel: /\b(?:sugar|coffee)\s+estate\s+chapel\b|\bestate\s+chapel\b|\bplantation\s+chapel\b|\bbuilt\s+(?:by|on)\s+the\s+(?:[A-Z][a-z]+\s+)?estate\b/i,
  modernist: /\bmodernist\b|\bconcrete\b.{0,30}\b(?:post[-\s]?war|mid[-\s]?century|1950s|1960s|1970s|modern)\b|\bpost[-\s]?independence\s+concrete\b|\b(?:reinforced\s+concrete|concrete\s+block|breeze\s+block|a[-\s]?frame)\b.{0,80}\b(?:church|chapel)|\b(?:1960s|1970s|1980s)\b.{0,40}\bchurch\b/i,
}

function extractStyles(text: string): ArchStyle[] {
  const out: ArchStyle[] = []
  for (const s of Object.keys(STYLE_PATTERNS) as ArchStyle[]) {
    if (STYLE_PATTERNS[s].test(text)) out.push(s)
  }
  return out
}

// JNHT-confirmed designations (Jamaica National Heritage Trust, jnht.com).
// These override the regex pass for the listed slugs — JNHT is authoritative
// on heritage-listed buildings and resolves cases where regex misclassifies,
// misses entirely, or where the building is a hybrid across periods.
//
// Plus date-inferred designations (era rules: <1830 Georgian; 1830–1880
// Gothic Revival; 1880–1920 Vernacular for missions/Gothic Revival for
// parish churches; 1920–1950 Vernacular; 1950+ Modernist) for churches
// where regex didn't catch a style but the narrative gives a build year.
const MANUAL_STYLE_OVERRIDES: Record<string, ArchStyle[]> = {
  // === JNHT-confirmed (authoritative) ===
  // Hybrid: round-headed AND pointed arches, classical quoins, medieval buttresses
  'st-jago-de-la-vega-the-cathedral-spanish-town-st-catherine': ['georgian', 'gothic_revival'],
  // Hybrid: yellow brick + battlements + pinnacles + classical elements
  'st-john-s-parish-church-black-river-st-elizabeth': ['georgian', 'gothic_revival'],
  // Hybrid: 1836 mid-19th c, brick + stone, four-storey tower
  'christ-church-parish-church-port-antonio-portland': ['georgian', 'gothic_revival'],
  // 1725 T-shaped, square battlemented tower (Georgian, not Gothic Revival)
  'hanover-parish-church-lucea-hanover': ['georgian'],
  // ~1715, "Georgian influences, quoins, castellations"
  'st-peter-s-church-alley-clarendon': ['georgian'],
  // 1865 Nuttall-era brick parish church
  'christ-church-morant-bay-st-thomas': ['gothic_revival'],
  // 1814 cut stone (English ballast), castellated clock tower
  'st-george-s-buff-bay-portland': ['georgian'],
  // 1795 colonial parish church
  'st-peter-s-parish-church-falmouth-trelawny': ['georgian'],

  // === Date-inferred ===
  // Pre-1830 -> Georgian Colonial
  'st-paul-s-chapelton-clarendon': ['georgian'],                          // 1664
  'st-cyprians-august-town-st-andrew': ['georgian'],                      // 1821
  'st-andrew-parish-church-half-way-tree-st-andrew': ['georgian'],        // 1664
  'st-james-parish-church-sam-sharpe-square-st-james': ['georgian'],      // 1774
  // 1830–1880 -> Gothic Revival
  'st-john-s-sligoville-st-catherine': ['gothic_revival'],                // 1838
  'st-augustine-s-mountainside-st-elizabeth': ['gothic_revival'],         // 1838
  'st-mary-parish-church-port-maria-st-mary': ['gothic_revival'],         // 1861
  'st-peter-s-petersfield-westmoreland': ['gothic_revival'],              // 1843
  // 1880–1920 -> Vernacular for small/mission, Gothic Revival for parish churches
  'st-michael-s-church-hannah-town-kingston': ['vernacular'],             // 1907
  'st-alban-s-kingston-kingston': ['vernacular'],                         // 1888
  'all-saints-west-branch-kingston': ['vernacular'],                      // 1907
  'church-of-the-good-shepherd-constant-spring-st-andrew': ['vernacular'],// 1918
  'st-philip-s-whitfield-town-st-andrew': ['vernacular'],                 // 1917
  'st-mary-s-malvern-st-elizabeth': ['vernacular'],                       // 1914
  'st-george-s-savanna-la-mar-parish-church-westmoreland': ['gothic_revival'], // 1903 (parish church)
  // 1920–1950 -> Vernacular
  'st-peter-s-pedro-plains-st-elizabeth': ['vernacular'],                 // 1941
  // 1950+ -> Modernist
  'st-luke-s-church-cross-roads-st-andrew': ['modernist'],                // 1980
}

const NAME_STOP_WORDS = new Set([
  'Kingston', 'Jamaica', 'London', 'England', 'Diocese', 'Parish', 'Church',
  'Cathedral', 'Chapel', 'Hall', 'School', 'College', 'Palace', 'Park',
  'Road', 'Street', 'Avenue', 'Bay', 'Town', 'Square', 'River', 'Hill',
  'Mountain', 'Valley', 'Rebellion', 'War', 'Emancipation', 'Abolition',
  'Christmas', 'Easter', 'Anglican', 'Baptist', 'Presbyterian', 'Catholic',
  'Wesleyan', 'Methodist', 'Council', 'Society', 'Brotherhood', 'Mission',
  'Native', 'House', 'Foundation',
])

function trimToName(name: string): string {
  const parts = name.split(/\s+/)
  const kept: string[] = []
  for (const p of parts) {
    if (NAME_STOP_WORDS.has(p.replace(/['\u2019]s$/, ''))) break
    if (!/^[A-Z]/.test(p)) break
    kept.push(p)
  }
  return kept.join(' ').trim().replace(/['\u2019]s$/, '')
}

function extractClergy(text: string): string[] {
  const seen = new Set<string>()
  // Only scan the narrative body, skipping the References section (which lists authors)
  let body = text.split(/^##\s+References\b/mi)[0]
  // Strip single-letter middle initials (e.g., 'David A.' -> 'David') so names
  // like 'Rev. David A. Reid' aren't truncated mid-pattern.
  body = body.replace(/(\s)[A-Z]\.(?=\s)/g, '$1')
  // Strip quoted or parenthesized nicknames (e.g., '"Tony"', '(Tony)') that
  // would otherwise interrupt the capitalised-name run.
  body = body.replace(/\s+["“][A-Z][A-Za-z'’-]*["”]/g, '')
  body = body.replace(/\s+\([A-Z][A-Za-z'’-]*\)/g, '')
  CLERGY_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = CLERGY_RE.exec(body)) !== null) {
    const title = m[1].replace(/\.$/, '')
    const rawName = m[2].trim()
    if (CLERGY_BLOCKLIST.has(rawName)) continue
    if (/^(?:January|February|March|April|May|June|July|August|September|October|November|December|Easter|Christmas|National)\b/.test(rawName)) continue
    const name = trimToName(rawName)
    // Must have at least a first+last name
    if (name.split(/\s+/).length < 2) continue
    const key = `${title} ${name}`
    seen.add(key)
  }
  return Array.from(seen).sort()
}

if (fs.existsSync(CONTENT_DIR)) {
  for (const v of valid) {
    const mdPath = path.join(CONTENT_DIR, `${v.id}.md`)
    if (!fs.existsSync(mdPath)) {
      narrativeIndex.push({
        id: v.id, name: v.name, parish: v.parish, classification: v.classification,
        status: v.status, town: v.town, styles: [], clergy: [],
      })
      continue
    }
    const text = fs.readFileSync(mdPath, 'utf8')
    const styles = MANUAL_STYLE_OVERRIDES[v.id] ?? extractStyles(text)
    const isRuin = v.classification === 'ruin' || v.status === 'ruin'
    // Estate chapel as standalone category only for classification=chapel
    const filteredStyles = styles.filter(s => s !== 'estate_chapel' || v.classification === 'chapel' || v.classification === 'church')
    stylesById[v.id] = filteredStyles
    if (!isRuin) {
      for (const s of filteredStyles) styleIndex[s].push(v.id)
    }
    narrativeIndex.push({
      id: v.id, name: v.name, parish: v.parish, classification: v.classification,
      status: v.status, town: v.town, styles: filteredStyles, clergy: extractClergy(text),
    })
  }
  fs.writeFileSync(path.join(OUT, 'architecture-index.json'), JSON.stringify(styleIndex, null, 2))

  // Clergy index: clergy-name -> [{ church-id, church-name, parish }]
  const clergyIndex: Record<string, Array<{ id: string; name: string; parish: string }>> = {}
  for (const c of narrativeIndex) {
    for (const name of c.clergy) {
      if (!clergyIndex[name]) clergyIndex[name] = []
      clergyIndex[name].push({ id: c.id, name: c.name, parish: c.parish })
    }
  }
  // Keep only clergy named in 1+ narrative (all of them) but sort and drop single-mention
  // spurious captures by requiring mention in at least one place; we already dedupe per-file.
  const clergyIndexSorted = Object.fromEntries(
    Object.entries(clergyIndex).sort(([a], [b]) => {
      // Sort by last token (surname)
      const la = a.split(/\s+/).pop()!
      const lb = b.split(/\s+/).pop()!
      return la.localeCompare(lb)
    })
  )
  fs.writeFileSync(path.join(OUT, 'clergy-index.json'), JSON.stringify(clergyIndexSorted, null, 2))

  console.log(`✅ Wrote architecture-index.json, clergy-index.json`)
}

// Optional structured metadata (#3) — only emitted when present in the CSV.
function meta(v: ChurchRow) {
  return {
    styles: stylesById[v.id] ?? [],
    ...(v.founding_year != null ? { founding_year: v.founding_year } : {}),
    ...(v.patron_saint ? { patron_saint: v.patron_saint } : {}),
    ...(v.heritage ? { heritage: v.heritage } : {}),
  }
}

// Emit GeoJSON (after narrative processing so per-church styles are available)
const fc = {
  type: 'FeatureCollection',
  features: valid.map(v=>({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
    properties: {
      id: v.id, name: v.name, town: v.town,
      parish: v.parish, classification: v.classification, status: v.status,
      ...meta(v),
    }
  }))
}
fs.writeFileSync(path.join(OUT,'churches.geo.json'), JSON.stringify(fc, null, 2))

// Emit search index (compact)
const searchIndex = valid.map(v=>({
  id: v.id, name: v.name, town: v.town,
  parish: v.parish, classification: v.classification, status: v.status,
  lat: v.lat, lng: v.lng,
  ...meta(v),
}))
fs.writeFileSync(path.join(OUT,'search-index.json'), JSON.stringify(searchIndex, null, 2))

console.log(`✅ Wrote ${valid.length} features → churches.geo.json, search-index.json, media-index.json`)
