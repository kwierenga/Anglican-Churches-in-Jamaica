import { useEffect, useState } from 'react'
import { getCatalog, loadSearchIndex } from '../lib/search'
import type { ChurchRow } from '../lib/schemas'

type StyleKey = 'georgian' | 'gothic_revival' | 'vernacular' | 'estate_chapel' | 'modernist'
type StyleIndex = Record<StyleKey, string[]>

interface StyleMeta {
  key: StyleKey
  title: string
  period: string
  icon: string
  description: string
}

const STYLES: StyleMeta[] = [
  {
    key: 'georgian',
    title: 'Georgian Colonial',
    period: '17th–18th century',
    icon: '\u{1F3DB}',
    description:
      'Symmetrical stone and brick with classical quoins, round-headed windows, and square towers. Built by the established church of the colony; often with galleries for enslaved and free Black worshippers.',
  },
  {
    key: 'gothic_revival',
    title: 'Gothic Revival',
    period: '19th century',
    icon: '\u{26EA}',
    description:
      'Pointed arches, lancet windows, buttresses, and steep roofs imported from the English parish-church tradition. The default style of the post-Emancipation and post-Disestablishment expansion.',
  },
  {
    key: 'vernacular',
    title: 'Vernacular Caribbean',
    period: '19th–20th century',
    icon: '\u{1F334}',
    description:
      'Timber-frame construction, louvred windows, verandahs, and shingled roofs adapted to the tropical climate. Often the architecture of the interior chapels and post-1907 rebuilds.',
  },
  {
    key: 'estate_chapel',
    title: 'Estate Chapels',
    period: '18th–19th century',
    icon: '\u{1F3E1}',
    description:
      'Small chapels built on sugar and coffee estates, originally for planter families and later for the enslaved and emancipated workers on the property. Survivors now serve surrounding rural communities.',
  },
  {
    key: 'modernist',
    title: 'Post-War Modernist',
    period: 'Mid-20th century',
    icon: '\u{1F3D7}',
    description:
      'Concrete, glass, and bold geometric forms reflecting independence-era optimism, with open sanctuary plans and abstract stained glass.',
  },
]

export default function ArchitecturePage() {
  const [index, setIndex] = useState<StyleIndex | null>(null)
  const [catalog, setCatalog] = useState<ChurchRow[]>(getCatalog())

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/build/architecture-index.json`)
      .then(r => r.ok ? r.json() : null)
      .then(setIndex)
      .catch(() => setIndex(null))
    loadSearchIndex().then(() => setCatalog(getCatalog()))
  }, [])

  const byId = new Map(catalog.map(c => [c.id, c]))

  return (
    <main>
      <section className="bg-navy text-center py-16 px-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold-bright uppercase mb-2">Architecture</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Building Traditions</h1>
        <hr className="w-16 h-[3px] bg-gold-bright border-0 mx-auto my-4" />
        <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
          Jamaican Anglican churches span three centuries of building traditions — from Georgian colonial cathedrals to post-independence concrete sanctuaries.
        </p>
      </section>

      <section className="py-12">
        <div className="max-w-site mx-auto px-4 space-y-12">
          {STYLES.map(style => {
            const ids = index?.[style.key] ?? []
            const matches = ids
              .map(id => byId.get(id))
              .filter((c): c is ChurchRow => Boolean(c))
              .sort((a, b) => a.name.localeCompare(b.name))

            return (
              <article key={style.key} id={style.key}>
                <header className="flex items-baseline gap-3 mb-4">
                  <div className="text-3xl">{style.icon}</div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-crimson">{style.title}</h2>
                    <p className="text-xs font-semibold tracking-wider text-crimson-mid uppercase mt-0.5">{style.period}</p>
                  </div>
                </header>
                <p className="font-body text-base text-gray-700 leading-relaxed mb-5 max-w-3xl">
                  {style.description}
                </p>

                {matches.length === 0 ? (
                  <p className="text-sm text-gray-400 italic font-body">No churches currently indexed for this style.</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-3 font-body">
                      {matches.length} {matches.length === 1 ? 'church' : 'churches'} whose narrative describes this style
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {matches.map(c => (
                        <a
                          key={c.id}
                          href={`#/church/${c.id}`}
                          className="group bg-white border border-gray-200 rounded-lg px-4 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <h3 className="font-heading text-sm font-semibold text-gray-900 group-hover:text-crimson transition-colors leading-snug">
                            {c.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 font-body">{c.parish}{c.town ? ` · ${c.town}` : ''}</p>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </article>
            )
          })}

          <p className="text-xs text-gray-400 italic font-body pt-6 border-t border-gray-200">
            Styles are inferred at build time by keyword-matching each church's narrative. A church may appear under more than one style; ruins are excluded.
          </p>
        </div>
      </section>
    </main>
  )
}
