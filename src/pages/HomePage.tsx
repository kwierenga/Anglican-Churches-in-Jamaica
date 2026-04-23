import { useEffect, useState } from 'react'
import { buildSrcSet, responsiveSrc } from '../lib/cloudinary'
import { PARISHES } from '../lib/parishes'
import type { FeedItem } from '../lib/schemas'

const CLOUDINARY_BASE = 'https://res.cloudinary.com/kwierenga/image/upload'

const stats = [
  { num: '350+', label: 'Churches' },
  { num: '14', label: 'Parishes' },
  { num: '1655', label: 'First Worship' },
  { num: '200+', label: 'Years Diocese' },
]

const architectureCards = [
  { icon: '\u{1F3DB}', title: 'Georgian Colonial', period: '17th\u201318th Century', desc: 'Symmetrical stone structures with classical proportions, built by the colonial establishment as centres of civic and religious life.' },
  { icon: '\u{26EA}', title: 'Gothic Revival', period: '19th Century', desc: 'Pointed arches, buttresses, and lancet windows brought the medieval English parish church tradition to tropical Jamaica.' },
  { icon: '\u{1F334}', title: 'Vernacular Caribbean', period: '19th\u201320th Century', desc: 'Local materials and open designs adapted to the tropical climate \u2014 louvred windows, wide verandahs, and coral stone walls.' },
  { icon: '\u{1F3E1}', title: 'Estate Chapel', period: '18th\u201319th Century', desc: 'Small chapels built on sugar estates, often serving both planter families and enslaved or freed workers on the property.' },
  { icon: '\u{1F3D7}', title: 'Post-War Modernist', period: 'Mid-20th Century', desc: 'Concrete and glass designs reflecting independence-era optimism, with bold geometric forms and open sanctuary plans.' },
  { icon: '\u{1F3DA}', title: 'Ruins & Remnants', period: 'Various', desc: 'Hurricane damage, abandonment, and time have left evocative ruins across the island \u2014 stone walls open to the sky.' },
]

const timelineEvents = [
  { year: '1655', title: 'English Capture', body: 'England seizes Jamaica from Spain. The Church of England becomes the established church of the colony, with its clergy, vestries, and parish boundaries woven into colonial government.' },
  { year: '1664', title: 'First Parish Churches', body: 'The island is divided into parishes — St. Catherine, St. Andrew, Clarendon, Vere, St. John, St. David, St. Thomas in the East and St. Thomas in the Vale — each with an Anglican parish church as its civic and spiritual centre.' },
  { year: '1692', title: 'Port Royal Earthquake', body: 'The 7 June earthquake destroys Port Royal and the Parish Churches of St. Paul and Christ Church; the refounding of Kingston on Colonel Barry\u2019s Hog Crawle reshapes the ecclesiastical map of the south-east.' },
  { year: '1739', title: 'Maroon Treaties', body: 'The Leeward (March) and Windward (June) treaties recognise free Maroon territories; a later 1740 supplement and a 1746 grant to Nanny at New Nanny Town (Moore Town) establish a parallel society alongside the Anglican parish structure.' },
  { year: '1824', title: 'Diocese of Jamaica', body: 'Jamaica is made a see of its own under Bishop Christopher Lipscomb, first Bishop of Jamaica, who launches an extensive school-building programme \u2014 142 schools and 8,500 scholars reported by 1835.' },
  { year: '1831\u20131832', title: 'Baptist War & Colonial Church Union', body: 'Sam Sharpe\u2019s Christmas Rebellion is followed by reprisals from the planter-led Colonial Church Union, which destroys Baptist chapels across the island and forces moral reckoning within the established church.' },
  { year: '1834\u20131838', title: 'Emancipation', body: 'Slavery Abolition Act takes effect (1834); full freedom on 1 August 1838. Anglican congregations admit formerly enslaved worshippers; rural chapels of ease and mission stations multiply across the interior.' },
  { year: '1865', title: 'Morant Bay Rebellion', body: 'Paul Bogle\u2019s 11 October uprising and Governor Eyre\u2019s savage response \u2014 over 430 executed \u2014 expose the Anglican establishment\u2019s entanglement with the vestry and magistracy, and lead to Crown Colony government.' },
  { year: '1870', title: 'Disestablishment', body: 'The Church of England is disestablished in Jamaica. State funding ends, vestries are reformed, and the Diocese begins the long transition from planter-class institution to a self-supporting church of the Black majority.' },
  { year: '1907', title: 'Kingston Earthquake', body: 'The 14 January earthquake levels Kingston\u2019s churches. Archbishop Enos Nuttall leads the rebuilding; in January 1911 alone ten churches are consecrated in a single month.' },
  { year: '1962', title: 'Independence', body: 'Jamaica becomes independent on 6 August 1962. The Anglican Church becomes part of the self-governing Church in the Province of the West Indies, within the worldwide Anglican Communion.' },
  { year: '2025', title: 'Hurricane Melissa', body: 'On 28 October 2025 Hurricane Melissa tracks across south-western and interior Jamaica. Historic church fabric in Westmoreland, St. Elizabeth, Manchester, Clarendon and Portland is damaged; Diocese coordinates recovery across the parishes and Cayman Islands.' },
]

