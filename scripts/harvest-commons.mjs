// Harvest Wikimedia Commons for Jamaican Anglican church photos (all CC/PD, so
// reusable with attribution) and report which churches they can identify — flagging
// any that currently have NO photo in our dataset. Read-only: prints a report, does
// not modify data. To attach a match, re-upload to Cloudinary (see the pattern in
// scripts/upload-from-url.ts) with credit "<artist> (<license>, via Wikimedia Commons)".
import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync } from 'fs'

const UA = { 'User-Agent': 'AnglicanChurchesJamaica/1.0 (https://github.com/kwierenga; klaaswierenga@gmail.com)' }
const API = 'https://commons.wikimedia.org/w/api.php'
const out = []
const log = (...a) => { out.push(a.join(' ')); console.log(...a) }
async function api(params) {
  const r = await fetch(API + '?' + new URLSearchParams({ format: 'json', ...params }), { headers: UA, signal: AbortSignal.timeout(25000) })
  return r.ok ? r.json() : null
}

const queries = ['Anglican church Jamaica', 'Anglican churches in Jamaica', 'parish church Jamaica', 'St Peter church Jamaica', 'cathedral Jamaica Spanish Town', 'church Jamaica historic', 'church Jamaica']
const files = new Set()
for (const q of queries) {
  const j = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: '6', srlimit: '100' })
  ;(j?.query?.search || []).forEach(h => files.add(h.title))
}
const titles = [...files]
const meta = []
for (let i = 0; i < titles.length; i += 50) {
  const j = await api({ action: 'query', titles: titles.slice(i, i + 50).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata' })
  for (const p of Object.values(j?.query?.pages || {})) {
    const ii = p.imageinfo?.[0]; if (!ii) continue
    const em = ii.extmetadata || {}
    const clean = s => (s || '').replace(/<[^>]+>/g, '').trim()
    meta.push({ title: (p.title || '').replace(/^File:/, ''), url: ii.url, license: clean(em.LicenseShortName?.value), artist: clean(em.Artist?.value).slice(0, 80) })
  }
}
log(`Commons files with imageinfo: ${meta.length}`)

const churches = parse(readFileSync('data/churches.csv'), { columns: true, skip_empty_lines: true })
const media = JSON.parse(readFileSync('data/build/media-index.json', 'utf8'))
const hasPhoto = id => { const m = media[id]; return Array.isArray(m) ? m.length > 0 : !!m }
const STOP = new Set(['st', 'saint', 'the', 'of', 'church', 'parish', 'chapel', 'cure', 'mission', 'anglican', 's', 'and', 'all', 'jamaica', 'panoramio', 'jpg'])
const toks = s => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t && !STOP.has(t))
const mToks = meta.map(m => ({ ...m, toks: new Set(toks(m.title)) }))

log('\n===== churches Commons can identify (place + name token match) =====')
let identified = 0, noPhoto = 0
for (const c of churches) {
  const placeToks = toks(c.town || ''), nameToks = toks(c.name)
  if (!placeToks.length || !nameToks.length) continue
  const hits = mToks.filter(m => placeToks.some(t => m.toks.has(t)) && nameToks.some(t => m.toks.has(t)))
  if (!hits.length) continue
  identified++
  const np = !hasPhoto(c.id); if (np) noPhoto++
  log(`\n  ${np ? '[NO PHOTO]' : '[has photo]'} ${c.name} — ${c.town} (${c.parish})`)
  hits.slice(0, 4).forEach(h => log(`     "${h.title}"  [${h.license}]  by ${h.artist || '?'}\n        ${h.url}`))
}
log(`\nIdentified churches: ${identified} | NO photo: ${noPhoto}`)
writeFileSync('COMMONS-MATCHES.txt', out.join('\n') + '\n')
console.log('\n(full report → COMMONS-MATCHES.txt)')
