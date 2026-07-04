/**
 * One-off: find churches with <2 photos in the parishes reachable on a
 * Kingston-based trip (Kgn, the Kgn↔Ocho Rios corridor, St. Ann, St. Elizabeth),
 * then emit a Google My Maps-compatible KML with one placemark per church.
 */
import { readFileSync, writeFileSync } from 'node:fs'

// Minimal CSV parser handling quoted fields with commas.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

const churchesRaw = parseCsv(readFileSync('data/churches.csv', 'utf8'))
const mediaRaw = parseCsv(readFileSync('data/media.csv', 'utf8'))

const cHead = churchesRaw[0]
const idx = (h: string) => cHead.indexOf(h)
const churches = churchesRaw.slice(1).map((r) => ({
  id: r[idx('id')],
  name: r[idx('name')],
  parish: r[idx('parish')],
  classification: r[idx('classification')],
  status: r[idx('status')],
  lat: parseFloat(r[idx('lat')]),
  lng: parseFloat(r[idx('lng')]),
  town: r[idx('town')],
}))

// Count photos per church_id (column 0 in media.csv).
const photoCount = new Map<string, number>()
for (const r of mediaRaw.slice(1)) {
  const cid = r[0]
  photoCount.set(cid, (photoCount.get(cid) ?? 0) + 1)
}

// Region grouping for the trip.
const REGION: Record<string, string> = {
  Kingston: 'Kingston metro',
  'St. Andrew': 'Kingston metro',
  'St. Catherine': 'Kgn↔Ocho corridor',
  'St. Mary': 'Kgn↔Ocho corridor',
  'St. Ann': 'St. Ann / Ocho Rios',
  'St. Elizabeth': 'St. Elizabeth',
}

const targets = churches
  .filter((c) => REGION[c.parish] !== undefined)
  .map((c) => ({ ...c, photos: photoCount.get(c.id) ?? 0, region: REGION[c.parish] }))
  .filter((c) => c.photos < 2)
  .filter((c) => !Number.isNaN(c.lat) && !Number.isNaN(c.lng))

// Sort by region, then parish, then town.
const regionOrder = ['Kingston metro', 'Kgn↔Ocho corridor', 'St. Ann / Ocho Rios', 'St. Elizabeth']
targets.sort((a, b) =>
  regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region) ||
  a.parish.localeCompare(b.parish) ||
  a.town.localeCompare(b.town))

// ---- Console report ----
let curRegion = ''
const lines: string[] = []
for (const c of targets) {
  if (c.region !== curRegion) { curRegion = c.region; lines.push(`\n## ${curRegion}`) }
  const tag = c.photos === 0 ? 'NO photos' : '1 photo'
  const st = c.status !== 'active' ? ` [${c.status}]` : ''
  lines.push(`- ${c.name} — ${c.town}, ${c.parish} (${tag})${st}  ${c.lat.toFixed(5)},${c.lng.toFixed(5)}`)
}
const zero = targets.filter((c) => c.photos === 0).length
console.log(`Total churches with <2 photos in trip parishes: ${targets.length} (${zero} with none, ${targets.length - zero} with one)`)
console.log(lines.join('\n'))

// ---- KML ----
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Google My Maps colours placemarks by <styleUrl>; give each region a colour.
const styleByRegion: Record<string, string> = {
  'Kingston metro': 'crimson',
  'Kgn↔Ocho corridor': 'blue',
  'St. Ann / Ocho Rios': 'green',
  'St. Elizabeth': 'purple',
}
const pinColor: Record<string, string> = {
  crimson: 'ff0000c8', blue: 'ffc87800', green: 'ff14b814', purple: 'ffc800c8',
}
const styles = Object.entries(pinColor).map(([k, abgr]) => `  <Style id="${k}">
    <IconStyle><color>${abgr}</color><scale>1.1</scale>
      <Icon><href>http://maps.google.com/mapfiles/kml/paddle/blank-blank.png</href></Icon>
    </IconStyle>
  </Style>`).join('\n')

const placemark = (c: (typeof targets)[number]) => {
  const tag = c.photos === 0 ? 'No photos yet' : '1 photo — needs more'
  const desc = `${esc(c.name)}, ${esc(c.town)} (${esc(c.parish)}). ${tag}. Status: ${c.status}.`
  return `      <Placemark>
        <name>${esc(c.name)} — ${esc(c.town)}</name>
        <description>${desc}</description>
        <styleUrl>#${styleByRegion[c.region]}</styleUrl>
        <Point><coordinates>${c.lng},${c.lat},0</coordinates></Point>
      </Placemark>`
}

// One <Folder> per region → Google My Maps imports each as a separate,
// toggleable layer.
const folders = regionOrder
  .map((region) => {
    const members = targets.filter((c) => c.region === region)
    if (!members.length) return ''
    return `    <Folder>
      <name>${esc(region)} (${members.length})</name>
${members.map(placemark).join('\n')}
    </Folder>`
  })
  .filter(Boolean)
  .join('\n')

const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Jamaica churches to photograph (&lt;2 photos)</name>
    <description>Anglican churches with fewer than 2 photos in Kingston, the Kingston-Ocho Rios corridor, St. Ann, and St. Elizabeth. Crimson=Kingston metro, Blue=corridor, Green=St. Ann, Purple=St. Elizabeth.</description>
${styles}
${folders}
  </Document>
</kml>
`
writeFileSync('churches-to-photograph.kml', kml)
writeFileSync('public/churches-to-photograph.kml', kml)
console.log(`\nWrote churches-to-photograph.kml + public/ copy (${targets.length} placemarks, ${regionOrder.filter((r) => targets.some((c) => c.region === r)).length} layers)`)
