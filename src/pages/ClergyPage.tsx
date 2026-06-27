import { useEffect, useMemo, useState } from 'react'

interface ClergyMention {
  id: string
  name: string
  parish: string
}

type ClergyIndex = Record<string, ClergyMention[]>

const TITLE_ORDER = [
  'Archbishop', 'Bishop', 'Rt. Rev', 'Very Revd', 'Archdeacon',
  'Dean', 'Canon', 'Rev', 'Father', 'Mother', 'Sister',
]

function splitTitleAndName(entry: string): { title: string; name: string; surname: string } {
  const match = entry.match(/^((?:Rt\.?\s+Revd?|Very\s+Revd?|Revd?\.?|Rev|Canon|Dean|Bishop|Archbishop|Archdeacon|Father|Mother|Sister)\.?)\s+(.+)$/)
  if (!match) return { title: '', name: entry, surname: entry.split(/\s+/).pop() || entry }
  const title = match[1]
  const name = match[2]
  const parts = name.split(/\s+/)
  const surname = parts[parts.length - 1]
  return { title, name, surname }
}

function groupByInitial(entries: [string, ClergyMention[]][]) {
  const groups = new Map<string, [string, ClergyMention[]][]>()
  for (const [k, v] of entries) {
    const { surname } = splitTitleAndName(k)
    const initial = (surname[0] || '?').toUpperCase()
    if (!groups.has(initial)) groups.set(initial, [])
    groups.get(initial)!.push([k, v])
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export default function ClergyPage() {
  const [index, setIndex] = useState<ClergyIndex>({})
  // Pre-fill the filter when arriving via a ?q= cross-link (e.g. from a church page).
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') ?? '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/build/clergy-index.json`)
      .then(r => r.ok ? r.json() : {})
      .then(setIndex)
      .catch(() => setIndex({}))
      .finally(() => setLoading(false))
  }, [])

  const entries = useMemo(() => {
    const list = Object.entries(index)
    const q = query.trim().toLowerCase()
    const filtered = q ? list.filter(([k]) => k.toLowerCase().includes(q)) : list
    return filtered.sort(([a], [b]) => {
      const sa = splitTitleAndName(a).surname
      const sb = splitTitleAndName(b).surname
      const c = sa.localeCompare(sb)
      return c !== 0 ? c : a.localeCompare(b)
    })
  }, [index, query])

  const groups = groupByInitial(entries)
  const totalUnique = Object.keys(index).length
  const totalMentions = Object.values(index).reduce((s, a) => s + a.length, 0)

  return (
    <main>
      <section className="bg-navy text-center py-14 px-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold-bright uppercase mb-2">Index</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Clergy</h1>
        <hr className="w-16 h-[3px] bg-gold-bright border-0 mx-auto my-4" />
        <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
          Clergy named in the church narratives — bishops, archbishops, rectors, and priests across {totalUnique > 0 ? `${totalUnique} entries` : 'the diocese'}.
        </p>
      </section>

      <section className="py-10">
        <div className="max-w-site mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <input
              type="search"
              placeholder="Search by name or title…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 max-w-md border border-gray-300 rounded px-3 py-2 font-body text-base focus:outline-none focus:border-crimson"
            />
            {!loading && (
              <p className="text-sm text-gray-500 font-body">
                {entries.length} {entries.length === 1 ? 'person' : 'people'} &middot; {totalMentions} mentions
              </p>
            )}
          </div>

          {/* Alphabet jumplist */}
          {!loading && groups.length > 0 && (
            <nav aria-label="Alphabet index" className="flex flex-wrap gap-1 mb-8 text-sm">
              {TITLE_ORDER.length > 0 && (
                <span className="text-xs font-semibold text-gray-500 mr-2 self-center uppercase tracking-wider">Jump to</span>
              )}
              {groups.map(([initial]) => (
                <button
                  key={initial}
                  type="button"
                  onClick={() => document.getElementById(`clergy-${initial}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-2.5 py-1 border border-gray-200 rounded text-crimson font-body hover:bg-crimson hover:text-white hover:border-crimson transition-colors"
                >
                  {initial}
                </button>
              ))}
            </nav>
          )}

          {loading && <p className="text-gray-400 font-body">Loading clergy index…</p>}

          {!loading && entries.length === 0 && (
            <p className="text-gray-500 font-body italic">No clergy match that search.</p>
          )}

          {groups.map(([initial, group]) => (
            <section key={initial} id={`clergy-${initial}`} className="mb-8 scroll-mt-20">
              <h2 className="font-heading text-xl font-bold text-crimson mb-3 border-b border-gold/40 pb-1">
                {initial}
              </h2>
              <ul className="space-y-3">
                {group.map(([full, mentions]) => {
                  const { title, name } = splitTitleAndName(full)
                  return (
                    <li key={full} className="font-body">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-xs font-semibold text-crimson-mid uppercase tracking-wider">{title}</span>
                        <span className="font-heading text-lg text-gray-900">{name}</span>
                      </div>
                      <ul className="mt-1 ml-1 text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                        {mentions.map(m => (
                          <li key={m.id}>
                            <a href={`#/church/${m.id}`} className="text-crimson hover:underline">
                              {m.name}
                            </a>
                            <span className="text-gray-400"> &middot; {m.parish}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}

          <p className="text-xs text-gray-400 italic font-body pt-6 border-t border-gray-200">
            The clergy index is generated at build time by scanning each church's narrative for titled names (Rev., Canon, Archdeacon, Bishop, etc.). References sections are excluded. Spelling variants (e.g. Rev / Revd) appear as separate entries.
          </p>
        </div>
      </section>
    </main>
  )
}
