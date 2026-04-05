import { useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import MapPanel from '../components/MapPanel'
import ChurchCard from '../components/ChurchCard'
import { useQueryState } from '../lib/state'

export default function DirectoryPage() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [id] = useQueryState('id', '')

  useEffect(() => {
    if (id && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [id])

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-62px)]">
      {/* Sidebar */}
      <aside className="border-r border-gray-200 overflow-auto bg-white">
        <Sidebar />
      </aside>

      {/* Main content: map is FIXED height, card scrolls below */}
      <main className="overflow-auto">
        <div className="relative" style={{ height: '55vh' }}>
          <MapPanel />
        </div>
        {id && (
          <div ref={cardRef} className="border-t p-5">
            <ChurchCard />
          </div>
        )}
      </main>
    </div>
  )
}
