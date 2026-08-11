import type { FeedItem } from './schemas'
import { PARISHES } from './parishes'
import { to } from './router'

/** Publisher home pages, for notices that never carried an article URL. */
const SOURCE_HOME: Record<string, string> = {
  'Anglican Diocese of Jamaica': 'https://www.anglicandioceseja.org/',
  'Anglican Communion News Service': 'https://www.anglicannews.org/',
  'Jamaica National Heritage Trust': 'http://www.jnht.com/',
  'Jamaica Gleaner': 'https://jamaica-gleaner.com/',
}

export interface FeedLink {
  href: string
  external: boolean
  /** Call to action shown on the card — describes where the link actually goes. */
  label: string
}

/**
 * Resolve a destination for a feed item. Scraped items carry the article URL;
 * hand-entered diocesan notices often don't, and a card that can't be opened is
 * a dead end — so those fall back to the parish page they concern, and failing
 * that to the publisher's own site. The label always names the real destination
 * rather than implying an article that isn't there.
 */
export function feedLink(item: FeedItem): FeedLink | null {
  if (item.url) return { href: item.url, external: true, label: 'Read full article' }

  const parish = item.parish ? PARISHES.find(p => p.name === item.parish) : undefined
  if (parish) return { href: to(`/parish/${parish.slug}`), external: false, label: `Churches in ${parish.name}` }

  const home = SOURCE_HOME[item.source]
  if (home) return { href: home, external: true, label: `More from ${item.source}` }

  return null
}
