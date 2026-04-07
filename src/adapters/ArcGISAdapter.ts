import type { MapAdapter, ChurchFeature } from './MapAdapter'
import type { FeatureCollection, Point } from 'geojson'
let __esri: any

export default class ArcGISAdapter implements MapAdapter {
  private view: any
  private layer: any
  private data!: FeatureCollection<Point, ChurchFeature['properties']>
  private onSelect?: (id: string)=>void

  async init(el: HTMLElement, opts?: { onSelectChurch?: (id: string)=>void }) {
    const apiKey = (import.meta as any).env?.VITE_ARCGIS_API_KEY
    if(!apiKey) throw new Error('Missing VITE_ARCGIS_API_KEY for ArcGIS adapter')

    this.onSelect = opts?.onSelectChurch
    if(!__esri){
      const [EsriMap, MapView, GeoJSONLayer, esriConfig] = await Promise.all([
        import('@arcgis/core/Map'),
        import('@arcgis/core/views/MapView'),
        import('@arcgis/core/layers/GeoJSONLayer'),
        import('@arcgis/core/config')
      ])
      __esri = {
        EsriMap: EsriMap.default, MapView: MapView.default,
        GeoJSONLayer: GeoJSONLayer.default, esriConfig: esriConfig.default
      }
    }
    __esri.esriConfig.apiKey = apiKey
    const map = new __esri.EsriMap({ basemap: 'satellite' })
    this.view = new __esri.MapView({ map, container: el, center: [-77.3,18.1], zoom: 8 })
  }

  plot(fc: FeatureCollection<Point, ChurchFeature['properties']>){
    this.data = fc
    if(this.layer){ this.view.map.remove(this.layer) }
    const blob = new Blob([JSON.stringify(fc)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    this.layer = new __esri.GeoJSONLayer({ url, popupEnabled: false })
    this.view.map.add(this.layer)
    this.fitToAll()
    this.layer.on('click', (e: any) => {
      const g = e?.graphic?.attributes
      if(g?.id) this.onSelect?.(String(g.id))
    })
  }
  fitToAll(){ this.view.goTo(this.layer.fullExtent, { duration: 400 }) }
  fitToParish(parish: string){
    // client extent from data
    const coords = this.data.features
      .filter(f=>f.properties!.parish.toLowerCase()===parish.toLowerCase())
      .map(f=>[f.geometry.coordinates[0], f.geometry.coordinates[1]])
    if(coords.length){
      const xs = coords.map(c=>c[0]), ys = coords.map(c=>c[1])
      const extent = { xmin: Math.min(...xs), ymin: Math.min(...ys), xmax: Math.max(...xs), ymax: Math.max(...ys), spatialReference: { wkid: 4326 } }
      this.view.goTo({ extent }, { duration: 400 })
    }
  }
  flyToChurch(id: string){
    const f = this.data.features.find(x=>x.properties!.id===id)
    if(!f) return
    this.view.goTo({ center: [f.geometry.coordinates[0], f.geometry.coordinates[1]], zoom: 16 }, { duration: 400 })
  }
  setFilter(fn: (p: ChurchFeature['properties']) => boolean){
    const filtered = { ...this.data, features: this.data.features.filter(f=>fn(f.properties!)) }
    this.plot(filtered as any)
  }
  setEditMode(_enabled: boolean, _onMove?: (lat: number, lng: number) => void) {
    // Edit mode not supported in ArcGIS adapter
  }
  destroy(){ this.view?.destroy() }
}
