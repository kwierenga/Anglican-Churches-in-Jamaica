/**
 * Scrapes events and news from multiple sources into a unified feed.
 *
 * Sources:
 *   1. Anglican Diocese of Jamaica (anglicandioceseja.org)
 *   2. Jamaica Gleaner — Anglican/church coverage, via Google News RSS
 *
 * Retired: Anglican Communion News Service (anglicannews.org). Its news index
 * returns 403 to non-browser clients regardless of User-Agent, and it publishes
 * no working RSS, so the scraper contributed nothing while the site still
 * advertised it as a source. Removed rather than left failing silently.
 *
 * Lifecycle:
 *   - Items with date > today       → shown as Events (upcoming)
 *   - Items with date <= today       → shown as News  (past)
 *   - Items older than 6 months      → retired (removed)
 *   - Items more than 6 months ahead → excluded
 *
 * Also writes data/feed-meta.json — run timestamp and per-source health — so the
 * News page can say when the feed was last checked instead of silently ageing.
 *
 * Usage: npx tsx scripts/fetch-news.ts
 */
import * as cheerio from 'cheerio'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FEED_FILE = join(__dirname, '..', 'data', 'feed.json')
const META_FILE = join(__dirname, '..', 'data', 'feed-meta.json')
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

interface SourceHealth {
  name: string
  ok: boolean
  items: number
  note?: string
}
const health: SourceHealth[] = []

interface FeedItem {
  id: string
  date: string
  title: string
  summary: string
  report: string
  category: string
  parish: string | null
  source: string
  url: string
}

// ── Date utilities ───────��──────────────────────────────────────────────────

const DATE_RE = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}(?:st|nd|rd|th)?,?\s+)?\d{4}\b/i

function parseDate(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) return trimmed.slice(0, 10)
  const monthYear = trimmed.match(/^(\w+)\s+(\d{4})$/)
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return ''
}

function isWithinWindow(dateStr: string): boolean {
  if (!dateStr) return true
  const d = new Date(dateStr).getTime()
  if (isNaN(d)) return true
  const now = Date.now()
  return d >= now - SIX_MONTHS_MS && d <= now + SIX_MONTHS_MS
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

// ── Source 1: Anglican Diocese of Jamaica ────────────────────────────────────

const DIOCESE_URL = 'https://www.anglicandioceseja.org'

const NON_ARTICLE = [
  '/about-us/', '/our-ministries/', '/facilities/', '/the-anglican-communion/',
  '/contact-us/', '/resources/', '/schools/', '/youth-ministry/',
  '/donate', '/privacy', '/terms', '/category/', '/tag/', '/page/',
  '/education-youth/', '/cycle-of-prayer/', '/baptism/', '/confirmation/',
  '/stewardship/', '/anglican-youth/', '/brotherhood/', '/mothers-union/',
  '/supplementary-ministry', '/vision-purpose', '/churches-by-parish',
  '/find-a-church', '/the-anglican-2/', '/pdf-resource/',
  '/cathedral-chapter', '/clerical-directory', '/property-db', '/property-database',
  '/worship-resources', '/spiritual-path', '/brochures', '/bookmarker',
  '/200th-anniversary', '/bible-study', '/lenten', '/advent',
  '/back-to-school', '/restore-hope', '/anglican-brochures',
  '/our-spiritual-path', '/worship-resources', '/links/'
]

function isArticleUrl(url: string): boolean {
  const path = new URL(url).pathname
  if (path === '/' || path === '/news/' || path === '/news') return false
  return !NON_ARTICLE.some(seg => path.includes(seg))
}

async function fetchArticleDetails(url: string): Promise<{ date: string; summary: string; category: string }> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!r.ok) return { date: '', summary: '', category: '' }
    const html = await r.text()
    const $ = cheerio.load(html)

    let date = parseDate(
      $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      $('time').first().text() ||
      $('.date, .entry-date, .post-date').first().text() || ''
    )

    if (!date) {
      const bodyHtml = $.html()
      const spaced = bodyHtml.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ')
      const $spaced = cheerio.load(spaced)
      const match = $spaced.text().match(DATE_RE)
      if (match) {
        date = parseDate(match[0].replace(/(\d+)(st|nd|rd|th)/g, '$1'))
      }
    }

    let summary = ''
    $('article p, .entry-content p, .post-content p, .elementor-widget-text-editor p').each((_, el) => {
      if (summary) return
      const cleaned = ($(el).html() || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (cleaned.length > 40) summary = cleaned.slice(0, 300)
    })

    const category = $('[rel="tag"], .category-link, .post-categories a').first().text().trim()
    return { date, summary, category }
  } catch {
    return { date: '', summary: '', category: '' }
  }
}

