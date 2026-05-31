// Harvest the diocese WordPress media library and match image titles against
// churches in data/churches.csv — especially those with NO photos yet.
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' }
const BASE = 'https://www.anglicandioceseja.org/wp-json/wp/v2/media'

// ── Load churches + existing media ──────────────────────────────────────────
const churches = parse(fs.readFileSync('data/churches.csv'), { columns: true, skip_empty_lines: true })
const media = JSON.parse(fs.readFileSync('data/build/media-index.json', 'utf8'))
const hasPhoto = id => { const m = media[id]; return Array.isArray(m) ? m.length > 0 : !!m }

// Normalize a string to a bag of significant tokens for fuzzy matching.
const STOP = new Set(['st', 'saint', 'the', 'of', 'church', 'parish', 'chapel', 'cure', 'mission', 'anglican', 's', 'and', 'all'])
function tokens(s) {
  return (s || '')
    .toLowerCase()
    .replace(/&#8217;|&#039;|&amp;/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOP.has(t))
}

// ── Pull all media pages ────────────────────────────────────────────────────
async function fetchAll() {
  const first = await fetch(`${BASE}?per_page=100&page=1&media_type=image`, { headers: UA, signal: AbortSignal.timeout(30000) })
  const pages = parseInt(first.headers.get('x-wp-totalpages') || '1', 10)
  const all = await first.json()
  for (let p = 2; p <= pages; p++) {
    try {
      const r = await fetch(`${BASE}?per_page=100&page=${p}&media_type=image`, { headers: UA, signal: AbortSignal.timeout(30000) })
      if (r.ok) all.push(...await r.json())
    } catch (e) { console.error('page', p, 'err', e.message) }
  }
  return all
}

const items = await fetchAll()
console.log(`Fetched ${items.length} image media items`)

// Flatten to {title, url, toks}
const photos = items.map(m => {
  const title = (m.title?.rendered || '').replace(/<[^>]+>/g, '').replace(/&#8217;/g, "'").replace(/&amp;/g, '&').trim()
  const alt = (m.alt_text || '').trim()
  return { title, alt, url: m.source_url || '', toks: new Set([...tokens(title), ...tokens(alt)]) }
}).filter(p => /\.(jpe?g|png|webp)$/i.test(p.url))

console.log(`${photos.length} are real image files\n`)

// ── Match each church (priority: those with NO photo) against the library ────
function score(churchToks, photoToks) {
  if (!churchToks.length) return 0
  let hits = 0
  for (const t of churchToks) if (photoToks.has(t)) hits++
  return hits / churchToks.length
}

const targetParishes = new Set(['St. Ann', 'Portland', 'St. Thomas'])
const results = []
for (const c of churches) {
  const need = !hasPhoto(c.id)
  const ctoks = tokens(c.name + ' ' + (c.town || ''))
  // require the town/place token to appear — name alone (e.g. "St. Mary's") is too generic
  const placeToks = tokens(c.town || '')
  const matches = photos
    .map(p => ({ p, s: score(ctoks, p.toks), placeHit: placeToks.some(t => p.toks.has(t)) }))
    .filter(m => m.placeHit && m.s >= 0.5)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
  if (matches.length) {
    results.push({ id: c.id, name: c.name, town: c.town, parish: c.parish, need, inTargetParish: targetParishes.has(c.parish), matches })
  }
}

// Sort: needed photos first, then target-parish, then by best score
results.sort((a, b) => (b.need - a.need) || (b.inTargetParish - a.inTargetParish) || (b.matches[0].s - a.matches[0].s))

const out = []
out.push(`# Diocese media-library matches\n`)
out.push(`Scanned ${photos.length} image files from the diocese WordPress media library against ${churches.length} churches.\n`)
out.push(`Showing churches with a confident filename/caption match. **NEEDS PHOTO** = church currently has none in our dataset.\n`)
for (const r of results) {
  const flag = r.need ? ' **← NEEDS PHOTO**' : ' (already has photos)'
  const tp = r.inTargetParish ? ' [TRIP PARISH]' : ''
  out.push(`\n### ${r.name} — ${r.town || '?'} (${r.parish})${flag}${tp}`)
  for (const m of r.matches) out.push(`- ${(m.s * 100).toFixed(0)}%  "${m.p.title}"  →  ${m.p.url}`)
}

fs.writeFileSync('DIOCESE-MEDIA-MATCHES.md', out.join('\n') + '\n')
const needed = results.filter(r => r.need)
console.log(`Wrote DIOCESE-MEDIA-MATCHES.md`)
console.log(`Total matched churches: ${results.length}`)
console.log(`  ...of which NEED photos: ${needed.length}`)
console.log(`  ...in your trip parishes (St Ann/Portland/St Thomas) & need photos: ${needed.filter(r => r.inTargetParish).length}`)
