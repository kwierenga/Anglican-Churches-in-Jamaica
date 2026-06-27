import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import MapPanel from '../components/MapPanel'
import ChurchCard from '../components/ChurchCard'
import Button from '../components/Button'
import { useQueryState } from '../lib/state'
import { getCatalog, loadSearchIndex } from '../lib/search'
import type { ChurchRow } from '../lib/schemas'

export default function DirectoryPage() {
  const [id, setId] = useQueryState('id', '')

  // Track catalog in local state so the component re-renders when data loads.
  const [catalog, setCatalog] = useState<ChurchRow[]>(getCatalog())
  useEffect(() => {
    loadSearchIndex().then(() => setCatalog(getCatalog()))
  }, [])
  const selected = id ? catalog.find(c => c.id === id) : null

  // Fix Location state
  const [editing, setEditing] = useState(false)
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset edit mode when church changes
  useEffect(() => {
    setEditing(false)
    setNewCoords(null)
  }, [id])

  // The detail panel is its own scroll container; reset it to top on church change.
  const detailRef = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (!id) return
    const el = detailRef.current
    if (!el) return
    const reset = () => { el.scrollTop = 0 }
    reset()
    const r1 = requestAnimationFrame(reset)
    const t = setTimeout(reset, 300)
    return () => { cancelAnimationFrame(r1); clearTimeout(t) }
  }, [id])

  // The map column resizes whenever the detail panel opens/closes. Leaflet
  // (trackResize: true) re-measures on a window resize event, so nudge it
  // after the layout settles to avoid stale/grey tiles.
  useEffect(() => {
    const fire = () => window.dispatchEvent(new Event('resize'))
    const r1 = requestAnimationFrame(fire)
    const t = setTimeout(fire, 260)
    return () => { cancelAnimationFrame(r1); clearTimeout(t) }
  }, [selected])

  const csvLine = selected && newCoords
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
    <div
      className="flex flex-col md:grid md:h-[calc(100vh-62px)]"
      style={{ gridTemplateColumns: selected ? '320px minmax(0, 400px) 1fr' : '320px 1fr' }}
    >
      {/* Sidebar */}
      <aside className="order-2 md:order-none md:h-full md:overflow-auto border-r border-gray-200 bg-white">
        <Sidebar />
      </aside>

      {/* Detail panel — slides in when a church is selected */}
      {selected && (
        <section ref={detailRef} className="order-3 md:order-none md:h-full md:overflow-auto border-r border-gray-200 bg-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-crimson to-crimson-mid text-white px-4 py-3 flex items-center gap-3 border-b-2 border-gold">
            <div className="min-w-0">
              <div className="font-heading font-semibold leading-tight truncate">{selected.name}</div>
              <div className="text-xs text-white/80 truncate">{selected.town ? `${selected.town}, ` : ''}{selected.parish}</div>
            </div>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded bg-white/15 text-white border border-white/30 whitespace-nowrap">
              {selected.status}
            </span>
            <button
              onClick={() => setId('')}
              aria-label="Close church details"
              className="text-white/80 hover:text-white text-2xl leading-none -mr-1"
            >
              &times;
            </button>
          </div>

          {/* Fix Location bar (editorial) */}
          <div className="bg-parchment border-b border-gold/30 px-4 py-2 flex items-center gap-3 flex-wrap text-sm font-body">
            <span className="text-xs text-gray-500">{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</span>
            {!editing ? (
              <Button variant="outlineGold" size="sm" onClick={() => setEditing(true)} className="ml-auto text-xs">
                Fix Location
              </Button>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-crimson font-semibold">Click map to set</span>
                {newCoords && (
                  <>
                    <span className="text-xs font-mono">{newCoords.lat.toFixed(5)}, {newCoords.lng.toFixed(5)}</span>
                    <Button variant="crimson" size="sm" onClick={handleCopy} className="text-xs px-2 py-0.5">
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </>
                )}
                <button onClick={() => setEditing(false)}
                        className="text-xs px-2 py-0.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Church preview — key={id} forces fresh mount per church */}
          <div className="p-5">
            <ChurchCard key={id} />
          </div>
        </section>
      )}

      {/* Map — always full height of the column */}
      <div className="order-1 md:order-none relative h-[55vh] md:h-full border-b md:border-b-0 border-gray-200">
        <MapPanel editing={editing} onEditMove={(lat, lng) => { setNewCoords({ lat, lng }); setCopied(false) }} />
      </div>
    </div>
  )
}
