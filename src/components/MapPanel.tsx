import { useEffect, useMemo, useRef, useState } from 'react'
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

  const parishes = useMemo(()=>{
    if(!data) return []
    const set = new Set(data.features.map(f=>f.properties!.parish))
    return [...set].sort()
  },[data])

  useEffect(()=>{
    let destroyed = false
    createAdapter().then(a => {
      if (destroyed) { a.destroy(); return }
      setAdapter(a)
      a.init(ref.current!, { onSelectChurch: (cid)=> {
        const p = new URLSearchParams(location.search); p.set('id', cid)
        history.pushState({},'',`?${p.toString()}`); window.dispatchEvent(new PopStateEvent('popstate'))
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
    if(!adapter || !data || !id) return
    adapter.flyToChurch(id)
  },[id, adapter, data])

  useEffect(()=>{
    if(!adapter || !data) return
    adapter.setFilter(p=>{
      const okParish = parish ? p.parish===parish : true
      const okClass  = klass ? p.classification===klass : true
      const okStatus = status ? p.status===status : true
      return okParish && okClass && okStatus
    })
  },[parish, klass, status, adapter, data])

  return (
    <>
      <div className="absolute z-10 m-2 flex flex-wrap gap-1.5">
        <button onClick={()=>{ setParish(''); adapter?.fitToAll() }}
                className={`px-2 py-0.5 rounded-full text-xs border ${!parish ? 'bg-[#0A4C8A] text-white border-[#0A4C8A]' : 'bg-white/90 border-gray-300 hover:bg-gray-100'}`}>
          All
        </button>
        {parishes.map(p=>(
          <button key={p} onClick={()=> setParish(parish===p ? '' : p)}
                  className={`px-2 py-0.5 rounded-full text-xs border ${parish===p ? 'bg-[#0A4C8A] text-white border-[#0A4C8A]' : 'bg-white/90 border-gray-300 hover:bg-gray-100'}`}>
            {p}
          </button>
        ))}
      </div>
      <div ref={ref} className="w-full h-full" />
    </>
  )
}
