import { useSyncExternalStore, useCallback } from 'react'

/** Simple hash-based router: #/ #/churches #/map #/church/slug #/about #/news etc. */

let _hash = location.hash || '#/'

const store = {
  subscribe: (cb: () => void) => {
    const handler = () => { _hash = location.hash || '#/'; cb() }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  },
  getSnapshot: () => _hash,
}

export function useRoute() {
  const hash = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return hash
}

export function navigate(path: string) {
  location.hash = path
}

export function useNavigate() {
  return useCallback((path: string) => { location.hash = path }, [])
}
