import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import MapPanel from '../components/MapPanel'
import ChurchCard from '../components/ChurchCard'
import { useQueryState } from '../lib/state'
import { getCatalog } from '../lib/search'

export default function DirectoryPage() {
  const [id] = useQueryState('id', '')

  // Get selected church from the already-loaded search catalog
  const catalog = getCatalog()
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
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-62px)]">
      {/* Sidebar */}
      <aside className="border-r border-gray-200 overflow-auto bg-white">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="overflow-auto">
        {/* Map — fixed height */}
        <div className="relative" style={{ height: '55vh' }}>
          <MapPanel editing={editing} onEditMove={(lat, lng) => { setNewCoords({ lat, lng }); setCopied(false) }} />
        </div>

        {/* Fix Location bar — outside the map, always visible when a church is selected */}
        {selected && (
          <div className="bg-parchment border-y border-gold/30 px-4 py-2 flex items-center gap-4 flex-wrap text-sm font-body">
            <span className="font-heading font-semibold text-gray-900">{selected.name}</span>
            <span className="text-xs text-gray-500">
              {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
            </span>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1 rounded border border-gold text-gold hover:bg-gold hover:text-white transition-colors ml-auto"
              >
                Fix Location
              </button>
            ) : (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs text-crimson font-semibold">Click map to set position</span>
                {newCoords && (
                  <>
                    <span className="text-xs font-mono">{newCoords.lat.toFixed(5)}, {newCoords.lng.toFixed(5)}</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs px-2 py-0.5 rounded bg-crimson text-white hover:bg-crimson-dark transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs px-2 py-0.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* Church detail card */}
        {id && (
          <div className="border-t p-5">
            <ChurchCard />
          </div>
        )}
      </main>
    </div>
  )
}
