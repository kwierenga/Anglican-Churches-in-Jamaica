/**
 * Import 313 churches from the original HTML site's churches-data.js
 * into the React app's data format:
 *   - data/churches.csv       (lightweight catalog for map/sidebar)
 *   - content/churches/*.md   (full detail pages, loaded on demand)
 *   - data/news.json          (news items)
 */
import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'csv-stringify/sync'

const ORIGINAL = path.resolve(
  'C:/Users/klaas/OneDrive/Desktop/jamaica-anglican-churches/Anglican-Churches-in-Jamaica'
)

// ── Load original churches-data.js ──────────────────────────────────────────
let src = fs.readFileSync(path.join(ORIGINAL, 'churches-data.js'), 'utf8')
src = src.replace(/^const churchesData\s*=\s*/, '').replace(/;\s*$/, '')
const churches: any[] = JSON.parse(src)

// ── Normalize classification to match schema enum ───────────────────────────
function normalizeClassification(c: string | undefined): string {
  const map: Record<string, string> = {
    'Church': 'church',
    'Parish Church': 'church',
    'Mission': 'mission',
    'Ruin': 'ruin',
    'Chapel': 'chapel',
    'Cathedral': 'cathedral',
    'Unknown': 'church',
  }
  return map[c ?? ''] ?? 'church'
}

// ── Normalize status ────────────────────────────────────────────────────────
function normalizeStatus(s: string | undefined): string {
  if (!s || s === '' || s === 'unknown') return 'inactive'
  if (s === 'closed') return 'inactive'
  return s // 'active' | 'ruin'
}

// ── Build CSV rows ──────────────────────────────────────────────────────────
const csvRows = churches.map(c => ({
  id: c.id,
  name: c.name,
  parish: c.parish,
  classification: normalizeClassification(c.classification),
  status: normalizeStatus(c.status),
  lat: c.lat,
  lng: c.lng,
  town: c.town ?? '',
}))

const csvOut = stringify(csvRows, {
  header: true,
  columns: ['id', 'name', 'parish', 'classification', 'status', 'lat', 'lng', 'town'],
})

fs.writeFileSync(path.resolve('data/churches.csv'), csvOut)
console.log(`✅ Wrote ${csvRows.length} rows → data/churches.csv`)

// ── Build markdown detail files ─────────────────────────────────────────────
const contentDir = path.resolve('content/churches')
fs.mkdirSync(contentDir, { recursive: true })

let mdCount = 0
for (const c of churches) {
  const sections: string[] = []

  // Title
  const fullName = c.town ? `${c.name}, ${c.town}` : c.name
  sections.push(`# ${fullName}`)
  sections.push(`**${c.parish}** · ${c.classification ?? 'Church'} · ${c.status ?? 'unknown'}`)

  // Intro
  if (c.intro) {
    sections.push('')
    sections.push(c.intro)
  }

  // History
  if (c.history) {
    sections.push('')
    sections.push('## History')
    sections.push(c.history)
  }

  // Architecture
  if (c.architecture) {
    sections.push('')
    sections.push('## Architecture')
    sections.push(c.architecture)
  }

  // Clergy
  if (c.clergy) {
    sections.push('')
    sections.push('## Clergy')
    sections.push(c.clergy)
  }

  // Interesting Facts
  if (c.interestingFacts) {
    sections.push('')
    sections.push('## Notable Facts')
    sections.push(c.interestingFacts)
  }

  const md = sections.join('\n') + '\n'
  fs.writeFileSync(path.join(contentDir, `${c.id}.md`), md)
  mdCount++
}
console.log(`✅ Wrote ${mdCount} markdown files → content/churches/`)

// ── Import news data ────────────────────────────────────────────────────────
let newsSrc = fs.readFileSync(path.join(ORIGINAL, 'js/news.js'), 'utf8')
// Extract just the array
const match = newsSrc.match(/const news\s*=\s*(\[[\s\S]*?\]);/)
if (match) {
  // Use Function constructor to eval safely-ish (it's our own data)
  const newsData = new Function(`return ${match[1]}`)()
  fs.writeFileSync(path.resolve('data/news.json'), JSON.stringify(newsData, null, 2))
  console.log(`✅ Wrote ${newsData.length} news items → data/news.json`)
} else {
  console.warn('⚠️ Could not parse news.js')
}
