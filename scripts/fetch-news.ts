/**
 * Scrapes events and news from multiple sources into a unified feed.
 *
 * Sources:
 *   1. Anglican Diocese of Jamaica (anglicandioceseja.org)
 *   2. Jamaica Gleaner — Anglican/church coverage
 *   3. Anglican Communion News Service (anglicannews.org)
 *
 * Lifecycle:
 *   - Items with date > today       → shown as Events (upcoming)
 *   - Items with date <= today       → shown as News  (past)
 *   - Items older than 6 months      → retired (removed)
 *   - Items more than 6 months ahead → excluded
 *
 * Usage: npx tsx scripts/fetch-news.ts
 */
import * as cheerio from 'cheerio'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FEED_FILE = join(__dirname, '..', 'data', 'feed.json')
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

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
    if (!res.ok) { console.warn(`  ⚠️ HTTP ${res.status}`); return [] }
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
    return results
  } catch (err) {
    console.warn(`  ⚠️ Diocese scrape failed: ${err}`)
    return []
  }
}

// ── Source 2: Jamaica Gleaner — Anglican/church news ─────────────────────────

async function scrapeGleaner(): Promise<FeedItem[]> {
  const SEARCH_URL = 'https://jamaica-gleaner.com/?s=anglican+church+jamaica'
  console.log(`📡 Fetching Gleaner: ${SEARCH_URL} ...`)
  try {
    const res = await fetch(SEARCH_URL, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) { console.warn(`  ⚠️ HTTP ${res.status}`); return [] }
    const html = await res.text()
    const $ = cheerio.load(html)

    const results: FeedItem[] = []

    $('article, .post, .search-result, .entry').each((_, el) => {
      const $el = $(el)
      const titleEl = $el.find('h2 a, h3 a, .entry-title a').first()
      const title = titleEl.text().trim()
      const url = titleEl.attr('href') || ''
      if (!title || !url) return

      const dateRaw = $el.find('time').attr('datetime') || $el.find('.date, .entry-date').text() || ''
      const date = parseDate(dateRaw)
      const summary = $el.find('.excerpt, .entry-summary, p').first().text().trim().slice(0, 300)

      results.push({
        id: slugify(title),
        date,
        title,
        summary,
        report: '',
        category: 'parish',
        parish: null,
        source: 'Jamaica Gleaner',
        url,
      })
    })

    console.log(`  ✅ ${results.length} items from Gleaner`)
    return results
  } catch (err) {
    console.warn(`  ⚠️ Gleaner scrape failed: ${err}`)
    return []
  }
}

// ── Source 3: Anglican Communion News Service ────────────────────────────────

async function scrapeACNS(): Promise<FeedItem[]> {
  const ACNS_URL = 'https://www.anglicannews.org/news.aspx'
  console.log(`📡 Fetching ACNS: ${ACNS_URL} ...`)
  try {
    const res = await fetch(ACNS_URL, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) { console.warn(`  ⚠️ HTTP ${res.status}`); return [] }
    const html = await res.text()
    const $ = cheerio.load(html)

    const results: FeedItem[] = []

    // ACNS uses various layouts; look for article links
    $('article, .news-item, .post-item, .item').each((_, el) => {
      const $el = $(el)
      const titleEl = $el.find('h2 a, h3 a, a.title, .headline a').first()
      let title = titleEl.text().trim()
      let url = titleEl.attr('href') || ''
      if (!title || !url) {
        // Fallback: direct link inside the item
        const link = $el.find('a').first()
        title = link.text().trim()
        url = link.attr('href') || ''
      }
      if (!title || title.length < 10 || !url) return

      // Make URL absolute
      if (url.startsWith('/')) url = `https://www.anglicannews.org${url}`

      const dateRaw = $el.find('time').attr('datetime') || $el.find('.date, .meta-date').text() || ''
      const date = parseDate(dateRaw)
      const summary = $el.find('p, .summary, .excerpt').first().text().trim().slice(0, 300)

      // Only keep Caribbean/Jamaica-relevant items
      const text = (title + ' ' + summary).toLowerCase()
      const relevant = ['jamaica', 'caribbean', 'west indies', 'province of the west indies', 'cpwi'].some(k => text.includes(k))
      if (!relevant) return

      results.push({
        id: slugify(title),
        date,
        title,
        summary,
        report: '',
        category: 'diocese',
        parish: null,
        source: 'Anglican Communion News Service',
        url,
      })
    })

    console.log(`  ✅ ${results.length} items from ACNS`)
    return results
  } catch (err) {
    console.warn(`  ⚠️ ACNS scrape failed: ${err}`)
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
  const [diocese, gleaner, acns] = await Promise.all([
    scrapeDiocese(),
    scrapeGleaner(),
    scrapeACNS(),
  ])

  const scraped = [...diocese, ...gleaner, ...acns]
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
}

main().catch(err => { console.error(err); process.exit(1) })
