import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import L from 'leaflet'
import { useRoute, to } from '../lib/router'
import { setSeo, resetSeo } from '../lib/seo'
import { buildSrcSet, responsiveSrc } from '../lib/cloudinary'
import { slugifyParish } from '../lib/parishes'
import { contributeMailto } from '../lib/site'
import Button from '../components/Button'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if (_mediaIndex) return _mediaIndex
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
}

const STYLE_META: Record<string, { title: string; icon: string }> = {
  georgian: { title: 'Georgian Colonial', icon: '\u{1F3DB}' },
  gothic_revival: { title: 'Gothic Revival', icon: '\u{26EA}' },
  vernacular: { title: 'Vernacular Caribbean', icon: '\u{1F334}' },
  estate_chapel: { title: 'Estate Chapel', icon: '\u{1F3E1}' },
  modernist: { title: 'Post-War Modernist', icon: '\u{1F3D7}' },
}

const CLASS_LABEL: Record<string, string> = {
  cathedral: 'Cathedral', parish_church: 'Parish Church', church: 'Church',
  chapel: 'Chapel', mission: 'Mission', ruin: 'Ruin',
}

const cap = (s: string) => s ? s[0].toUpperCase() + s.slice(1) : s

// Clergy named in this church's narrative (reverse of clergy-index).
let _clergyIndex: Record<string, { id: string }[]> | null = null
async function getClergyForChurch(id: string): Promise<string[]> {
  if (!_clergyIndex) {
    const res = await fetch(`${import.meta.env.BASE_URL}data/build/clergy-index.json`)
    _clergyIndex = res.ok ? await res.json() : {}
  }
  return Object.entries(_clergyIndex!)
    .filter(([, mentions]) => mentions.some(m => m.id === id))
    .map(([name]) => name)
}

