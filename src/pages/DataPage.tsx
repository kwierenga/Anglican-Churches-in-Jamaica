import { useEffect, useMemo, useState } from 'react'
import { getCatalog, loadSearchIndex } from '../lib/search'
import { to } from '../lib/router'
import type { ChurchRow } from '../lib/schemas'

type Filter = 'all' | 'photo' | 'style' | 'metadata' | 'complete'

// Narratives are uniformly thorough (every entry has 4+ references and 477+
// words), so the genuine gaps are photographs and optional structured facts —
// not narrative length. We deliberately don't flag on word/reference counts,
// which would only invite filler.
function gaps(c: ChurchRow) {
  const isRuin = c.classification === 'ruin' || c.status === 'ruin'
  return {
    photo: (c.photos ?? 0) === 0,
    style: !isRuin && (c.styles?.length ?? 0) === 0,
    metadata: !c.founding_year || !c.patron_saint || !c.heritage,
  }
}

export default function DataPage() {
  const [catalog, setCatalog] = useState<ChurchRow[]>(getCatalog())
  const [filter, setFilter] = useState<Filter>('photo')
  useEffect(() => { loadSearchIndex().then(() => setCatalog(getCatalog())) }, [])

  const stats = useMemo(() => {
    const s = { total: catalog.length, photo: 0, style: 0, founding: 0, patron: 0, heritage: 0, minRefs: Infinity, minWords: Infinity }
    for (const c of catalog) {
      const g = gaps(c)
      if (g.photo) s.photo++
      if (g.style) s.style++
      if (c.founding_year) s.founding++
      if (c.patron_saint) s.patron++
      if (c.heritage) s.heritage++
      s.minRefs = Math.min(s.minRefs, c.refs ?? 0)
      s.minWords = Math.min(s.minWords, c.words ?? 0)
    }
    if (!catalog.length) { s.minRefs = 0; s.minWords = 0 }
    return s
  }, [catalog])

  const rows = useMemo(() => {
    const list = catalog.filter(c => {
      const g = gaps(c)
      if (filter === 'photo') return g.photo
      if (filter === 'style') return g.style
      if (filter === 'metadata') return g.metadata
      if (filter === 'complete') return !g.photo && !g.style && !g.metadata
      return true
    })
    return list.sort((a, b) => (a.photos ?? 0) - (b.photos ?? 0) || a.parish.localeCompare(b.parish) || a.name.localeCompare(b.name))
  }, [catalog, filter])

  const pct = (n: number) => catalog.length ? Math.round((n / catalog.length) * 100) : 0

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'photo', label: `Needs photo (${stats.photo})` },
    { key: 'style', label: `No style (${stats.style})` },
    { key: 'metadata', label: 'Missing metadata' },
    { key: 'complete', label: 'Fully documented' },
    { key: 'all', label: `All (${catalog.length})` },
  ]

  return (
    <main>
      <section className="bg-navy text-center py-12 px-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold-bright uppercase mb-2">Maintainer</p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Data Coverage</h1>
        <p className="font-body text-white/80 max-w-2xl mx-auto">
          A live punch-list of what each church entry still needs. Narratives are already uniformly
          researched — the real gaps are photographs and optional structured facts.
        </p>
      </section>

      <section className="py-10">
        <div className="max-w-site mx-auto px-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <Stat label="Churches" value={stats.total} />
            <Stat label="Have a photo" value={`${pct(stats.total - stats.photo)}%`} sub={`${stats.photo} missing`} />
            <Stat label="Arch. style" value={`${pct(stats.total - stats.style)}%`} sub={`${stats.style} missing`} />
            <Stat label="Founding year" value={`${pct(stats.founding)}%`} sub={`${stats.founding} filled`} />
            <Stat label="Patron saint" value={`${pct(stats.patron)}%`} sub={`${stats.patron} filled`} />
            <Stat label="Heritage note" value={`${pct(stats.heritage)}%`} sub={`${stats.heritage} filled`} />
          </div>

          <p className="text-xs text-gray-500 font-body mb-8">
            Narrative health: every entry has at least <strong>{stats.minRefs}</strong> references and{' '}
            <strong>{stats.minWords}</strong> words — no stubs or under-sourced pages. Length is intentionally
            <em> not</em> a tracked gap (it would only reward filler).
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-body border transition-colors
                  ${filter === f.key ? 'bg-crimson text-white border-crimson' : 'border-gray-300 text-gray-600 hover:border-crimson hover:text-crimson'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 font-body mb-3">{rows.length} {rows.length === 1 ? 'church' : 'churches'}</p>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm font-body border-collapse">
              <thead>
                <tr className="bg-ivory text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2 font-semibold">Church</th>
                  <th className="px-3 py-2 font-semibold">Parish</th>
                  <th className="px-3 py-2 font-semibold text-center">Photos</th>
                  <th className="px-3 py-2 font-semibold text-center">Refs</th>
                  <th className="px-3 py-2 font-semibold">Gaps</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(c => {
                  const g = gaps(c)
                  const labels = [
                    g.photo && 'photo',
                    g.style && 'style',
                    !c.founding_year && 'year',
                    !c.patron_saint && 'patron',
                    !c.heritage && 'heritage',
                  ].filter(Boolean) as string[]
                  return (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-ivory/60">
                      <td className="px-3 py-2">
                        <a href={to(`/church/${c.id}`)} className="text-crimson hover:underline font-semibold">{c.name}</a>
                        {c.town && <span className="text-gray-400"> · {c.town}</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{c.parish}</td>
                      <td className={`px-3 py-2 text-center ${g.photo ? 'text-crimson font-semibold' : 'text-gray-500'}`}>{c.photos ?? 0}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{c.refs ?? 0}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {labels.length === 0
                            ? <span className="text-xs text-gold">complete</span>
                            : labels.map(l => (
                                <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-crimson/10 text-crimson">{l}</span>
                              ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 italic font-body pt-4">
            Founding year / patron saint / heritage are optional columns in {`data/churches.csv`} — filling them
            populates the Key Facts panel on each church page. Architectural style is inferred from the narrative.
          </p>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <div className="font-heading text-2xl font-bold text-crimson">{value}</div>
      <div className="text-xs text-gray-600 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
