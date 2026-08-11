import { useSyncExternalStore } from 'react'

/**
 * History-based router (real URLs, crawlable + shareable).
 *
 * Routes are pathnames relative to the Vite base, normalised WITHOUT a
 * trailing slash: '/', '/churches', '/church/:id', '/parish/:slug', etc.
 * Links keep real <a href> values (via `to()`) so search engines and social
 * scrapers see genuine URLs; a delegated click handler turns same-site clicks
 * into pushState navigations instead of full page loads.
 */

export const BASE = import.meta.env.BASE_URL // e.g. '/Anglican-Churches-in-Jamaica/'
const BASE_NOSLASH = BASE.replace(/\/$/, '')

/** Build a real href from a logical path: to('/church/x') -> '<base>/church/x/'. */
export function to(path: string): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  return clean ? `${BASE}${clean}/` : BASE
}

function currentRoute(): string {
  let p = decodeURI(location.pathname)
  if (p.startsWith(BASE)) p = '/' + p.slice(BASE.length)
  else if (p === BASE_NOSLASH) p = '/'
  if (!p.startsWith('/')) p = '/' + p
  p = p.replace(/\/+$/, '')
  return p || '/'
}

let _route = currentRoute()
const listeners = new Set<() => void>()

function notify() {
  _route = currentRoute()
  listeners.forEach(cb => cb())
}

window.addEventListener('popstate', notify)

// Delegated click handler: intercept same-site navigations so internal links
// behave as SPA transitions while still rendering real, crawlable hrefs.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement | null)?.closest('a')
    if (!a) return
    const target = a.getAttribute('target')
    if (target && target !== '_self') return
    if (a.hasAttribute('download')) return
    const raw = a.getAttribute('href')
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return
    let url: URL
    try { url = new URL(a.href) } catch { return }
    if (url.origin !== location.origin) return
    if (!url.pathname.startsWith(BASE_NOSLASH)) return
    e.preventDefault()
    if (url.href !== location.href) {
      history.pushState({}, '', url.href)
      notify()
    }
  })
}

const store = {
  subscribe: (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
  getSnapshot: () => _route,
}

export function useRoute() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

/**
 * Programmatic navigation. Accepts a logical path ('/church/x') or full href.
 * `replace` swaps the current entry instead of pushing, so redirects (e.g.
 * the retired /sources -> /about) don't trap the back button.
 */
export function navigate(path: string, opts?: { replace?: boolean }) {
  const href = path.startsWith(BASE) || /^https?:/.test(path) ? path : to(path)
  if (href !== location.href) {
    if (opts?.replace) history.replaceState({}, '', href)
    else history.pushState({}, '', href)
    notify()
  }
}
