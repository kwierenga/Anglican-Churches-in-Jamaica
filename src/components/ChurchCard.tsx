import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useQueryState } from '../lib/state'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if(_mediaIndex) return _mediaIndex
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
}

export default function ChurchCard(){
  const [id] = useQueryState('id','')
  const [html, setHtml] = useState<string>('Select a church to see its details. Use the search box or click the map.')
  const [media, setMedia] = useState<MediaRow[]>([])
  const [lightbox, setLightbox] = useState<MediaRow | null>(null)

  useEffect(()=>{
    if(!id){ setHtml('Select a church to see its details.'); setMedia([]); return }
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}content/churches/${id}.md`).then(r=> r.ok ? r.text() : ''),
      getMediaIndex()
    ]).then(([md, idx])=>{
      setHtml(md ? (marked.parse(md) as string) : 'No page yet.')
      setMedia(idx[id]?.filter(m=>m.type==='image') ?? [])
    }).catch(()=>{
      setHtml('Failed to load church details.')
    })
  },[id])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const images = media
  return (
    <article className="prose max-w-none">
      {images.length > 0 && (
        <div className="not-prose flex gap-3 overflow-x-auto pb-2 mb-4">
          {images.map((m, i) => (
            <figure key={i} className="shrink-0 m-0">
              <img
                src={m.url}
                alt={m.caption}
                className="h-40 w-auto rounded object-cover cursor-zoom-in"
                onClick={() => setLightbox(m)}
              />
              {m.caption && <figcaption className="text-xs text-gray-500 mt-1 max-w-[12rem]">{m.caption}{m.credit ? ` — ${m.credit}` : ''}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{__html: html}} />

      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <figure className="max-w-full max-h-full flex flex-col items-center">
            <img
              src={lightbox.url}
              alt={lightbox.caption}
              className="max-w-full max-h-[90vh] object-contain rounded"
            />
            {lightbox.caption && (
              <figcaption className="text-sm text-gray-200 mt-3 text-center font-body">
                {lightbox.caption}{lightbox.credit ? ` — ${lightbox.credit}` : ''}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </article>
  )
}
