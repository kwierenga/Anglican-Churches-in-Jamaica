import { useEffect, useMemo, useState } from 'react'
import { responsiveSrc } from '../lib/cloudinary'
import { PARISHES, parishColor } from '../lib/parishes'
import { getCatalog, loadSearchIndex } from '../lib/search'
import { to } from '../lib/router'
import type { ChurchRow } from '../lib/schemas'

const CLOUDINARY_BASE = 'https://res.cloudinary.com/kwierenga/image/upload'

export default function ParishesIndex() {
  const [catalog, setCatalog] = useState<ChurchRow[]>(getCatalog())
  useEffect(() => {
    loadSearchIndex().then(() => setCatalog(getCatalog()))
  }, [])

  const countByParish = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of catalog) m.set(c.parish, (m.get(c.parish) ?? 0) + 1)
    return m
  }, [catalog])

  return (
    <main>
      <section className="bg-navy text-center py-14 px-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold-bright uppercase mb-2">Explore</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">The Fourteen Parishes</h1>
        <hr className="w-16 h-[3px] bg-gold-bright border-0 mx-auto my-4" />
        <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
          Jamaica&rsquo;s civil parishes are the framework of Anglican life on the island &mdash; each with its
          own parish church, history, and cluster of chapels and missions.
        </p>
      </section>

      <section className="py-12">
        <div className="max-w-site mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PARISHES.map(p => {
              const count = countByParish.get(p.name) ?? 0
              return (
                <a
                  key={p.slug}
                  href={to(`/parish/${p.slug}`)}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  {/* The parish's map colour, carried off the map so a parish
                      looks the same wherever you meet it. */}
                  <div className="h-1.5" style={{ backgroundColor: parishColor(p.name) }} />
                  <div className="relative h-40">
                    <img
                      src={responsiveSrc(`${CLOUDINARY_BASE}/${p.heroImage}.jpg`, 600, { height: 320, crop: 'fill' })}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-gold-bright text-[11px] font-semibold tracking-[0.15em] uppercase">{p.region}</p>
                      <h2 className="font-heading text-2xl font-bold text-white leading-tight group-hover:text-gold-bright transition-colors">
                        {p.name}
                      </h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-body text-sm text-gray-600 leading-relaxed line-clamp-3">{p.blurb}</p>
                    <p className="text-xs text-crimson-mid font-semibold mt-3">
                      {count > 0 ? `${count} ${count === 1 ? 'church' : 'churches'} →` : 'Explore →'}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
