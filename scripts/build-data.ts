import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { ChurchRow, ChurchRowSchema, MediaRow, MediaRowSchema, validParishes } from '../src/lib/schemas.js'

const SRC = path.resolve('data/churches.csv')
const OUT = path.resolve('data/build')
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
  parish: v.parish, classification: v.classification, status: v.status
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

console.log(`✅ Wrote ${valid.length} features → data/build/churches.geo.json & search-index.json & media-index.json`)
