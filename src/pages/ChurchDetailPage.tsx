import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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

export default function ChurchDetailPage() {
  const route = useRoute()
  const slug = route.replace('#/church/', '')
  const [html, setHtml] = useState('')
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [geo, setGeo] = useState<ChurchGeo | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

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
      setLoading(false)
    })
  }, [slug])

  // Mini map
  useEffect(() => {
    if (!geo || !mapRef.current) return
    // Clean up previous map
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }

    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([geo.lat - 0.003, geo.lng], 15)

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map)

    L.circleMarker([geo.lat, geo.lng], {
      radius: 10,
      fillColor: '#D4A017',
      color: '#8B0000',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map).bindTooltip(geo.name, { permanent: true, direction: 'top', offset: [0, -12] })

    mapInstance.current = map

    // Ensure tiles render after container layout settles
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [geo])

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
                  <img src={m.url} alt={m.caption} className="h-48 w-auto rounded-lg object-cover" />
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

          {/* Mini map */}
          {geo && (
            <div className="mt-8">
              <h3 className="font-heading text-xl font-semibold text-crimson mb-3">Location</h3>
              <div ref={mapRef} className="h-[280px] rounded-lg border border-gray-200 overflow-hidden" />
              <p className="text-xs text-gray-500 mt-2 font-body">
                {geo.parish} &middot; {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </p>
            </div>
          )}
        </>
      )}
    </main>
  )
}
