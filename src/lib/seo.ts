const DEFAULTS = {
  title: 'Anglican Churches in Jamaica',
  description: 'Explore Anglican churches across Jamaica — maps, histories, photos, and heritage information for cathedrals, churches, chapels, and ruins.',
  image: 'https://res.cloudinary.com/kwierenga/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/v1774647565/spanish-town-1_fdfjqi.jpg',
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export interface SeoInput {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export function setSeo(input: SeoInput = {}) {
  const title = input.title ? `${input.title} — Anglican Churches in Jamaica` : DEFAULTS.title
  const description = input.description || DEFAULTS.description
  const image = input.image || DEFAULTS.image
  const url = input.url || location.href
  const type = input.type || 'website'

  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:image', image)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:type', type)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', image)
  upsertLink('canonical', url)
}

export function resetSeo() {
  setSeo()
}
