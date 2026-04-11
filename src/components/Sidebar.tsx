import { useEffect, useMemo, useState } from 'react'
import type Fuse from 'fuse.js'
import { useQueryState } from '../lib/state'
import { uniqueValues } from '../lib/utils'
import { loadSearchIndex, getCatalog } from '../lib/search'
import type { ChurchRow } from '../lib/schemas'

export default function Sidebar() {
  const [q, setQ] = useQueryState('q', '')
  const [parish, setParish] = useQueryState('parish', '')
  const [klass, setKlass] = useQueryState('class', '')
  const [status, setStatus] = useQueryState('status', '')
  const [, setId] = useQueryState('id', '')

  const [catalog, setCatalog] = useState<ChurchRow[]>([])
  const [fuse, setFuse] = useState<Fuse<ChurchRow> | null>(null)

  useEffect(() => {
    loadSearchIndex().then(f => { setFuse(f); setCatalog(getCatalog()) })
  }, [])

  const parishes = useMemo(() => uniqueValues(catalog, 'parish'), [catalog])
  const classes = useMemo(() => uniqueValues(catalog, 'classification'), [catalog])
  const statuses = useMemo(() => uniqueValues(catalog, 'status'), [catalog])

  const results: ChurchRow[] = q.trim() && fuse ? fuse.search(q).slice(0, 8).map(r => r.item) : []

  const filtered = useMemo(() => catalog.filter(c => {
    if (parish && c.parish !== parish) return false
    if (klass && c.classification !== klass) return false
    if (status && c.status !== status) return false
    return true
  }), [catalog, parish, klass, status])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-crimson to-crimson-mid border-b-2 border-gold">
        <div className="text-white font-heading font-semibold">
          {filtered.length} of {catalog.length} Churches
        </div>
      </div>

      <div className="p-3 space-y-2 overflow-auto flex-1">
        {/* Search */}
        <div className="relative">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search church name..."
            aria-label="Search churches"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-body
                       focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
          />
          {results.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setId(item.id);                     setQ('')
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-ivory text-sm font-body"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-1">— {item.parish}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <select value={parish} onChange={e => setParish(e.target.value)}
                aria-label="Filter by parish"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-body focus:border-gold outline-none">
          <option value="">All Parishes</option>
          {parishes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={klass} onChange={e => setKlass(e.target.value)}
                aria-label="Filter by classification"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-body focus:border-gold outline-none">
          <option value="">All Classifications</option>
          {classes.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
                aria-label="Filter by status"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-body focus:border-gold outline-none">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex gap-2">
          <button onClick={() => { setQ(''); setParish(''); setKlass(''); setStatus(''); setId(''); }}
                  className="border border-crimson/30 text-crimson px-3 py-1.5 rounded text-sm font-body
                             hover:bg-crimson hover:text-white transition-colors">
            Reset
          </button>
          <button onClick={() => {
                    const pool = filtered.length > 0 ? filtered : catalog
                    if (pool.length === 0) return
                    const pick = pool[Math.floor(Math.random() * pool.length)]
                    setId(pick.id)
                  }}
                  className="border border-gold text-gold px-3 py-1.5 rounded text-sm font-body
                             hover:bg-gold hover:text-white transition-colors">
            Surprise Me
          </button>
        </div>

        {/* Church list */}
        <div className="mt-2 space-y-1">
          {filtered.slice(0, 50).map(c => (
            <button
              key={c.id}
              onClick={() => { setId(c.id) }}
              className="block w-full text-left px-3 py-2 rounded text-sm font-body
                         border-l-4 border-transparent hover:border-l-crimson hover:bg-ivory transition-colors"
            >
              <span className="font-semibold text-gray-900">{c.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{c.town ? `${c.town}, ` : ''}{c.parish}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded
                  ${c.status === 'active' ? 'bg-green-100 text-green-700'
                  : c.status === 'ruin' ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-500'}`}>
                  {c.status}
                </span>
              </div>
            </button>
          ))}
          {filtered.length > 50 && (
            <p className="text-xs text-gray-400 px-3 py-2">
              Showing first 50 of {filtered.length}. Use filters to narrow down.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
