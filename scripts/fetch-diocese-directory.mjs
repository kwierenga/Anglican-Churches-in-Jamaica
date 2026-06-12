// Fetch the Diocese "Churches by Deanery" page and dump its visible text
// to data/diocese-directory.txt for parsing/cross-referencing.
import { writeFileSync } from 'fs'

const UA = { 'User-Agent': 'AnglicanChurchesJamaica/1.0 (klaaswierenga@gmail.com)' }
const URL = 'https://www.anglicandioceseja.org/?page_id=2731'

const r = await fetch(URL, { headers: UA, signal: AbortSignal.timeout(30000) })
if (!r.ok) throw new Error(`HTTP ${r.status}`)
const html = await r.text()

// strip scripts/styles, convert breaks/cells to newlines, strip tags
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<(br|\/p|\/div|\/li|\/td|\/th|\/tr|\/h[1-6])[^>]*>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&#8217;|&rsquo;/g, "'")
  .replace(/&#8216;|&lsquo;/g, "'")
  .replace(/&#8211;|&ndash;/g, '–')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .split('\n').map(s => s.trim()).filter(Boolean).join('\n')

writeFileSync('data/diocese-directory.txt', text)
console.log(`wrote data/diocese-directory.txt (${text.split('\n').length} lines)`)