async function scrapeDiocese(): Promise<FeedItem[]> {
  console.log(`📡 Fetching Anglican Diocese: ${DIOCESE_URL}/news ...`)
  try {
    const res = await fetch(`${DIOCESE_URL}/news`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) {
      console.warn(`  ⚠️ HTTP ${res.status}`)
      health.push({ name: 'Anglican Diocese of Jamaica', ok: false, items: 0, note: `HTTP ${res.status}` })
      return []
    }
    const html = await res.text()
    const $ = cheerio.load(html)

    const urlSet = new Set<string>()
    const links: { title: string; url: string }[] = []

    $('a').each((_, el) => {
      const href = $(el).attr('href') || ''
      const text = $(el).text().trim()
      if (!href.includes('anglicandioceseja.org') || !text || text.length < 15 || urlSet.has(href)) return
      try { if (!isArticleUrl(href)) return } catch { return }
      urlSet.add(href)
      links.push({ title: text, url: href })
    })

    console.log(`  Found ${links.length} article links, fetching details...`)
    const results: FeedItem[] = []

    for (let i = 0; i < links.length; i += 5) {
      const batch = links.slice(i, i + 5)
      const details = await Promise.all(batch.map(l => fetchArticleDetails(l.url)))
      batch.forEach((link, j) => {
        results.push({
          id: slugify(link.title),
          date: details[j].date,
          title: link.title,
          summary: details[j].summary,
          report: '',
          category: details[j].category || 'diocese',
          parish: null,
          source: 'Anglican Diocese of Jamaica',
          url: link.url,
        })
      })
    }

    console.log(`  ✅ ${results.length} items from Diocese`)
    health.push({ name: 'Anglican Diocese of Jamaica', ok: true, items: results.length })
    return results
  } catch (err) {
    console.warn(`  ⚠️ Diocese scrape failed: ${err}`)
    health.push({ name: 'Anglican Diocese of Jamaica', ok: false, items: 0, note: String(err).slice(0, 120) })
    return []
  }
}

// ── Source 2: Jamaica Gleaner — Anglican/church news ─────────────────────────

// The Gleaner's on-site search (?s=) is no longer scrapeable: the server ignores the
// query and serves the homepage, and the real search is a client-side Google Custom
// Search widget that a plain fetch can't execute — which is why the old selectors
// always returned 0. Instead we discover Gleaner coverage through Google News RSS
// (which indexes the Gleaner) and keep only Gleaner-published items. The RSS link is
// a Google redirect, but it resolves to the article and is clickable, satisfying the
// feed's "every item must be reachable" rule.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

