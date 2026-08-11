import { useEffect, useState } from 'react'
import { buildSrcSet, responsiveSrc } from '../lib/cloudinary'
import { PARISHES } from '../lib/parishes'
import { loadSearchIndex, getCatalog } from '../lib/search'
import { navigate, to } from '../lib/router'
import { feedLink } from '../lib/feed'
import Button from '../components/Button'
import Badge, { categoryTone } from '../components/Badge'
import type { FeedItem, MediaRow } from '../lib/schemas'

const CLOUDINARY_BASE = 'https://res.cloudinary.com/kwierenga/image/upload'

/** The hero shot. Kept in step with the og:image so a shared link and the page agree. */
const HERO_IMAGE = 'spanish-town-1_fdfjqi'

const TICKER_TERMS = ['Sunday Worship', 'Church Directory', 'Heritage Sites', 'Parish Histories', 'Architecture', 'Community Life']

/** Curated exemplars. The Cathedral is deliberately absent — it is the hero. */
const FEATURED = [
  { img: 'falmouth-1_f1ngmy', name: "St. Peter's Parish Church", loc: 'Falmouth, Trelawny', id: 'st-peter-s-parish-church-falmouth-trelawny' },
  { img: 'black-river-1_mtzfuc', name: 'St. John the Evangelist (Ruins)', loc: 'Black River, St. Elizabeth', id: 'st-john-s-parish-church-black-river-st-elizabeth' },
  { img: 'lucea-1_ylkphu', name: 'Hanover Parish Church', loc: 'Lucea, Hanover', id: 'hanover-parish-church-lucea-hanover' },
  { img: 'montego-bay-1_j6tuwf', name: 'St. James Parish Church', loc: 'Montego Bay, St. James', id: 'st-james-parish-church-sam-sharpe-square-st-james' },
]

/** Gallery strip. Each tile resolves to its church via the media index below;
 *  any image not present in data/media.csv is dropped rather than shown as a
 *  dead end — add it to media.csv and it reappears, linked. */
const GALLERY = [
  'mandeville-1_iil8jb', 'port-antonio-1_axr4uq', 'morant-bay-1_iipt39',
  'st-andrew-1_souv07', 'savannah-la-mar-1_lljfrb', 'port-maria-1_vbewjz',
  'georges-1_bhcoqz', 'lacovia-1_h8jutk', 'may-pen-1_qnspzn',
  'st-anns-bay-1_vflxsr', 'lucea-2_hj6tgl', 'black-river-2_jjvifi',
]

const architectureCards = [
  { icon: '\u{1F3DB}', title: 'Georgian Colonial', period: '17th–18th Century', desc: 'Symmetrical stone structures with classical proportions, built by the colonial establishment as centres of civic and religious life.' },
  { icon: '\u{26EA}', title: 'Gothic Revival', period: '19th Century', desc: 'Pointed arches, buttresses, and lancet windows brought the medieval English parish church tradition to tropical Jamaica.' },
  { icon: '\u{1F334}', title: 'Vernacular Caribbean', period: '19th–20th Century', desc: 'Local materials and open designs adapted to the tropical climate — louvred windows, wide verandahs, and coral stone walls.' },
  { icon: '\u{1F3E1}', title: 'Estate Chapel', period: '18th–19th Century', desc: 'Small chapels built on sugar estates, often serving both planter families and enslaved or freed workers on the property.' },
  { icon: '\u{1F3D7}', title: 'Post-War Modernist', period: 'Mid-20th Century', desc: 'Concrete and glass designs reflecting independence-era optimism, with bold geometric forms and open sanctuary plans.' },
  { icon: '\u{1F3DA}', title: 'Ruins & Remnants', period: 'Various', desc: 'Hurricane damage, abandonment, and time have left evocative ruins across the island — stone walls open to the sky.' },
]

const timelineEvents = [
  { year: '1655', title: 'English Capture' },
  { year: '1824', title: 'Diocese of Jamaica' },
  { year: '1870', title: 'Disestablishment' },
  { year: '1962', title: 'Independence' },
]

const today = new Date().toISOString().slice(0, 10)

