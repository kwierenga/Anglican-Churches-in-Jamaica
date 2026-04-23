import { useEffect, useMemo, useState } from 'react'
import { useRoute } from '../lib/router'
import { setSeo } from '../lib/seo'
import { responsiveSrc } from '../lib/cloudinary'
import { getCatalog, loadSearchIndex } from '../lib/search'
import { PARISH_BY_SLUG, type ParishInfo } from '../lib/parishes'
import type { ChurchRow } from '../lib/schemas'

const CLOUDINARY_BASE = 'https://res.cloudinary.com/kwierenga/image/upload'

const CLASSIFICATION_LABEL: Record<ChurchRow['classification'], string> = {
  cathedral: 'Cathedral',
  parish_church: 'Parish Church',
  church: 'Church',
  chapel: 'Chapel',
  mission: 'Mission',
  ruin: 'Ruin',
}

const CLASSIFICATION_ORDER: Record<ChurchRow['classification'], number> = {
  cathedral: 0,
  parish_church: 1,
  church: 2,
  chapel: 3,
  mission: 4,
  ruin: 5,
}

export default function ParishPage() {
  const route = useRoute()
  const slug = route.replace('#/parish/', '').replace(/[?#].*$/, '')
  const info: ParishInfo | undefined = PARISH_BY_SLUG.get(slug)

  const [catalog, setCatalog] = useState<ChurchRow[]>(getCatalog())
  useEffect(() => {
    loadSearchIndex().then(() => setCatalog(getCatalog()))
  }, [])

  const churches = useMemo(() => {
    if (!info) return []
    return catalog
      .filter(c => c.parish === info.name)
      .sort((a, b) => {
        const ca = CLASSIFICATION_ORDER[a.classification] ?? 9
        const cb = CLASSIFICATION_ORDER[b.classification] ?? 9
        if (ca !== cb) return ca - cb
        return a.name.localeCompare(b.name)
      })
  }, [catalog, info])

  useEffect(() => {
    if (!info) return
    setSeo({
      title: `${info.name} parish`,
      description: info.blurb,
      image: `${CLOUDINARY_BASE}/w_1200,h_630,c_fill,f_auto,q_auto/${info.heroImage}.jpg`,
      type: 'article',
    })
  }, [info])

  if (!info) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl font-bold text-crimson mb-4">Parish not found</h1>
        <p className="text-gray-600 font-body">
          <a href="#/churches" className="text-crimson hover:underline">Browse the church directory &rarr;</a>
        </p>
      </main>
    )
  }

  const heroUrl = `${CLOUDINARY_BASE}/${info.heroImage}.jpg`
  const active = churches.filter(c => c.status === 'active')
  const ruins = churches.filter(c => c.classification === 'ruin' || c.status === 'ruin')
  const inactive = churches.filter(c => c.status === 'inactive' && c.classification !== 'ruin')

  return (
    <main>
      <section
        className="relative min-h-[45vh] flex items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: `url('${responsiveSrc(heroUrl, 1600, { extra: 'e_blur:200' })}')` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(140deg, rgba(107,0,0,0.80) 0%, rgba(58,26,46,0.75) 45%, rgba(30,45,78,0.80) 100%)' }}
        />
        <div className="relative z-10 px-4 max-w-3xl py-10">
          <p className="text-gold-bright text-xs font-semibold tracking-[0.2em] uppercase mb-2">{info.region}</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {info.name}
          </h1>
          <hr className="w-16 h-[3px] bg-gold-bright border-0 mx-auto my-4" />
          <p className="font-body text-lg text-white/90 leading-relaxed">
            {info.blurb}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <a
              href={`#/churches?parish=${encodeURIComponent(info.name)}`}
              className="inline-block bg-gold-bright hover:bg-gold text-white font-heading font-semibold px-5 py-2 rounded transition-colors"
            >
              View on map &rarr;
            </a>
            <span className="inline-flex items-center text-white/80 font-body">
              {churches.length} Anglican {churches.length === 1 ? 'church' : 'churches'}
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-ivory">
        <div className="max-w-site mx-auto px-4">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">Browse</p>
          <h2 className="font-heading text-2xl font-bold text-crimson mb-6">
            Churches in {info.name}
            <span className="block w-16 h-[3px] bg-gold mt-3" />
          </h2>

          {churches.length === 0 && (
            <p className="text-gray-500 font-body">No churches indexed for this parish yet.</p>
          )}

          {active.length > 0 && <ChurchGroup title="Active" churches={active} />}
          {inactive.length > 0 && <ChurchGroup title="Inactive" churches={inactive} />}
          {ruins.length > 0 && <ChurchGroup title="Ruins & remnants" churches={ruins} />}
        </div>
      </section>
    </main>
  )
}

function ChurchGroup({ title, churches }: { title: string; churches: ChurchRow[] }) {
  return (
    <div className="mb-10">
      <h3 className="font-heading text-lg font-semibold text-gray-700 mb-4">{title} <span className="text-gray-400 font-normal">· {churches.length}</span></h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {churches.map(c => (
          <a
            key={c.id}
            href={`#/church/${c.id}`}
            className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-heading text-base font-semibold text-gray-900 group-hover:text-crimson transition-colors leading-tight">
                {c.name}
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-crimson/10 text-crimson whitespace-nowrap">
                {CLASSIFICATION_LABEL[c.classification]}
              </span>
            </div>
            {c.town && <p className="text-sm text-gray-500 mt-1 font-body">{c.town}</p>}
          </a>
        ))}
      </div>
    </div>
  )
}

