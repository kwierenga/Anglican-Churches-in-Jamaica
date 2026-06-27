/**
 * Post-build prerender for SEO.
 *
 * GitHub Pages can't run an SPA server, and hash URLs aren't crawlable. This
 * emits a real HTML file per route (directory-style index.html) cloned from
 * the built dist/index.html, with per-page <title>, description, canonical,
 * Open Graph and Twitter tags injected. It also writes sitemap.xml, robots.txt
 * and a 404.html SPA fallback. The React bundle still hydrates and drives
 * client-side navigation — this just makes every URL real and shareable.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PARISHES } from '../src/lib/parishes.js'

const ORIGIN = 'https://kwierenga.github.io'
const BASE = '/Anglican-Churches-in-Jamaica/'           // must match vite.config base
const SITE = ORIGIN + BASE                              // ends with '/'
const DIST = path.resolve('dist')
const BUILD = path.resolve('data/build')
const CONTENT = path.resolve('content/churches')
const DEFAULT_IMAGE = 'https://res.cloudinary.com/kwierenga/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/v1774647565/spanish-town-1_fdfjqi.jpg'
const SUFFIX = ' — Anglican Churches in Jamaica'

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('❌ dist/index.html not found — run vite build first.')
  process.exit(1)
}
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function setMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const re = new RegExp(`(<meta ${attr}="${key}"[^>]*content=")[^"]*(")`)
  if (re.test(html)) return html.replace(re, `$1${esc(content)}$2`)
  return html.replace('</head>', `    <meta ${attr}="${key}" content="${esc(content)}" />\n  </head>`)
}

interface Page { route: string; title: string; description: string; image?: string; type?: string }

function render(p: Page): string {
  const title = p.title ? p.title + SUFFIX : 'Anglican Churches in Jamaica'
  const url = SITE + p.route.replace(/^\//, '')
  const image = p.image || DEFAULT_IMAGE
  let h = template
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  h = setMeta(h, 'name', 'description', p.description)
  h = setMeta(h, 'property', 'og:title', title)
  h = setMeta(h, 'property', 'og:description', p.description)
  h = setMeta(h, 'property', 'og:type', p.type || 'website')
  h = setMeta(h, 'property', 'og:url', url)
  h = setMeta(h, 'property', 'og:image', image)
  const inject =
    `    <link rel="canonical" href="${esc(url)}" />\n` +
    `    <meta name="twitter:title" content="${esc(title)}" />\n` +
    `    <meta name="twitter:description" content="${esc(p.description)}" />\n` +
    `    <meta name="twitter:image" content="${esc(image)}" />\n  </head>`
  h = h.replace('</head>', inject)
  return h
}

function write(route: string, html: string) {
  // route '' -> dist/index.html; 'churches' -> dist/churches/index.html
  const dir = route ? path.join(DIST, route) : DIST
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
}

function descFromMd(md: string, fallback: string): string {
  const para = md.split(/\n\s*\n/).find(p => !p.startsWith('#') && !p.startsWith('**') && p.trim().length > 40)
  if (!para) return fallback
  return para
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
}

const ogImage = (url: string) => url.replace('/upload/', '/upload/w_1200,h_630,c_fill,f_auto,q_auto/')

// ── Static pages ────────────────────────────────────────────────────
const STATIC: Page[] = [
  { route: '', title: '', description: 'Explore Anglican churches across Jamaica — maps, histories, photos, and heritage information for cathedrals, churches, chapels, and ruins.' },
  { route: 'churches/', title: 'Church Directory', description: 'Browse, search and filter all Anglican churches in Jamaica on an interactive map.' },
  { route: 'parishes/', title: 'Parishes', description: 'The fourteen civil parishes of Jamaica and their Anglican churches.' },
  { route: 'architecture/', title: 'Architecture', description: 'Browse Jamaican Anglican churches by architectural style — Georgian, Gothic Revival, vernacular Caribbean, estate chapels, and post-war modernist.' },
  { route: 'clergy/', title: 'Clergy Index', description: 'Index of clergy — bishops, archbishops, rectors, and priests — named in the church narratives.' },
  { route: 'history/', title: 'History', description: 'The history of the Anglican Church in Jamaica from 1655 to the present.' },
  { route: 'about/', title: 'About & Sources', description: 'About this project, and the full list of UK and Jamaican sources cited in the church narratives.' },
  { route: 'news/', title: 'News & Events', description: 'Recent news and upcoming events from the Anglican Diocese of Jamaica and the Cayman Islands.' },
  { route: 'sources/', title: 'Sources', description: 'Primary and secondary sources used across the site.' },
  { route: 'glossary/', title: 'Glossary', description: 'Terms and vocabulary used across the site.' },
  { route: 'data/', title: 'Data Coverage', description: 'Maintainer punch-list of what each church entry still needs — photos, fuller histories, structured facts.' },
]

const allUrls: string[] = []
for (const p of STATIC) { write(p.route, render(p)); allUrls.push(SITE + p.route) }

// ── Parish pages ────────────────────────────────────────────────────
const CLOUD = 'https://res.cloudinary.com/kwierenga/image/upload'
for (const parish of PARISHES) {
  const route = `parish/${parish.slug}/`
  write(route, render({
    route, title: `${parish.name} parish`, description: parish.blurb, type: 'article',
    image: ogImage(`${CLOUD}/${parish.heroImage}.jpg`),
  }))
  allUrls.push(SITE + route)
}

// ── Church pages ────────────────────────────────────────────────────
const churches: any[] = JSON.parse(fs.readFileSync(path.join(BUILD, 'search-index.json'), 'utf8'))
const media: Record<string, any[]> = fs.existsSync(path.join(BUILD, 'media-index.json'))
  ? JSON.parse(fs.readFileSync(path.join(BUILD, 'media-index.json'), 'utf8'))
  : {}

for (const c of churches) {
  const route = `church/${c.id}/`
  const mdPath = path.join(CONTENT, `${c.id}.md`)
  const md = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : ''
  const fallback = `${c.name} — Anglican ${c.classification.replace('_', ' ')} in ${c.parish}, Jamaica.`
  const firstImg = (media[c.id] || []).find(m => m.type === 'image')
  write(route, render({
    route, title: c.name, description: descFromMd(md, fallback), type: 'article',
    image: firstImg ? ogImage(firstImg.url) : undefined,
  }))
  allUrls.push(SITE + route)
}

// ── 404 SPA fallback ────────────────────────────────────────────────
fs.writeFileSync(path.join(DIST, '404.html'), render(STATIC[0]))

// ── sitemap.xml + robots.txt ────────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  allUrls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n') +
  `\n</urlset>\n`
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`)

console.log(`✅ Prerendered ${allUrls.length} pages + sitemap.xml, robots.txt, 404.html`)
