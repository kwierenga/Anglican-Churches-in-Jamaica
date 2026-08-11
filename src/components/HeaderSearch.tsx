import { useEffect, useRef, useState } from 'react'
import type Fuse from 'fuse.js'
import { loadSearchIndex } from '../lib/search'
import { PARISHES } from '../lib/parishes'
import { to } from '../lib/router'
import type { ChurchRow } from '../lib/schemas'

interface HeaderSearchProps {
  /** Stretch to the container width — used inside the mobile menu panel. */
  fullWidth?: boolean
}

export default function HeaderSearch({ fullWidth = false }: HeaderSearchProps) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [fuse, setFuse] = useState<Fuse<ChurchRow> | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadSearchIndex().then(setFuse) }, [])

  const query = q.trim()
  const churches = query && fuse ? fuse.search(query).slice(0, 6).map(r => r.item) : []
  const parishes = query
    ? PARISHES.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : []
  const hasResults = churches.length > 0 || parishes.length > 0

  const close = () => { setOpen(false); setQ('') }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="search"
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={e => { if (e.key === 'Escape') close() }}
        placeholder="Search churches, parishes…"
        aria-label="Search the site"
        className={`${fullWidth ? 'w-full' : 'w-44 lg:w-60'} bg-white/15 text-white placeholder-white/60 rounded-full
                   px-4 py-1.5 text-sm font-body outline-none border border-white/20
                   focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 focus:border-gold transition-colors`}
      />

      {open && query && (
        <div className={`absolute mt-1 ${fullWidth ? 'left-0 right-0' : 'right-0 w-72'}
                         bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 text-left`}>
          {!hasResults && (
            <p className="px-4 py-3 text-sm text-gray-500 font-body">No matches.</p>
          )}

          {parishes.length > 0 && (
            <div className="py-1">
              <p className="px-4 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Parishes</p>
              {parishes.map(p => (
                <a key={p.slug} href={to(`/parish/${p.slug}`)} onClick={close}
                   className="block px-4 py-2 hover:bg-ivory text-sm font-body">
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <span className="text-xs text-gray-500 ml-1">parish</span>
                </a>
              ))}
            </div>
          )}

          {churches.length > 0 && (
            <div className="py-1 border-t border-gray-100">
              <p className="px-4 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Churches</p>
              {churches.map(c => (
                <a key={c.id} href={to(`/church/${c.id}`)} onClick={close}
                   className="block px-4 py-2 hover:bg-ivory text-sm font-body">
                  <span className="font-semibold text-gray-900">{c.displayName ?? c.name}</span>
                  <span className="text-xs text-gray-500 ml-1">— {c.parish}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
