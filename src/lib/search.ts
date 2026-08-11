import Fuse from 'fuse.js'
import type { ChurchRow } from './schemas'

let _data: ChurchRow[] = []
let _fuse: Fuse<ChurchRow> | null = null

export async function loadSearchIndex(){
  if(_fuse) return _fuse
  // `displayName` is included so a query that names both dedication and town
  // ("St. Paul's Chapelton") matches as one string, not just field-by-field.
  const keys = ['displayName', 'name', 'town']
  const res = await fetch(`${import.meta.env.BASE_URL}data/build/search-index.json`)
  if (!res.ok) return new Fuse<ChurchRow>([], { keys, threshold: 0.3 })
  _data = await res.json()
  _fuse = new Fuse(_data, { keys, threshold: 0.3 })
  return _fuse
}

export function getCatalog(){ return _data }