const today = new Date().toISOString().slice(0, 10)

export default function HomePage() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [newsFilter, setNewsFilter] = useState('all')

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/feed.json`)
      .then(r => r.ok ? r.json() : [])
      .then(setFeed)
      .catch(() => setFeed([]))
  }, [])

  const events = feed.filter(i => i.date > today)
  const news = feed.filter(i => i.date <= today)
  const filteredNews = newsFilter === 'all' ? news : news.filter(n => n.category === newsFilter)

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center bg-cover bg-center"
               style={{ backgroundImage: `url('https://res.cloudinary.com/kwierenga/image/upload/w_1400,q_80/falmouth-1_f1ngmy.jpg')` }}>
        {/* Gradient overlay */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(140deg, rgba(107,0,0,0.85) 0%, rgba(58,26,46,0.8) 45%, rgba(30,45,78,0.85) 100%)' }} />
        <div className="relative z-10 px-4 max-w-3xl">
          <div className="text-gold-bright text-5xl mb-4">&#10013;</div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Faith Rooted in Three Centuries of Island Life
          </h1>
          <hr className="w-16 h-[3px] bg-gold-bright border-0 mx-auto my-6" />
          <p className="font-body text-xl text-white/80 italic mb-8">
            Exploring the Anglican heritage of Jamaica &mdash; from grand cathedrals to quiet country chapels.
          </p>
          <a href="#/churches"
             className="inline-block bg-gold-bright hover:bg-gold text-white font-heading font-semibold
                        px-8 py-3 rounded transition-colors text-lg">
            Explore Now
          </a>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
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

      {/* ── Gold Ticker Bar ──────────────────────────────────────── */}
      <section className="bg-gold overflow-hidden py-2">
        <div className="animate-marquee whitespace-nowrap text-white font-heading text-sm tracking-wider">
          {['Sunday Worship', 'Church Directory', 'Heritage Sites', 'Parish Histories', 'Architecture', 'Community Life']
            .map((t, i) => <span key={i} className="mx-8">{t}&ensp;&#10013;</span>)}
          {['Sunday Worship', 'Church Directory', 'Heritage Sites', 'Parish Histories', 'Architecture', 'Community Life']
            .map((t, i) => <span key={`dup-${i}`} className="mx-8">{t}&ensp;&#10013;</span>)}
        </div>
      </section>

      {/* ── Find a Church ────────────────────────────────────────── */}
      <section className="py-16 bg-ivory">
        <div className="max-w-site mx-auto px-4 text-center">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Explore</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-2">Find a Church</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Click a parish to browse its churches, or explore the full directory.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {PARISHES.map(p => (
              <a
                key={p.slug}
                href={`#/parish/${p.slug}`}
                className="px-4 py-2 rounded-full border border-crimson/30 text-crimson font-body text-sm
                           hover:bg-crimson hover:text-white transition-colors"
              >
                {p.name}
              </a>
            ))}
          </div>
          <a href="#/churches"
             className="inline-block border-2 border-crimson text-crimson hover:bg-crimson hover:text-white
                        font-heading font-semibold px-6 py-2.5 rounded transition-colors">
            View All Churches &rarr;
          </a>
        </div>
      </section>

      {/* ── Featured Churches ────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Discover</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-2">
            Featured Churches
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <p className="text-gray-600 mb-8 font-body">A selection of Jamaica's most significant Anglican churches</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[
              { img: 'falmouth-1_f1ngmy', name: "St. Peter's Parish Church", loc: 'Falmouth, Trelawny', id: 'st-peter-s-parish-church-falmouth-trelawny' },
              { img: 'spanish-town-1_fdfjqi', name: 'Cathedral of St. Jago de la Vega', loc: 'Spanish Town, St. Catherine', id: 'st-jago-de-la-vega-the-cathedral-spanish-town-st-catherine' },
              { img: 'black-river-1_mtzfuc', name: 'St. John the Evangelist (Ruins)', loc: 'Black River, St. Elizabeth', id: 'st-john-s-parish-church-black-river-st-elizabeth' },
              { img: 'lucea-1_ylkphu', name: 'Hanover Parish Church', loc: 'Lucea, Hanover', id: 'hanover-parish-church-lucea-hanover' },
              { img: 'montego-bay-1_j6tuwf', name: 'St. James Parish Church', loc: 'Montego Bay, St. James', id: 'st-james-parish-church-sam-sharpe-square-st-james' },
            ].map(c => (
              <a key={c.id} href={`#/church/${c.id}`}
                 className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <img
                  src={responsiveSrc(`${CLOUDINARY_BASE}/${c.img}.jpg`, 500, { height: 360, crop: 'fill' })}
                  srcSet={buildSrcSet(`${CLOUDINARY_BASE}/${c.img}.jpg`, { widths: [400, 600, 800, 1000], height: 360, crop: 'fill' })}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 280px"
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
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">About</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-6">
            The Anglican Church in Jamaica
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <div className="grid md:grid-cols-[1fr_340px] gap-10">
            <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
              <p>
                The Anglican Church has been present in Jamaica since the English captured the island from
                Spain in 1655. Under the English civil administration, the island was divided into parishes
                and a Church of England parish church was established in each as centre of worship, vestry
                government, poor relief, and colonial record-keeping. The oldest surviving congregations
                &mdash; the Cathedral of St. Jago de la Vega (Spanish Town, 1666), St. Andrew Parish Church
                (Half-Way-Tree, 1664), and St. Peter&rsquo;s at Alley in Vere (1671) &mdash; date from this
                first generation.
              </p>
              <p>
                For its first two centuries the established church was deeply entangled with the slave
                economy. Vestries were composed of the planter class, clergy were paid by the colonial
                government, and churchyards across the island still contain the graves of major
                slave-owning families. The 1831&ndash;32 <strong>Baptist War</strong> and the reprisals of
                the planter-aligned Colonial Church Union, and the 1865 <strong>Morant Bay Rebellion</strong>
                led by National Hero Paul Bogle, exposed this entanglement and reshaped Jamaica&rsquo;s
                political future.
              </p>
              <p>
                <strong>Emancipation (1834&ndash;1838)</strong> transformed the church&rsquo;s role. Bishop
                Christopher Lipscomb, first Bishop of Jamaica (1824), had begun an ambitious school-building
                programme that by 1835 counted 142 schools with 8,500 scholars; by 1900 the Diocese operated
                263 elementary schools. Chapels of ease multiplied across the interior as freed families
                established free villages, smallholdings, and provision grounds.
              </p>
              <p>
                <strong>Disestablishment in 1870</strong> ended state funding, and the Anglican Church began
                its long transition from planter-class institution to a self-supporting church of the Black
                majority. The <strong>1907 Kingston earthquake</strong> destroyed the great churches of the
                capital; Archbishop Enos Nuttall led the rebuilding, consecrating ten churches in a single
                month in January 1911.
              </p>
              <p>
                Following <strong>Independence in 1962</strong>, the Anglican Church in Jamaica became part
                of the self-governing Church in the Province of the West Indies, within the worldwide
                Anglican Communion. In October 2025 Hurricane Melissa damaged historic church fabric across
                south-western and interior parishes, and the Diocese coordinated recovery across Jamaica
                and the Cayman Islands.
              </p>
            </div>
            <aside>
              <div className="bg-parchment border border-gold/30 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-crimson mb-4">Key Facts</h3>
                {[
                  ['Bishop', 'The Rt. Rev. Leon Golding'],
                  ['Cathedral', 'St. Jago de la Vega, Spanish Town'],
                  ['Founded', '1655 (Church of England in Jamaica)'],
                  ['Province', 'Church in the Province of the West Indies'],
                  ['Parishes', '14 civil parishes'],
                  ['Churches', '350+ across the island'],
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

      {/* ── History Timeline ─────────────────────────────────────── */}
      <section className="py-16 bg-ivory">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">History</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-8">
            Three Centuries of Faith
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <div className="relative pl-8 border-l-2 border-gold/50 space-y-10">
            {timelineEvents.map((e, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full bg-gold border-2 border-white" />
                <span className="font-heading text-gold font-bold text-lg">{e.year}</span>
                <h3 className="font-heading text-xl font-semibold text-gray-900 mt-1">{e.title}</h3>
                <p className="font-body text-gray-600 mt-1">{e.body}</p>
              </div>
            ))}
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
        </div>
      </section>

      {/* ── Leadership ───────────────────────────────────────────── */}
      <section className="py-16 bg-ivory">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Leadership</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-8">
            Diocese Today
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="text-5xl">&#9776;</div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-1">Bishop of Jamaica &amp; The Cayman Islands</p>
              <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-3">The Rt. Rev. Leon Golding</h3>
              <p className="font-body text-gray-600 leading-relaxed">
                Bishop Golding leads the Diocese of Jamaica and the Cayman Islands, overseeing parishes across
                the island. The Diocese is part of the Church in the Province of the West Indies within the
                worldwide Anglican Communion.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            The Diocese is served by archdeacons, rectors, priests-in-charge, and lay readers across fourteen parishes.
          </p>
        </div>
      </section>

      {/* ── Gallery Strip ────────────────────────────────────────── */}
      <section className="py-8 bg-navy overflow-hidden">
        <p className="text-center text-gold-bright font-heading text-xs tracking-[0.15em] uppercase mb-4">Across the Island</p>
        <div className="flex gap-3 overflow-x-auto px-6 pb-3 snap-x snap-mandatory
                        [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gold [&::-webkit-scrollbar-thumb]:rounded">
          {[
            'mandeville-1_iil8jb', 'port-antonio-1_axr4uq', 'morant-bay-1_iipt39',
            'st-andrew-1_souv07', 'savannah-la-mar-1_lljfrb', 'port-maria-1_vbewjz',
            'georges-1_bhcoqz', 'lacovia-1_h8jutk', 'may-pen-1_qnspzn',
            'st-anns-bay-1_vflxsr', 'lucea-2_hj6tgl', 'black-river-2_jjvifi',
          ].map(img => (
            <img
              key={img}
              src={responsiveSrc(`${CLOUDINARY_BASE}/${img}.jpg`, 400, { height: 400, crop: 'fill' })}
              srcSet={buildSrcSet(`${CLOUDINARY_BASE}/${img}.jpg`, { widths: [300, 500, 700], height: 400, crop: 'fill' })}
              sizes="200px"
              alt=""
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              className="h-[200px] w-auto rounded-md object-cover shrink-0 snap-start"
            />
          ))}
        </div>
      </section>

      {/* ── Events (upcoming) ──────────────────────────────────── */}
      {events.length > 0 && (
        <section className="py-16">
          <div className="max-w-site mx-auto px-4">
            <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Upcoming</p>
            <h2 className="font-heading text-3xl font-bold text-crimson mb-6">
              Events
              <span className="block w-16 h-[3px] bg-gold mt-3" />
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(item => (
                <div key={item.id} className="bg-white border-l-4 border-gold rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gold text-white">
                      {item.category}
                    </span>
                    {item.parish && <span className="text-xs text-gray-500 italic">{item.parish}</span>}
                  </div>
                  <p className="text-xs font-semibold text-gold mb-1">
                    {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-gray-600 line-clamp-3">{item.summary}</p>
                  {item.source && (
                    <p className="text-xs text-gray-400 mt-3">{item.source}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── News (recent) ────────────────────────────────────────── */}
      <section className={`py-16 ${events.length > 0 ? 'bg-ivory' : ''}`}>
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Recent</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-6">
            Diocesan News
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'diocese', 'parish', 'clergy', 'obituary'].map(cat => (
              <button
                key={cat}
                onClick={() => setNewsFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-body border transition-colors
                  ${newsFilter === cat
                    ? 'bg-crimson text-white border-crimson'
                    : 'border-gray-300 text-gray-600 hover:border-crimson hover:text-crimson'
                  }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* News grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(item => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded
                    ${item.category === 'diocese' ? 'bg-navy text-white'
                    : item.category === 'parish' ? 'bg-crimson text-white'
                    : item.category === 'clergy' ? 'bg-green-800 text-white'
                    : 'bg-gray-500 text-white'}`}>
                    {item.category}
                  </span>
                  {item.parish && <span className="text-xs text-gray-500 italic">{item.parish}</span>}
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="font-body text-sm text-gray-600 line-clamp-3">
                  {item.report || item.summary}
                </p>
                {item.report && (
                  <p className="text-xs text-crimson-mid mt-2 font-semibold">Post-event report</p>
                )}
                {item.source && (
                  <p className="text-xs text-gray-400 mt-2">{item.source}</p>
                )}
              </div>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <p className="text-gray-500 font-body">No recent news in this category.</p>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-crimson text-center">
        <div className="max-w-site mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-white mb-3">Explore Our Churches</h2>
          <p className="text-white/80 font-body text-lg mb-6">
            Browse the map, search by parish, or discover a church at random.
          </p>
          <a href="#/churches"
             className="inline-block bg-gold-bright hover:bg-gold text-white font-heading font-semibold
                        px-8 py-3 rounded transition-colors text-lg">
            Browse Map &rarr;
          </a>
        </div>
      </section>
    </main>
  )
}
