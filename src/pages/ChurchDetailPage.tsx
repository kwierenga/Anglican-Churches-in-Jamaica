import { useCallback, useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import L from 'leaflet'
import { useRoute } from '../lib/router'
import { setSeo, resetSeo } from '../lib/seo'
import { buildSrcSet, responsiveSrc } from '../lib/cloudinary'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if (_mediaIndex) return _mediaIndex
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
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
  const [lightbox, setLightbox] = useState<MediaRow | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

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

  useEffect(() => {
    if (!slug) return
    window.scrollTo(0, 0)
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

    return () => { resetSeo() }
  }, [slug])

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a href="#/churches" className="text-crimson hover:text-crimson-dark font-body text-sm mb-6 inline-block">
        &larr; Back to Directory
      </a>

      {loading ? (
        <p className="text-gray-400 font-body">Loading...</p>
      ) : (
        <>
          {media.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
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
                       prose-a:text-crimson"
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
