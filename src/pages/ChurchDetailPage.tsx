import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useRoute } from '../lib/router'
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

function miniMapUrl(lat: number, lng: number): string {
  // OpenStreetMap embed with a marker
  const delta = 0.02
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

export default function ChurchDetailPage() {
  const route = useRoute()
  const slug = route.replace('#/church/', '')
  const [html, setHtml] = useState('')
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [geo, setGeo] = useState<ChurchGeo | null>(null)
  const [lightbox, setLightbox] = useState<MediaRow | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}content/churches/${slug}.md`).then(r => r.ok ? r.text() : ''),
      getMediaIndex(),
      getChurchGeo(slug),
    ]).then(([md, idx, churchGeo]) => {
      setHtml(md ? (marked.parse(md) as string) : '<p>Church not found.</p>')
      setMedia(idx[slug]?.filter(m => m.type === 'image') ?? [])
      setGeo(churchGeo)
    }).catch(() => {
      setHtml('<p>Failed to load church details.</p>')
    }).finally(() => {
      setLoading(false)
    })
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
                    src={m.url}
                    alt={m.caption}
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

          {/* Mini map — simple OSM embed, always centers correctly */}
          {geo && (
            <div className="mt-8">
              <h3 className="font-heading text-xl font-semibold text-crimson mb-3">Location</h3>
              <iframe
                src={miniMapUrl(geo.lat, geo.lng)}
                width="100%"
                height="350"
                className="rounded-lg border border-gray-200"
                style={{ border: 0 }}
                loading="lazy"
                title={`Map showing ${geo.name}`}
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <figure className="max-w-full max-h-full flex flex-col items-center">
            <img
              src={lightbox.url}
              alt={lightbox.caption}
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