async function scrapeGleaner(): Promise<FeedItem[]> {
  const RSS_URL =
    'https://news.google.com/rss/search?q=' +
    encodeURIComponent('anglican jamaica') +
    '&hl=en-JM&gl=JM&ceid=JM:en'
  console.log(`📡 Fetching Gleaner (via Google News): ${RSS_URL} ...`)
  try {
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      console.warn(`  ⚠️ HTTP ${res.status}`)
      health.push({ name: 'Jamaica Gleaner', ok: false, items: 0, note: `HTTP ${res.status}` })
      return []
    }
    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const results: FeedItem[] = []
    const seen = new Set<string>()

    $('item').each((_, el) => {
      const $el = $(el)
      const source = $el.find('source').text().trim()
      // Keep only Gleaner-published items so the feed's source label stays honest.
      if (!/gleaner/i.test(source)) return

      // Google News titles are "Headline - Source"; strip the trailing source.
      const rawTitle = $el.find('title').text().trim()
      const title = rawTitle.replace(/\s+-\s+[^-]+$/, '').trim()
      const url = $el.find('link').text().trim()
      if (!title || title.length < 12 || !url || seen.has(url)) return
      seen.add(url)

      const date = parseDate($el.find('pubDate').text())

      results.push({
        id: slugify(title),
        date,
        title,
        summary: '',
        report: '',
        category: 'parish',
        parish: null,
        source: 'Jamaica Gleaner',
        url,
      })
    })

    console.log(`  ✅ ${results.length} items from Gleaner`)
    health.push({ name: 'Jamaica Gleaner', ok: true, items: results.length })
    return results
  } catch (err) {
    console.warn(`  ⚠️ Gleaner scrape failed: ${err}`)
    health.push({ name: 'Jamaica Gleaner', ok: false, items: 0, note: String(err).slice(0, 120) })
    return []
  }
}

// ── Main: merge, dedupe, retire, write ───────────���──────────────────────────

async function main() {
  // Load existing feed (includes manually curated items)
  let existing: FeedItem[] = []
  if (existsSync(FEED_FILE)) {
    try { existing = JSON.parse(readFileSync(FEED_FILE, 'utf-8')) } catch {}
  }

  // Scrape all sources in parallel
  const [diocese, gleaner] = await Promise.all([
    scrapeDiocese(),
    scrapeGleaner(),
  ])

  const scraped = [...diocese, ...gleaner]
  console.log(`\n📊 Total scraped: ${scraped.length} items`)

  // Merge: existing items win (preserves manual edits, reports)
  // Scraped items are added if URL is new
  const byUrl = new Map<string, FeedItem>()
  const byId = new Map<string, FeedItem>()

  for (const item of existing) {
    if (item.url) byUrl.set(item.url, item)
    byId.set(item.id, item)
  }

  for (const item of scraped) {
    // Skip if we already have this URL or ID
    if (item.url && byUrl.has(item.url)) continue
    if (byId.has(item.id)) continue
    if (item.url) byUrl.set(item.url, item)
    byId.set(item.id, item)
  }

  // Combine all items
  let all = [...byId.values()]

  // Retire: remove items outside the 6-month window
  all = all.filter(item => isWithinWindow(item.date))

  // Sort: future events (nearest first), then past news (newest first)
  const now = new Date().toISOString().slice(0, 10)
  all.sort((a, b) => {
    const aFuture = a.date > now
    const bFuture = b.date > now
    if (aFuture && !bFuture) return -1
    if (!aFuture && bFuture) return 1
    if (aFuture && bFuture) return a.date.localeCompare(b.date)   // nearest first
    return b.date.localeCompare(a.date)                            // newest first
  })

  writeFileSync(FEED_FILE, JSON.stringify(all, null, 2))
  console.log(`✅ Wrote ${all.length} feed items → ${FEED_FILE}`)

  const events = all.filter(i => i.date > now)
  const news = all.filter(i => i.date <= now)
  console.log(`   📅 ${events.length} upcoming events, 📰 ${news.length} recent news`)

  // Freshness metadata. Without this the feed just ages silently: the page
  // looked identical whether it had been refreshed today or three months ago.
  const meta = {
    checkedAt: new Date().toISOString(),
    latestItem: all.map(i => i.date).filter(Boolean).sort().slice(-1)[0] ?? null,
    events: events.length,
    news: news.length,
    sources: health,
  }
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2))
  console.log(`✅ Wrote feed metadata → ${META_FILE}`)

  const broken = health.filter(h => !h.ok)
  if (broken.length) {
    console.warn(`⚠️  ${broken.length} source(s) failed: ${broken.map(b => `${b.name} (${b.note})`).join(', ')}`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
