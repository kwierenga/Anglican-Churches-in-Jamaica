import { useCallback, useSyncExternalStore } from 'react'

let _search = location.search

const store = {
  subscribe: (cb: ()=>void) => {
    const handler = () => { _search = location.search; cb() }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  },
  getSnapshot: () => _search
}

export function useQueryState(key: string, initial: string){
  const search = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const params = new URLSearchParams(search)
  const value = params.get(key) ?? initial
  const setValue = useCallback((v: string)=>{
    const p = new URLSearchParams(location.search)
    if(v===''||v==null) p.delete(key); else p.set(key, v)
    const qs = p.toString()
    // Preserve the hash when updating query params
    const hash = location.hash || ''
    history.pushState({},'', (qs ? `?${qs}` : location.pathname) + hash)
    _search = location.search
    window.dispatchEvent(new PopStateEvent('popstate'))
  },[key])
  return [value, setValue, params] as const
}