// Rough word count of the narrative body (excludes headings, the meta line,
// References, and link URLs) — used to flag thin "stub" entries.
function narrativeWordCount(md: string): number {
  let body = md.split(/^##\s+References\b/mi)[0]
  body = body.split('\n').filter(l => !l.startsWith('#') && !l.startsWith('**')).join(' ')
  body = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_`>]/g, ' ')
  return body.split(/\s+/).filter(Boolean).length
}

interface ChurchGeo {
  lat: number
  lng: number
  name: string
  parish: string
  town?: string
  classification?: string
  status?: string
  styles?: string[]
  founding_year?: number
  patron_saint?: string
  heritage?: string
}

let _geoCache: Record<string, ChurchGeo> | null = null
async function getChurchGeo(id: string): Promise<ChurchGeo | null> {
  if (!_geoCache) {
    const res = await fetch(`${import.meta.env.BASE_URL}data/build/churches.geo.json`)
    if (!res.ok) return null
    const fc = await res.json()
    _geoCache = {}
    for (const f of fc.features) {
      const p = f.properties
      _geoCache[p.id] = {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        name: p.name,
        parish: p.parish,
        town: p.town,
        classification: p.classification,
        status: p.status,
        styles: p.styles ?? [],
        founding_year: p.founding_year,
        patron_saint: p.patron_saint,
        heritage: p.heritage,
      }
    }
  }
  return _geoCache[id] ?? null
}

export default function ChurchDetailPage() {
  const route = useRoute()
  const slug = route.replace('/church/', '')
  const [html, setHtml] = useState('')
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [geo, setGeo] = useState<ChurchGeo | null>(null)
  const [clergy, setClergy] = useState<string[]>([])
  const [isStub, setIsStub] = useState(false)
  const [lightbox, setLightbox] = useState<MediaRow | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const mediaStripRef = useRef<HTMLDivElement | null>(null)
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null)

  const satelliteMapRef = useCallback((el: HTMLDivElement | null) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
    if (!el || !geo) return
    const map = L.map(el, { zoomControl: true }).setView([geo.lat, geo.lng], 17)
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics' }
    )
    const terrain = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: 'Tiles &copy; Esri' }
    )
    satellite.addTo(map)
    L.control.layers(
      { 'Satellite': satellite, 'Terrain': terrain },
      {},
      { position: 'topright', collapsed: false }
    ).addTo(map)
    L.circleMarker([geo.lat, geo.lng], {
      radius: 8, color: '#fff', weight: 2, fillColor: '#8B0000', fillOpacity: 1,
    }).addTo(map)
    requestAnimationFrame(() => map.invalidateSize())
    mapInstanceRef.current = map
  }, [geo])

  useEffect(() => {
    if (!lightbox) return
    const prev = document.activeElement as HTMLElement | null
    lightboxCloseRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [lightbox])

  // Synchronously reset scroll BEFORE the browser paints the new church.
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const resetScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      if (mediaStripRef.current) mediaStripRef.current.scrollLeft = 0
    }
    resetScroll()
    const r1 = requestAnimationFrame(resetScroll)
    const r2 = requestAnimationFrame(() => requestAnimationFrame(resetScroll))
    const t = setTimeout(resetScroll, 300)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      clearTimeout(t)
    }
  }, [slug, loading])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}content/churches/${slug}.md`).then(r => r.ok ? r.text() : ''),
      getMediaIndex(),
      getChurchGeo(slug),
    ]).then(([md, idx, churchGeo]) => {
      setHtml(md ? (marked.parse(md) as string) : '<p>Church not found.</p>')
      const images = idx[slug]?.filter(m => m.type === 'image') ?? []
      setMedia(images)
      setGeo(churchGeo)
      setIsStub(md ? narrativeWordCount(md) < 120 : false)

      if (md && churchGeo) {
        const firstPara = md.split(/\n\s*\n/).find(p => !p.startsWith('#') && !p.startsWith('**') && p.trim().length > 40)
        const description = firstPara
          ? firstPara.replace(/[*_`[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 200)
          : `${churchGeo.name} — Anglican church in ${churchGeo.parish}, Jamaica.`
        const heroImage = images[0]
          ? responsiveSrc(images[0].url, 1200, { height: 630, crop: 'fill' })
          : undefined
        setSeo({
          title: churchGeo.name,
          description,
          image: heroImage,
          type: 'article',
        })
      }
    }).catch(() => {
      setHtml('<p>Failed to load church details.</p>')
    }).finally(() => {
      setLoading(false)
    })

    getClergyForChurch(slug).then(setClergy).catch(() => setClergy([]))

    return () => { resetSeo() }
  }, [slug])

  const styles = geo?.styles ?? []

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="font-body text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1.5">
        <a href={to('/')} className="text-crimson hover:text-crimson-dark">Home</a>
        <span className="text-gray-300">/</span>
        <a href={to('/churches')} className="text-crimson hover:text-crimson-dark">Directory</a>
        {geo && (
          <>
            <span className="text-gray-300">/</span>
            <a href={to(`/parish/${slugifyParish(geo.parish)}`)} className="text-crimson hover:text-crimson-dark">
              {geo.parish}
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700">{geo.name}</span>
          </>
        )}
      </nav>

      {loading ? (
        <p className="text-gray-400 font-body">Loading...</p>
      ) : (
        <>
          {/* Thin-content notice (#2) */}
          {isStub && geo && (
            <div className="mb-6 rounded-lg border border-gold/40 bg-parchment px-4 py-3 text-sm font-body text-gray-700">
              <span className="font-semibold text-crimson">This entry is a stub.</span>{' '}
              We have only a brief note for {geo.name}.{' '}
              <a href={contributeMailto(geo.name, 'history')}
                 className="text-crimson underline underline-offset-2 hover:text-crimson-dark">
                Help expand it &rarr;
              </a>
            </div>
          )}

          {/* Photos — strip, or placeholder + contribute prompt (#1) */}
          {media.length > 0 ? (
            <div ref={mediaStripRef} className="flex gap-3 overflow-x-auto pb-3 mb-6">
              {media.map((m, i) => (
                <figure key={i} className="shrink-0 m-0">
                  <img
                    src={responsiveSrc(m.url, 400, { height: 300, crop: 'fill' })}
                    srcSet={buildSrcSet(m.url, { widths: [400, 600, 800, 1200], height: 300, crop: 'fill' })}
                    sizes="(max-width: 640px) 50vw, 400px"
                    alt={m.caption}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    width={400}
                    height={300}
                    className="h-48 w-auto rounded-lg object-cover cursor-zoom-in"
                    onClick={() => setLightbox(m)}
                  />
                  {m.caption && (
                    <figcaption className="text-xs text-gray-500 mt-1 max-w-[14rem]">
                      {m.caption}{m.credit ? ` — ${m.credit}` : ''}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : geo && (
            <div className="mb-6 rounded-lg border border-dashed border-gold/50 bg-ivory px-6 py-8 text-center">
              <div className="text-gold/70 text-4xl mb-2" aria-hidden="true">&#10013;</div>
              <p className="font-heading text-gray-700">No photograph yet</p>
              <p className="font-body text-sm text-gray-500 mt-1 mb-4">
                Have a photo of {geo.name}? Help complete this entry.
              </p>
              <Button href={contributeMailto(geo.name, 'photo')} variant="outlineGold" size="sm">
                &#128247; Contribute a photo
              </Button>
            </div>
          )}

          {/* Key Facts (#3) */}
          {geo && (
            <div className="mb-8 rounded-lg border border-gold/30 bg-parchment p-5">
              <h2 className="font-heading text-lg font-semibold text-crimson mb-3">Key Facts</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm font-body">
                <Fact k="Classification" v={geo.classification ? CLASS_LABEL[geo.classification] : undefined} />
                <Fact k="Status" v={geo.status ? cap(geo.status) : undefined} />
                <Fact k="Parish" v={geo.parish} />
                <Fact k="Town" v={geo.town} />
                <Fact k="Founded" v={geo.founding_year ? String(geo.founding_year) : undefined} />
                <Fact k="Patron saint" v={geo.patron_saint} />
                {styles.length > 0 && (
                  <div>
                    <dt className="text-gray-500">Architecture</dt>
                    <dd className="text-gray-900 font-medium flex flex-wrap gap-x-2">
                      {styles.map((key, i) => (
                        <span key={key}>
                          <a href={`${to('/architecture')}?style=${key}`} className="text-crimson hover:text-crimson-dark underline underline-offset-2">
                            {STYLE_META[key]?.title ?? key}
                          </a>{i < styles.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <Fact k="Heritage" v={geo.heritage} />
                <Fact k="Photographs" v={media.length ? String(media.length) : 'none yet'} />
              </dl>
            </div>
          )}

          <article
            className="prose md:prose-lg max-w-none
                       prose-headings:font-heading prose-headings:text-crimson
                       prose-p:font-body prose-p:text-gray-700
                       prose-a:text-crimson prose-a:underline prose-a:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {geo && (
            <div className="mt-8">
              <h3 className="font-heading text-xl font-semibold text-crimson mb-3">Location</h3>
              <div
                ref={satelliteMapRef}
                className="rounded-lg border border-gray-200"
                style={{ height: 350, width: '100%' }}
              />
              <p className="text-xs text-gray-500 mt-2 font-body">
                {geo.parish} &middot; {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </p>
            </div>
          )}

          {/* Connections (#10) */}
          {geo && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="font-heading text-xl font-semibold text-crimson mb-4">Connections</h3>
              <div className="space-y-4 font-body text-sm">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 w-24 shrink-0">Parish</span>
                  <a href={to(`/parish/${slugifyParish(geo.parish)}`)}
                     className="px-3 py-1 rounded-full bg-crimson/10 text-crimson hover:bg-crimson hover:text-white transition-colors">
                    {geo.parish} &rarr;
                  </a>
                </div>
                {clergy.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 w-24 shrink-0">Clergy</span>
                    {clergy.map(name => (
                      <a key={name} href={`${to('/clergy')}?q=${encodeURIComponent(name)}`}
                         className="px-3 py-1 rounded-full border border-gray-200 text-gray-700 hover:border-crimson hover:text-crimson transition-colors">
                        {name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 font-body mt-5">
                Spotted an error or have more to add?{' '}
                <a href={contributeMailto(geo.name, 'history')} className="text-crimson underline underline-offset-2 hover:text-crimson-dark">
                  Suggest an edit &rarr;
                </a>
              </p>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph — ${geo?.name ?? 'church'}`}
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <button
            ref={lightboxCloseRef}
            onClick={() => setLightbox(null)}
            aria-label="Close image"
            className="absolute top-3 right-4 text-white/90 hover:text-white text-4xl leading-none"
          >
            &times;
          </button>
          <figure className="max-w-full max-h-full flex flex-col items-center">
            <img
              src={responsiveSrc(lightbox.url, 2000)}
              srcSet={buildSrcSet(lightbox.url, { widths: [1200, 1600, 2000, 2600] })}
              sizes="100vw"
              alt={lightbox.caption}
              decoding="async"
              className="max-w-full max-h-[90vh] object-contain rounded"
            />
            {lightbox.caption && (
              <figcaption className="text-sm text-gray-200 mt-3 text-center font-body">
                {lightbox.caption}{lightbox.credit ? ` — ${lightbox.credit}` : ''}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </main>
  )
}

function Fact({ k, v }: { k: string; v?: string }) {
  if (!v) return null
  return (
    <div>
      <dt className="text-gray-500">{k}</dt>
      <dd className="text-gray-900 font-medium">{v}</dd>
    </div>
  )
}