/** Cloudinary public id from a delivery URL: '.../upload/v123/foo.jpg' -> 'foo'. */
function publicId(url: string): string {
  return (url.split('/').pop() ?? '').replace(/\.[a-z0-9]+$/i, '')
}

export default function HomePage() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [churchCount, setChurchCount] = useState(0)
  const [tickerPaused, setTickerPaused] = useState(false)
  const [imageOwner, setImageOwner] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/feed.json`)
      .then(r => r.ok ? r.json() : [])
      .then(setFeed)
      .catch(() => setFeed([]))
    loadSearchIndex().then(() => setChurchCount(getCatalog().length))

    // Reverse index: Cloudinary public id -> church id, so the gallery strip
    // can link each photograph to the church it shows.
    fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
      .then(r => r.ok ? r.json() : {})
      .then((idx: Record<string, MediaRow[]>) => {
        const owner: Record<string, string> = {}
        for (const churchId of Object.keys(idx)) {
          for (const m of idx[churchId]) {
            if (m.type === 'image') owner[publicId(m.url)] = churchId
          }
        }
        setImageOwner(owner)
      })
      .catch(() => setImageOwner({}))
  }, [])

  const surpriseMe = () => {
    const pool = getCatalog()
    if (pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    navigate(`/church/${pick.id}`)
  }

  const scrollToParishes = () => {
    document.getElementById('find-a-church')?.scrollIntoView({ behavior: 'smooth' })
  }

  const events = feed.filter(i => i.date > today).slice(0, 3)
  const news = feed.filter(i => i.date <= today).slice(0, 3)

  const byId = new Map(getCatalog().map(c => [c.id, c]))
  const gallery = GALLERY
    .map(img => ({ img, churchId: imageOwner[img] }))
    .filter((g): g is { img: string; churchId: string } => Boolean(g.churchId))

  // Driven off the catalogue rather than hardcoded — the strip used to claim
  // "350+" directly above a hero that said "all 305".
  const stats = [
    { num: churchCount ? String(churchCount) : '300+', label: 'Churches' },
    { num: '14', label: 'Parishes' },
    { num: '1655', label: 'First Worship' },
    { num: '200+', label: 'Years Diocese' },
  ]

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center bg-cover bg-center"
               style={{ backgroundImage: `url('${CLOUDINARY_BASE}/w_1400,q_80/${HERO_IMAGE}.jpg')` }}>
        {/* Gradient overlay */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(140deg, rgba(107,0,0,0.85) 0%, rgba(58,26,46,0.8) 45%, rgba(30,45,78,0.85) 100%)' }} />
        <div className="relative z-10 px-4 max-w-3xl">
          <div className="text-gold-bright text-5xl mb-4" aria-hidden="true">&#10013;</div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Faith Rooted in Three Centuries of Island Life
          </h1>
          <hr className="w-16 h-[3px] bg-gold-bright border-0 mx-auto my-6" />
          <p className="font-body text-xl text-white/85 mb-8 leading-relaxed">
            Mapping {churchCount ? `all ${churchCount}` : 'every'} Anglican {churchCount === 1 ? 'church' : 'churches'} of
            Jamaica &mdash; their history, architecture, and the people who built them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href={to('/churches')} variant="primary" size="lg">Browse the map &rarr;</Button>
            <Button onClick={scrollToParishes} variant="outlineLight" size="lg">Find by parish</Button>
            <Button onClick={surpriseMe} variant="linkLight" className="text-lg px-2">&#127922; Surprise me</Button>
          </div>
        </div>
      </section>

      {/* ── Stats + ticker band ──────────────────────────────────── */}
      <section className="bg-navy">
        <div className="max-w-site mx-auto flex flex-wrap justify-center">
          {stats.map((s, i) => (
            <div key={i} className="flex-1 min-w-[140px] text-center py-6 border-r border-white/10 last:border-r-0">
              <div className="font-heading text-3xl font-bold text-gold-bright">{s.num}</div>
              <div className="text-sm text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="marquee-track bg-gold-deep py-2 flex items-center">
        <div className="overflow-hidden flex-1">
          <div className={`animate-marquee whitespace-nowrap text-white font-heading text-sm tracking-wider
                           ${tickerPaused ? 'is-paused' : ''}`}>
            {TICKER_TERMS.map((t, i) => <span key={i} className="mx-8">{t}&ensp;&#10013;</span>)}
            {TICKER_TERMS.map((t, i) => <span key={`dup-${i}`} className="mx-8" aria-hidden="true">{t}&ensp;&#10013;</span>)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTickerPaused(p => !p)}
          aria-pressed={tickerPaused}
          aria-label={tickerPaused ? 'Resume scrolling banner' : 'Pause scrolling banner'}
          className="shrink-0 mr-3 ml-2 w-7 h-7 grid place-items-center rounded-full
                     text-white/90 hover:text-white hover:bg-white/15 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            {tickerPaused
              ? <path d="M2 1l9 5-9 5z" />
              : <><rect x="2" y="1" width="3" height="10" rx="1" /><rect x="7" y="1" width="3" height="10" rx="1" /></>}
          </svg>
        </button>
      </section>

      {/* ── Featured churches + browse by parish ─────────────────── */}
      <section id="find-a-church" className="py-16 scroll-mt-[62px]">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Discover</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-2">
            Featured Churches
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <p className="text-gray-600 mb-8 font-body">A selection of Jamaica's most significant Anglican churches</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED.map(c => (
              <a key={c.id} href={to(`/church/${c.id}`)}
                 className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <img
                  src={responsiveSrc(`${CLOUDINARY_BASE}/${c.img}.jpg`, 500, { height: 360, crop: 'fill' })}
                  srcSet={buildSrcSet(`${CLOUDINARY_BASE}/${c.img}.jpg`, { widths: [400, 600, 800, 1000], height: 360, crop: 'fill' })}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  width={500}
                  height={360}
                  className="w-full h-[180px] object-cover"
                />
                <div className="p-3">
                  <div className="font-heading text-sm font-semibold text-gray-900 group-hover:text-crimson transition-colors">{c.name}</div>
                  <div className="text-xs text-crimson-mid mt-1">{c.loc}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Browse-by-parish, folded in here rather than given a section of its own. */}
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <h3 className="font-heading text-xl font-semibold text-crimson mb-3">Or browse by parish</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {PARISHES.map(p => (
                <a
                  key={p.slug}
                  href={to(`/parish/${p.slug}`)}
                  className="px-4 py-2 rounded-full border border-crimson/30 text-crimson font-body text-sm
                             hover:bg-crimson hover:text-white transition-colors"
                >
                  {p.name}
                </a>
              ))}
            </div>
            <Button href={to('/churches')} variant="outline">View all {churchCount || ''} churches &rarr;</Button>
          </div>
        </div>
      </section>

      {/* ── About + key facts + milestones ───────────────────────── */}
      <section className="py-16 bg-ivory">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">About</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-6">
            The Anglican Church in Jamaica
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <div className="grid md:grid-cols-[1fr_340px] gap-10">
            <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
              <p>
                The Anglican Church arrived with the English fleet that took Jamaica from Spain in 1655. By 1664
                seven parishes had been laid out, each with a parish church at the centre of worship, vestry
                government, and colonial record-keeping. For its first century and a half the established church
                scarcely ministered to the enslaved African majority; only with the <strong>Diocese of
                Jamaica</strong> in 1824, Emancipation in 1834&ndash;38, and <strong>Disestablishment</strong> in
                1870 did it begin its long transformation into a self-supporting church of the Black majority.
              </p>
              <p>
                Earthquakes, hurricanes, rebellion and rebuilding run through that story &mdash; from the 1907
                Kingston earthquake to Hurricane Melissa in 2025. Today the Diocese of Jamaica and the Cayman
                Islands is part of the Church in the Province of the West Indies within the worldwide Anglican
                Communion.
              </p>

              {/* Milestones, previously a section of their own directly below. */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-2">
                {timelineEvents.map(e => (
                  <div key={e.year} className="border-t-2 border-gold pt-3">
                    <span className="font-heading text-gold-deep font-bold text-2xl">{e.year}</span>
                    <h3 className="font-heading text-base font-semibold text-gray-900 mt-1 leading-snug">{e.title}</h3>
                  </div>
                ))}
              </div>

              <Button href={to('/history')} variant="crimson" className="mt-2">Read the full history &rarr;</Button>
            </div>
            <aside>
              <div className="bg-parchment border border-gold/30 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-crimson mb-4">Key Facts</h3>
                {[
                  ['Bishop', 'The Rt. Rev. Leon Golding'],
                  ['Cathedral', 'St. Jago de la Vega, Spanish Town'],
                  ['Anglican presence', '1655 (with English conquest)'],
                  ['Diocese erected', '1824 (Letters Patent)'],
                  ['Province', 'West Indies (founded 1883)'],
                  ['Parishes', '14 civil parishes'],
                  ['Churches', churchCount ? `${churchCount} across the island` : '300+ across the island'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gold/20 last:border-0">
                    <span className="text-sm font-semibold text-gray-600">{k}</span>
                    <span className="text-sm text-gray-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Architecture</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-8">
            Building Traditions
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {architectureCards.map((c, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-heading text-lg font-semibold text-gray-900">{c.title}</h3>
                <p className="text-xs font-semibold tracking-wider text-crimson-mid uppercase mt-1 mb-3">{c.period}</p>
                <p className="font-body text-sm text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <Button href={to('/architecture')} variant="outline" className="mt-8">Browse churches by architectural style &rarr;</Button>
        </div>
      </section>

      {/* ── Gallery strip — every tile leads to its church ────────── */}
      {gallery.length > 0 && (
        <section className="py-8 bg-navy overflow-hidden">
          <p className="text-center text-gold-bright font-heading text-xs tracking-[0.15em] uppercase mb-4">Across the Island</p>
          <div className="flex gap-3 overflow-x-auto px-6 pb-3 snap-x snap-mandatory
                          [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gold [&::-webkit-scrollbar-thumb]:rounded">
            {gallery.map(({ img, churchId }) => {
              const church = byId.get(churchId)
              const label = church?.displayName ?? church?.name ?? 'Anglican church in Jamaica'
              return (
                <a
                  key={img}
                  href={to(`/church/${churchId}`)}
                  title={label}
                  className="group relative shrink-0 snap-start rounded-md overflow-hidden"
                >
                  <img
                    src={responsiveSrc(`${CLOUDINARY_BASE}/${img}.jpg`, 400, { height: 400, crop: 'fill' })}
                    srcSet={buildSrcSet(`${CLOUDINARY_BASE}/${img}.jpg`, { widths: [300, 500, 700], height: 400, crop: 'fill' })}
                    sizes="200px"
                    alt={label}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="h-[200px] w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent
                                   px-2 pt-6 pb-2 text-[11px] leading-tight text-white font-body
                                   opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                    {label}
                  </span>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* ── News & Events ────────────────────────────────────────── */}
      {(events.length > 0 || news.length > 0) && (
        <section className="py-16 bg-ivory">
          <div className="max-w-site mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
              <h2 className="font-heading text-3xl font-bold text-crimson">
                News &amp; Events
                <span className="block w-16 h-[3px] bg-gold mt-3" />
              </h2>
              <Button href={to('/news')} variant="link">All news &amp; events &rarr;</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...events, ...news].slice(0, 3).map(item => {
                const isEvent = item.date > today
                const link = feedLink(item)
                const Card = link ? 'a' : 'div'
                const cardProps = link
                  ? link.external
                    ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                    : { href: link.href }
                  : {}
                return (
                  <Card key={item.id} {...cardProps}
                        className={`block bg-white rounded-lg p-5 shadow-sm transition-shadow hover:shadow-md border
                          ${isEvent ? 'border-l-4 border-gold' : 'border-gray-200'}
                          ${link ? 'hover:border-crimson/40 cursor-pointer' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge tone={isEvent ? 'event' : categoryTone(item.category)}>
                        {isEvent ? 'upcoming' : item.category}
                      </Badge>
                      {item.parish && <span className="text-xs text-gray-500 italic">{item.parish}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-gray-600 line-clamp-3">
                      {item.report || item.summary}
                    </p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
