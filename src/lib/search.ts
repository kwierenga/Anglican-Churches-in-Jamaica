import Fuse from 'fuse.js'

let _data: any[] = []
let _fuse: Fuse<any> | null = null

export async function loadSearchIndex(){
  if(_fuse) return _fuse
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/search-index.json`)
  _data = await res.json()
  _fuse = new Fuse(_data, { keys: ['name', 'town'], threshold: 0.3 })
  return _fuse
}

export function getCatalog(){ return _data }
