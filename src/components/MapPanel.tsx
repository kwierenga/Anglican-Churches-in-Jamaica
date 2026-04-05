import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { FeatureCollection, Point } from 'geojson'
import type { MapAdapter, ChurchFeature } from '../adapters/MapAdapter'
import LeafletAdapter from '../adapters/LeafletAdapter'
import { useQueryState } from '../lib/state'

async function createAdapter(): Promise<MapAdapter> {
  if (import.meta.env.VITE_MAP_ADAPTER === 'arcgis') {
    const { default: ArcGISAdapter } = await import('../adapters/ArcGISAdapter')
    return new ArcGISAdapter()
  }
  return new LeafletAdapter()
}

export default function MapPanel(){
  const ref = useRef<HTMLDivElement>(null)
  const [adapter, setAdapter] = useState<MapAdapter>()
  const [data, setData] = useState<FeatureCollection<Point, ChurchFeature['properties']> | null>(null)
  const [parish, setParish] = useQueryState('parish','')
  const [id] = useQueryState('id','')
  const [klass] = useQueryState('class','')
  const [status] = useQueryState('status','')

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const parishes = useMemo(()=>{
    if(!data) return []
    const set = new Set(data.features.map(f=>f.properties!.parish))
    return [...set].sort()
  },[data])

  // Get selected church name
  const selectedChurch = useMemo(() => {
    if (!data || !id) return null
    const f = data.features.find(x => x.properties!.id === id)
    if (!f) return null
    return {
      name: f.properties!.name,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }
  }, [data, id])

  useEffect(()=>{
    let destroyed = false
    createAdapter().then(a => {
      if (destroyed) { a.destroy(); return }
      setAdapter(a)
      a.init(ref.current!, { onSelectChurch: (cid)=> {
        const p = new URLSearchParams(location.search); p.set('id', cid)
        const hash = location.hash || ''
        history.pushState({},'',`?${p.toString()}${hash}`); window.dispatchEvent(new PopStateEvent('popstate'))
      }})
      fetch(`${import.meta.env.BASE_URL}data/build/churches.geo.json`).then(r=>r.json()).then(fc=>{
        if (!destroyed) { setData(fc); a.plot(fc) }
      })
    })
    return ()=>{ destroyed = true; adapter?.destroy() }
  },[])

  useEffect(()=>{
    if(!adapter || !data) return
    if(parish) adapter.fitToParish(parish); else adapter.fitToAll()
  },[parish, adapter, data])

  useEffect(()=>{
    if(!adapter || !data) return
    adapter.setFilter(p=>{
      const okParish = parish ? p.parish===parish : true
      const okClass  = klass ? p.classification===klass : true
      const okStatus = status ? p.status===status : true
      return okParish && okClass && okStatus
    })
  },[parish, klass, status, adapter, data])

  // Must be LAST so highlight survives setFilter replot
  useEffect(()=>{
    if(!adapter || !data || !id) return
    adapter.flyToChurch(id)
    // Reset edit mode when church changes
    setEditing(false)
    setNewCoords(null)
  },[id, adapter, data])

  // Toggle edit mode on adapter
  const onMove = useCallback((lat: number, lng: number) => {
    setNewCoords({ lat, lng })
    setCopied(false)
  }, [])

  useEffect(() => {
    if (!adapter) return
    adapter.setEditMode(editing, editing ? onMove : undefined)
    if (!editing) setNewCoords(null)
  }, [editing, adapter, onMove])

  const csvLine = selectedChurch && newCoords
    ? `${id},${newCoords.lat.toFixed(5)},${newCoords.lng.toFixed(5)}`
    : null

  const handleCopy = () => {
    if (!csvLine) return
    navigator.clipboard.writeText(csvLine).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <div className="absolute z-10 m-2 flex flex-wrap gap-1.5">
        <button onClick={()=>{ setParish(''); adapter?.fitToAll() }}
                className={`px-2 py-0.5 rounded-full text-xs border font-body ${!parish ? 'bg-crimson text-white border-crimson' : 'bg-white/90 border-gray-300 hover:bg-gray-100'}`}>
          All
        </button>
        {parishes.map(p=>(
          <button key={p} onClick={()=> setParish(parish===p ? '' : p)}
                  className={`px-2 py-0.5 rounded-full text-xs border font-body ${parish===p ? 'bg-crimson text-white border-crimson' : 'bg-white/90 border-gray-300 hover:bg-gray-100'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Coordinate editor panel */}
      {selectedChurch && (
        <div className="absolute z-10 bottom-2 left-2 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200 p-3 max-w-[320px] text-sm font-body">
          <div className="font-heading font-semibold text-gray-900 text-sm mb-1">{selectedChurch.name}</div>
          <div className="text-xs text-gray-500 mb-2">
            Current: {selectedChurch.lat.toFixed(5)}, {selectedChurch.lng.toFixed(5)}
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-2.5 py-1 rounded border border-gold text-gold hover:bg-gold hover:text-white transition-colors"
            >
              Fix Location
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-crimson font-semibold">
                Click the map to set the correct position
              </div>
              {newCoords && (
                <div className="bg-ivory rounded p-2">
                  <div className="text-xs text-gray-700">
                    New: <span className="font-mono font-semibold">{newCoords.lat.toFixed(5)}, {newCoords.lng.toFixed(5)}</span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={handleCopy}
                      className="text-xs px-2 py-0.5 rounded bg-crimson text-white hover:bg-crimson-dark transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <span className="text-[10px] text-gray-400 leading-tight self-center">
                      {csvLine}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={() => setEditing(false)}
                className="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      <div ref={ref} className="w-full h-full" />
    </>
  )
}
