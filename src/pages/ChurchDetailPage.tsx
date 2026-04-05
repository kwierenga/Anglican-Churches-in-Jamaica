import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useRoute } from '../lib/router'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if (_mediaIndex) return _mediaIndex
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
}

export default function ChurchDetailPage() {
  const route = useRoute()
  const slug = route.replace('#/church/', '')
  const [html, setHtml] = useState('')
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}content/churches/${slug}.md`).then(r => r.ok ? r.text() : ''),
      getMediaIndex(),
    ]).then(([md, idx]) => {
      setHtml(md ? (marked.parse(md) as string) : '<p>Church not found.</p>')
      setMedia(idx[slug]?.filter(m => m.type === 'image') ?? [])
      setLoading(false)
    })
  }, [slug])

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a href="#/churches" className="text-crimson hover:text-crimson-dark font-body text-sm mb-6 inline-block">
        &larr; Back to Directory
      </a>

      {loading ? (
        <p className="text-gray-400 font-body">Loading...</p>
      ) : (
        <>
          {media.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
              {media.map((m, i) => (
                <figure key={i} className="shrink-0 m-0">
                  <img src={m.url} alt={m.caption} className="h-48 w-auto rounded-lg object-cover" />
                  {m.caption && (
                    <figcaption className="text-xs text-gray-500 mt-1 max-w-[14rem]">
                      {m.caption}{m.credit ? ` \u2014 ${m.credit}` : ''}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
          <article
            className="prose prose-lg max-w-none
                       prose-headings:font-heading prose-headings:text-crimson
                       prose-p:font-body prose-p:text-gray-700
                       prose-a:text-crimson"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
      )}
    </main>
  )
}
