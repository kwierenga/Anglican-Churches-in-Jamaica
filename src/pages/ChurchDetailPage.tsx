import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import L from 'leaflet'
import { useRoute } from '../lib/router'
import { setSeo, resetSeo } from '../lib/seo'
import { buildSrcSet, responsiveSrc } from '../lib/cloudinary'
import { slugifyParish } from '../lib/parishes'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if (_mediaIndex) return _mediaIndex
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
}

// ── Cross-link indices ──────────────────────────────────────────────
// Architecture styles a church appears under (reverse of architecture-index).
const STYLE_META: Record<string, { title: string; icon: string }> = {
  georgian: { title: 'Georgian Colonial', icon: '\u{1F3DB}' },
  gothic_revival: { title: 'Gothic Revival', icon: '\u{26EA}' },
  vernacular: { title: 'Vernacular Caribbean', icon: '\u{1F334}' },
  estate_chapel: { title: 'Estate Chapel', icon: '\u{1F3E1}' },
  modernist: { title: 'Post-War Modernist', icon: '\u{1F3D7}' },
}

let _archIndex: Record<string, string[]> | null = null
async function getStylesForChurch(id: string): Promise<string[]> {
  if (!_archIndex) {
    const res = await fetch(`${import.meta.env.BASE_URL}data/build/architecture-index.json`)
    _archIndex = res.ok ? await res.json() : {}
  }
  return Object.keys(_archIndex!).filter(key => _archIndex![key].includes(id))
}

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

interface ChurchGeo {
  lat: number
  lng: number
  name: string
  parish: string
}

let _geoCache: Record<string, ChurchGeo> | null = null
async function getChurchGeo(id: string): Promise<ChurchGeo | null> {
  if (!_geoCache) {
    const res = await fetch(`${import.meta.env.BASE_URL}data/build/churches.geo.json`)
    if (!res.ok) return null
    const fc = await res.json()
    _geoCache = {}
    for (const f of fc.features) {
      _geoCache[f.properties.id] = {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        name: f.properties.name,
        parish: f.properties.parish,
      }
    }
  }
  return _geoCache[id] ?? null
}

export default function ChurchDetailPage() {
  const route = useRoute()
  const slug = route.replace('#/church/', '')
  const [html, setHtml] = useState('')
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [geo, setGeo] = useState<ChurchGeo | null>(null)
  const [styles, setStyles] = useState<string[]>([])
  const [clergy, setClergy] = useState<string[]>([])
  const [lightbox, setLightbox] = useState<MediaRow | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const mediaStripRef = useRef<HTMLDivElement | null>(null)

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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  // Synchronously reset scroll BEFORE the browser paints the new church.
  // Using useLayoutEffect (not useEffect) so the user never sees the old
  // scroll position with the new content. Disable browser scroll-restoration
  // once at app level so back/forward navigation also lands at top.
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const resetScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      if (mediaStripRef.current) mediaStripRef.current.scrollLeft = 0
    }
    resetScroll()
    // Also re-pin after the next frame and after async content load, in case
    // late image-load reflow or markdown rendering pushes scroll back.
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

      if (md && churchGeo) {
        const firstPara = md.split(/\n{2,}/).find(p => !p.startsWith('#') && !p.startsWith('**') && p.trim().length > 40)
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

    // Cross-link indices (architecture styles + clergy) — load independently.
    getStylesForChurch(slug).then(setStyles).catch(() => setStyles([]))
    getClergyForChurch(slug).then(setClergy).catch(() => setClergy([]))

    return () => { resetSeo() }
  }, [slug])

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="font-body text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1.5">
        <a href="#/" className="text-crimson hover:text-crimson-dark">Home</a>
        <span className="text-gray-300">/</span>
        <a href="#/churches" className="text-crimson hover:text-crimson-dark">Directory</a>
        {geo && (
          <>
            <span className="text-gray-300">/</span>
            <a href={`#/parish/${slugifyParish(geo.parish)}`} className="text-crimson hover:text-crimson-dark">
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
          {media.length > 0 && (
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
                      {m.caption}{m.credit ? ` \u2014 ${m.credit}` : ''}
                    </figcaption>
                  )}
                </figure>
              ))}
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

          {/* ── Connections ──────────────────────────────────────── */}
          {geo && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="font-heading text-xl font-semibold text-crimson mb-4">Connections</h3>
              <div className="space-y-4 font-body text-sm">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 w-24 shrink-0">Parish</span>
                  <a href={`#/parish/${slugifyParish(geo.parish)}`}
                     className="px-3 py-1 rounded-full bg-crimson/10 text-crimson hover:bg-crimson hover:text-white transition-colors">
                    {geo.parish} &rarr;
                  </a>
                </div>

                {styles.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 w-24 shrink-0">Architecture</span>
                    {styles.map(key => (
                      <a key={key} href={`?style=${key}#/architecture`}
                         className="px-3 py-1 rounded-full bg-gold/15 text-gray-800 hover:bg-gold hover:text-white transition-colors">
                        {STYLE_META[key]?.icon} {STYLE_META[key]?.title ?? key}
                      </a>
                    ))}
                  </div>
                )}

                {clergy.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 w-24 shrink-0">Clergy</span>
                    {clergy.map(name => (
                      <a key={name} href={`?q=${encodeURIComponent(name)}#/clergy`}
                         className="px-3 py-1 rounded-full border border-gray-200 text-gray-700 hover:border-crimson hover:text-crimson transition-colors">
                        {name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
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
                {lightbox.caption}{lightbox.credit ? ` \u2014 ${lightbox.credit}` : ''}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </main>
  )
}
