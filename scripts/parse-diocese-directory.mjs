// Parse data/diocese-directory.txt (dump made by fetch-diocese-directory.mjs)
// into data/diocese-directory.json, then cross-reference against
// data/churches.csv and report mismatches both ways.
import { readFileSync, writeFileSync } from 'fs'

const lines = readFileSync('data/diocese-directory.txt', 'utf8').split('\n')

const start = lines.indexOf('CHURCHES BY REGION AND PARISH/DEANERY')
const end = lines.findIndex(l => l.startsWith('Leave a Reply'))
const body = lines.slice(start + 1, end)

const REGIONS = new Set(['KINGSTON REGION', 'MANDEVILLE REGION', 'MONTEGO BAY REGION'])
const DEANERIES = new Set([
  'Kingston', 'Portmore', 'St. Catherine', 'St. Thomas', 'St. Andrew', 'St. Mary',
  'Portland', 'Clarendon', 'MANCHESTER', 'St. Elizabeth', 'St. Ann', 'St. James',
  'Hanover', 'Westmoreland',
])
const SKIP = new Set(['Parish/Deanery', 'Church', 'Contacts', 'Telephone', 'email'])
const isEmail = l => /\S+@\S+\.\S+/.test(l)
const isPhone = l => /^\(?\d{3}\)?[\s\d/-]*\d$/.test(l.replace(/\s+/g, ' '))

const entries = []
let region = null, deanery = null
for (const line of body) {
  if (REGIONS.has(line)) { region = line.replace(' REGION', ''); continue }
  if (DEANERIES.has(line)) {
    deanery = line === 'MANCHESTER' ? 'Manchester' : line
    continue
  }
  if (SKIP.has(line) || isEmail(line) || isPhone(line)) continue
  entries.push({ region, deanery, name: line })
}

writeFileSync('data/diocese-directory.json', JSON.stringify(entries, null, 2) + '\n')
console.log(`parsed ${entries.length} churches into data/diocese-directory.json`)
for (const d of DEANERIES) {
  const dd = d === 'MANCHESTER' ? 'Manchester' : d
  console.log(`  ${dd}: ${entries.filter(e => e.deanery === dd).length}`)
}

// ---- cross-reference against churches.csv ----

function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQ = false
      else field += c
    } else if (c === '"') inQ = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = '' }
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

const STOP = new Set(['ce', 'church', 'mission', 'chapel', 'of', 'ease', 'the', 'parish',
  'and', 'all', 'st', 's', 'ss', 'saint', 'old', 'ruin', 'ruins', 'district', 'cathedral'])
// town tokens too common to carry a match on their own
const GENERIC = new Set(['mount', 'hill', 'hills', 'town', 'bay', 'river', 'grand'])
const norm = s => s
  .toLowerCase()
  .replace(/ephipany/g, 'epiphany') // recurring directory typo
  .replace(/moorland/g, 'moreland') // directory Mt. Moorland = CSV Mount Moreland
  .replace(/c\/e/g, ' ')
  .replace(/\([^)]*\)/g, ' ')
  .replace(/\bmt\b\.?/g, 'mount')
  .replace(/['’.()\-,\/]/g, ' ')
  .split(/\s+/).filter(t => t && !STOP.has(t))

const csvRows = parseCsv(readFileSync('data/churches.csv', 'utf8'))
const header = csvRows[0]
const churches = csvRows.slice(1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])))

// fuzzy token equality: exact, damerau-levenshtein<=1 on tokens >=4 chars
// (Spaulding/Spalding, Ephipany/Epiphany), or one a prefix of the other with
// at most 2 extra chars (duncans/duncan)
function lev1(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++edits > 1) return false
    if (a[i] === b[j + 1] && a[i + 1] === b[j]) { i += 2; j += 2 } // transposition
    else if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else { i++; j++ }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}
const tokEq = (a, b) =>
  a === b ||
  (Math.min(a.length, b.length) >= 4 && lev1(a, b)) ||
  (Math.min(a.length, b.length) >= 4 && Math.abs(a.length - b.length) <= 2 &&
    (a.startsWith(b) || b.startsWith(a)))
const hits = (want, have) => want.filter(w => have.some(h => tokEq(w, h))).length

