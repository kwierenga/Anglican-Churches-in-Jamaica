/* Anglican Churches in Jamaica — offline service worker.
 *
 * Field use: browse churches/areas while online, then the data, narratives,
 * images and map tiles you've seen keep working offline (patchy rural signal).
 * - HTML navigations: network-first (so new deploys win), cache fallback.
 * - Hashed build assets + cross-origin images/tiles: cache-first (immutable).
 * - Same-origin data/content JSON + markdown: stale-while-revalidate.
 * Core indices are precached on install so the directory map works offline
 * right after the first visit.
 */
const VERSION = 'acj-v1'
const CACHE = VERSION

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const scope = self.registration.scope // ends with '/'
    const core = [
      scope,
      scope + 'data/build/search-index.json',
      scope + 'data/build/churches.geo.json',
      scope + 'data/build/media-index.json',
      scope + 'manifest.webmanifest',
    ]
    await Promise.allSettled(core.map(u => cache.add(u)))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

function isCacheable(url) {
  if (url.origin === self.location.origin) return true
  return /res\.cloudinary\.com$/.test(url.hostname)
      || /arcgisonline\.com$/.test(url.hostname)
      || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(req)
  if (hit) return hit
  try {
    const res = await fetch(req)
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone())
    return res
  } catch {
    return hit || Response.error()
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(req)
  const fetching = fetch(req)
    .then(res => { if (res.ok) cache.put(req, res.clone()); return res })
    .catch(() => null)
  return hit || (await fetching) || Response.error()
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE)
  try {
    const res = await fetch(req)
    if (res.ok) cache.put(req, res.clone())
    return res
  } catch {
    return (await cache.match(req))
      || (await cache.match(self.registration.scope))
      || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  if (req.mode === 'navigate') { event.respondWith(networkFirst(req)); return }
  if (!isCacheable(url)) return

  const sameOrigin = url.origin === self.location.origin
  const isAsset = sameOrigin && url.pathname.includes('/assets/')
  if (sameOrigin && !isAsset) {
    event.respondWith(staleWhileRevalidate(req))   // data / content / markdown
  } else {
    event.respondWith(cacheFirst(req))             // hashed assets, images, tiles, fonts
  }
})
