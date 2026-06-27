import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useQueryState } from '../lib/state'
import { buildSrcSet, responsiveSrc } from '../lib/cloudinary'
import { contributeMailto } from '../lib/site'
import Button from './Button'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if(_mediaIndex) return _mediaIndex
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/media-index.json`)
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
}

interface Preview {
  name: string
  meta: string
  lead: string
}

// Pull a lightweight preview out of the full markdown: the title, the
// parish · classification · status line, and the first real paragraph.
// The full narrative is rendered only on the canonical church page.
function previewFromMarkdown(md: string): Preview {
  const blocks = md.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
  const name = (blocks.find(b => b.startsWith('# ')) ?? '').replace(/^#\s+/, '')
  const meta = (blocks.find(b => b.startsWith('**')) ?? '').replace(/\*\*/g, '')
  const lead = blocks.find(b => !b.startsWith('#') && !b.startsWith('**') && b.length > 40) ?? ''
  return { name, meta, lead }
}

export default function ChurchCard(){
  const [id] = useQueryState('id','')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [status, setStatus] = useState<'empty' | 'loading' | 'ready' | 'missing'>('empty')
  const [lightbox, setLightbox] = useState<MediaRow | null>(null)

  useEffect(()=>{
    if(!id){ setPreview(null); setMedia([]); setStatus('empty'); return }
    setStatus('loading')
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}content/churches/${id}.md`).then(r=> r.ok ? r.text() : ''),
      getMediaIndex()
    ]).then(([md, idx])=>{
      setMedia(idx[id]?.filter(m=>m.type==='image') ?? [])
      if (md) { setPreview(previewFromMarkdown(md)); setStatus('ready') }
      else { setPreview(null); setStatus('missing') }
    }).catch(()=>{
      setPreview(null); setStatus('missing')
    })
  },[id])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  if (status === 'empty') {
    return <p className="text-gray-500 font-body text-sm">Select a church to see its details. Use the search box or click the map.</p>
  }
  if (status === 'loading') {
    return <p className="text-gray-400 font-body text-sm">Loading…</p>
  }
  if (status === 'missing') {
    return <p className="text-gray-500 font-body text-sm">No page yet for this church.</p>
  }

  return (
    <article>
      {media.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
          {media.map((m, i) => (
            <figure key={i} className="shrink-0 m-0">
              <img
                src={responsiveSrc(m.url, 320, { height: 240, crop: 'fill' })}
                srcSet={buildSrcSet(m.url, { widths: [320, 480, 640, 800], height: 240, crop: 'fill' })}
                sizes="(max-width: 640px) 50vw, 320px"
                alt={m.caption}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={320}
                height={240}
                className="h-40 w-auto rounded object-cover cursor-zoom-in"
                onClick={() => setLightbox(m)}
              />
              {m.caption && <figcaption className="text-xs text-gray-500 mt-1 max-w-[12rem]">{m.caption}{m.credit ? ` — ${m.credit}` : ''}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <div className="mb-4 rounded border border-dashed border-gold/50 bg-ivory px-4 py-5 text-center">
          <div className="text-gold/70 text-2xl mb-1">&#10013;</div>
          <p className="font-body text-xs text-gray-500">
            No photograph yet.{' '}
            <a href={contributeMailto(preview?.name || 'this church', 'photo')}
               className="text-crimson underline underline-offset-2 hover:text-crimson-dark">
              Contribute one &rarr;
            </a>
          </p>
        </div>
      )}

      {preview?.name && (
        <h2 className="font-heading text-2xl font-bold text-crimson leading-tight">{preview.name}</h2>
      )}
      {preview?.meta && (
        <p className="text-xs font-semibold tracking-wider text-crimson-mid uppercase mt-1 mb-3">{preview.meta}</p>
      )}
      {preview?.lead && (
        <p
          className="font-body text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: marked.parseInline(preview.lead) as string }}
        />
      )}

      {id && (
        <Button href={`#/church/${id}`} variant="crimson" size="sm" className="mt-5">
          Read the full history &amp; map &rarr;
        </Button>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <figure className="max-w-full max-h-full flex flex-col items-center">
            <img
              src={responsiveSrc(lightbox.url, 2000)}
              srcSet={buildSrcSet(lightbox.url, { widths: [1200, 1600, 2000, 2600] })}
              sizes="100vw"
              alt={lightbox.caption}
              decoding="async"
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