// score a directory entry against a csv church
function score(entryTokens, ch, deanery) {
  const town = norm(ch.town)
  const name = norm(ch.name)
  // joined town handles Woodall vs "Wood Hall"
  const townJoined = town.join('')
  const townHits = Math.max(
    hits(town, entryTokens),
    entryTokens.some(t => tokEq(t, townJoined)) ? town.length : 0,
  )
  const strongHits = hits(town.filter(t => !GENERIC.has(t)), entryTokens)
  const nameHits = hits(name, entryTokens)
  const townFull = town.length > 0 && townHits === town.length
  const nameFull = name.length > 0 && nameHits === name.length
  const parishBonus = deanery === ch.parish ? 1 : 0
  // community-named stations ("Whitby, C/E", "Woodall, C/E"): every entry
  // token is part of the town (or the whole joined town)
  if (nameHits === 0 && townFull &&
      entryTokens.every(t => town.some(h => tokEq(t, h)) || tokEq(t, townJoined)))
    return town.length * 2 + 2 + parishBonus
  // no-town entries ("St. Michael and All Angels"): distinctive name fully
  // matched and no distinctive entry token left over
  if (townHits === 0 && nameFull && name.length >= 2 &&
      hits(entryTokens, name) === entryTokens.length)
    return name.length + 2 + parishBonus
  // main path: dedication must overlap, and the town must be either fully
  // matched or matched on at least one distinctive (non-generic) token
  if (nameHits === 0) return 0
  if (!townFull && !(nameFull && strongHits >= 1)) return 0
  return townHits * 2 + nameHits + (townFull ? 2 : 0) + parishBonus
}

// hand-verified matches the scorer can't reach (directory name -> csv id);
// null = confirmed absent from churches.csv, suppress fuzzy matching
const OVERRIDES = new Map([
  ["St. John's, Merrivale", 'st-john-s-merrivale-st-andrew'], // CSV: St. John the Evangelist, Meadowbrook
  ['St. Mary Parish Church', 'st-mary-parish-church-port-maria-st-mary'],
  ['St. James Parish Church, Montego Bay', 'st-james-parish-church-sam-sharpe-square-st-james'],
  ["St. Mary's, Lucea Parish Church", 'hanover-parish-church-lucea-hanover'],
  ["St. Gregory's, Red Hills", 'st-george-s-red-hills-clarendon'], // dedication differs — verify
  ["St. Margaret's. Middlesex", 'st-margaret-s-middle-quarters-st-elizabeth'], // Lacovia-cure context — verify
  ['St. George’s, Grand Cayman', null], // site covers Jamaica only
  ["St. Martins, Mt. Trinity", null],
  ["St. Matthew's, Mount Herman", null],
  ['Church of the Holy Spirit, Cumberland', null],
  ['Christ Church, Marley', null],
])

const matchedCsvIds = new Map() // id -> [entries]
const unmatchedDir = []
for (const e of entries) {
  let best = null
  if (OVERRIDES.has(e.name)) {
    const id = OVERRIDES.get(e.name)
    best = id === null ? null : churches.find(ch => ch.id === id)
    if (id !== null && !best) throw new Error(`override id not in CSV: ${id}`)
  } else {
    const tokens = norm(e.name)
    let bestScore = 0
    for (const ch of churches) {
      const s = score(tokens, ch, e.deanery)
      if (s > bestScore) { best = ch; bestScore = s }
    }
    if (bestScore < 3) best = null
  }
  if (best) {
    e.match = best.id
    if (!matchedCsvIds.has(best.id)) matchedCsvIds.set(best.id, [])
    matchedCsvIds.get(best.id).push(e.name)
  } else {
    unmatchedDir.push(e)
  }
}
writeFileSync('data/diocese-directory.json', JSON.stringify(entries, null, 2) + '\n')

console.log(`\nmatched ${entries.length - unmatchedDir.length}/${entries.length} directory entries to churches.csv`)
console.log(`\n-- directory entries with no CSV match (${unmatchedDir.length}):`)
for (const e of unmatchedDir) console.log(`  [${e.deanery}] ${e.name}`)

const collisions = [...matchedCsvIds.entries()].filter(([, es]) => es.length > 1)
console.log(`\n-- CSV churches matched by more than one directory entry (${collisions.length}):`)
for (const [id, es] of collisions) console.log(`  ${id} <- ${es.join(' | ')}`)

const unmatchedCsv = churches.filter(ch => !matchedCsvIds.has(ch.id))
console.log(`\n-- CSV churches not in the directory (${unmatchedCsv.length}):`)
for (const ch of unmatchedCsv) {
  console.log(`  [${ch.parish}] ${ch.name}, ${ch.town} (${ch.classification}/${ch.status})`)
}
