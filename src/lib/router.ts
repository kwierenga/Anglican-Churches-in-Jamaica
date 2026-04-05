import { useSyncExternalStore, useCallback } from 'react'

/** Simple hash-based router: #/ #/churches #/map #/church/slug #/about #/news etc. */

let _hash = location.hash || '#/'

const listeners = new Set<() => void>()

function notify() {
  _hash = location.hash || '#/'
  listeners.forEach(cb => cb())
}

window.addEventListener('hashchange', notify)
window.addEventListener('popstate', notify)

const store = {
  subscribe: (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
  getSnapshot: () => _hash,
}

export function useRoute() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

export function navigate(path: string) {
  // Support paths like '#/churches?parish=Kingston' by splitting hash and query
  const qIdx = path.indexOf('?')
  if (qIdx >= 0) {
    const hash = path.slice(0, qIdx)
    const query = path.slice(qIdx)
    // Set query params in location.search, route in location.hash
    history.pushState({}, '', query + hash)
    // Manually fire events since pushState doesn't trigger hashchange/popstate
    _hash = hash || '#/'
    window.dispatchEvent(new PopStateEvent('popstate'))
  } else {
    location.hash = path
  }
}

export function useNavigate() {
  return useCallback((path: string) => navigate(path), [])
}
