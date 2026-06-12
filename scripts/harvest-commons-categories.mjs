// Walk the Wikimedia Commons category tree under church-related Jamaica
// categories, list all image files, and match them against churches that
// currently have NO photo. Read-only report → COMMONS-CATEGORY-MATCHES.txt
import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync } from 'fs'

const UA = { 'User-Agent': 'AnglicanChurchesJamaica/1.0 (klaaswierenga@gmail.com)' }
const API = 'https://commons.wikimedia.org/w/api.php'
async function api(params) {
  const r = await fetch(API + '?' + new URLSearchParams({ format: 'json', ...params }), { headers: UA, signal: AbortSignal.timeout(25000) })
  return r.ok ? r.json() : null
}

const ROOTS = [
  'Category:Churches in Jamaica',
  'Category:Anglican churches in Jamaica',
  'Category:Church buildings in Jamaica',
  'Category:Anglican Diocese of Jamaica',
]
const seenCats = new Set(), files = new Map() // title -> {cat}
const queue = [...ROOTS]
let hops = 0
while (queue.length && hops < 400) {
  const cat = queue.shift()
  if (seenCats.has(cat)) continue
  seenCats.add(cat)
  hops++
  let cont = {}
  do {
    const j = await api({ action: 'query', list: 'categorymembers', cmtitle: cat, cmlimit: '500', cmtype: 'subcat|file', ...cont })
    for (const m of j?.query?.categorymembers || []) {
      if (m.ns === 14) queue.push(m.title)
      else if (m.ns === 6 && /\.(jpe?g|png|webp)$/i.test(m.title)) {
        if (!files.has(m.title)) files.set(m.title, cat)
      }
    }
    cont = j?.continue || null
  } while (cont)
}
console.log(`categories walked: ${seenCats.size}, image files: ${files.size}`)

// fetch license metadata in batches
const titles = [...files.keys()]
const meta = []
for (let i = 0; i < titles.length; i += 50) {
  const j = await api({ action: 'query', titles: titles.slice(i, i + 50).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata' })
  for (const p of Object.values(j?.query?.pages || {})) {
    const ii = p.imageinfo?.[0]; if (!ii) continue
    const em = ii.extmetadata || {}
    const clean = s => (s || '').replace(/<[^>]+>/g, '').trim()
    meta.push({
      title: (p.title || '').replace(/^File:/, ''),
      url: ii.url,
      license: clean(em.LicenseShortName?.value),
      artist: clean(em.Artist?.value).slice(0, 80),
      cat: files.get(p.title),
    })
  }
}

const churches = parse(readFileSync('data/churches.csv'), { columns: true, skip_empty_lines: true })
const media = JSON.parse(readFileSync('data/build/media-index.json', 'utf8'))
const hasPhoto = id => { const m = media[id]; return Array.isArray(m) ? m.length > 0 : !!m }
const STOP = new Set(['st', 'saint', 'the', 'of', 'church', 'parish', 'chapel', 'cure', 'mission', 'anglican', 's', 'and', 'all', 'jamaica', 'jm', 'jpg', 'jpeg', 'png'])
const toks = s => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t && !STOP.has(t))
const mToks = meta.map(m => ({ ...m, toks: new Set(toks(m.title + ' ' + m.cat)) }))

const out = []
const log = (...a) => { out.push(a.join(' ')); console.log(...a) }
log(`\n===== matches for churches WITHOUT photos =====`)
let count = 0
for (const c of churches) {
  if (hasPhoto(c.id)) continue
  const placeToks = toks(c.town || ''), nameToks = toks(c.name)
  const hits = mToks.filter(m =>
    (placeToks.length && placeToks.some(t => m.toks.has(t)) && nameToks.some(t => m.toks.has(t)))
  )
  if (!hits.length) continue
  count++
  log(`\n[NO PHOTO] ${c.name} — ${c.town} (${c.parish})  [${c.id}]`)
  for (const h of hits.slice(0, 6)) log(`   "${h.title}" [${h.license}] by ${h.artist}\n      ${h.url}\n      (from ${h.cat})`)
}
log(`\nchurches without photo matched: ${count}`)
log(`\n===== ALL category files (for manual scan) =====`)
for (const m of meta) log(`${m.title} [${m.license}] — ${m.cat}\n   ${m.url}`)
writeFileSync('COMMONS-CATEGORY-MATCHES.txt', out.join('\n'))
console.log('\nwrote COMMONS-CATEGORY-MATCHES.txt')
