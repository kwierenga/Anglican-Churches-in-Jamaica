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
const rows: any[] = parse(csv, { columns: true, skip_empty_lines: true })

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

// Emit GeoJSON
const fc = {
  type: 'FeatureCollection',
  features: valid.map(v=>({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
    properties: {
      id: v.id, name: v.name, town: v.town,
      parish: v.parish, classification: v.classification, status: v.status
    }
  }))
}
fs.writeFileSync(path.join(OUT,'churches.geo.json'), JSON.stringify(fc, null, 2))

// Emit search index (compact)
const searchIndex = valid.map(v=>({
  id: v.id, name: v.name, town: v.town,
  parish: v.parish, classification: v.classification, status: v.status,
  lat: v.lat, lng: v.lng
}))
fs.writeFileSync(path.join(OUT,'search-index.json'), JSON.stringify(searchIndex, null, 2))

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
  gothic_revival: /\bgothic(?:\s+revival)?\b|\b(?:lancet|pointed\s+arch|buttress|flying\s+buttress)\b/i,
  vernacular: /\bvernacular\b|\blouvred\b|\bverandah\b|\btimber[-\s]?frame\b|\bshingle[d]?\s+roof\b/i,
  estate_chapel: /\b(?:sugar|coffee)\s+estate\s+chapel\b|\bestate\s+chapel\b|\bplantation\s+chapel\b/i,
  modernist: /\bmodernist\b|\bconcrete\b.{0,30}\b(?:post[-\s]?war|mid[-\s]?century|1950s|1960s|1970s|modern)\b|\bpost[-\s]?independence\s+concrete\b/i,
}

function extractStyles(text: string): ArchStyle[] {
  const out: ArchStyle[] = []
  for (const s of Object.keys(STYLE_PATTERNS) as ArchStyle[]) {
    if (STYLE_PATTERNS[s].test(text)) out.push(s)
  }
  return out
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
  const body = text.split(/^##\s+References\b/mi)[0]
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
    const styles = extractStyles(text)
    const isRuin = v.classification === 'ruin' || v.status === 'ruin'
    // Estate chapel as standalone category only for classification=chapel
    const filteredStyles = styles.filter(s => s !== 'estate_chapel' || v.classification === 'chapel' || v.classification === 'church')
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

  console.log(`✅ Wrote ${valid.length} features → churches.geo.json, search-index.json, media-index.json, architecture-index.json, clergy-index.json`)
} else {
  console.log(`✅ Wrote ${valid.length} features → data/build/churches.geo.json & search-index.json & media-index.json`)
}
