// src/adapters/LeafletAdapter.ts
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapAdapter, ChurchFeature } from './MapAdapter'
import type { FeatureCollection, Point } from 'geojson'

/** Parish color palette from the original site's map.js */
const PARISH_COLORS: Record<string, string> = {
  'kingston':      '#C0392B',
  'st. andrew':    '#2471A3',
  'st. catherine': '#1E8449',
  'clarendon':     '#7D3C98',
  'manchester':    '#D35400',
  'st. elizabeth': '#1ABC9C',
  'westmoreland':  '#E74C3C',
  'hanover':       '#3498DB',
  'st. james':     '#27AE60',
  'trelawny':      '#8E44AD',
  'st. ann':       '#F39C12',
  'st. mary':      '#16A085',
  'portland':      '#2C3E50',
  'st. thomas':    '#D4AC0D',
}

/** Marker style based on classification */
function markerStyle(props: ChurchFeature['properties']): L.CircleMarkerOptions {
  const color = PARISH_COLORS[props.parish.toLowerCase()] ?? '#888'
  const isParishChurch = props.name.toLowerCase().includes('parish church')
  const isRuin = props.classification === 'ruin' || props.status === 'ruin'
  const isCathedral = props.classification === 'cathedral'

  if (isCathedral) {
    return {
      radius: 10,
      fillColor: '#D4A017',
      color: '#8B0000',
      weight: 3,
      fillOpacity: 1,
    }
  }

  if (isParishChurch) {
    return {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2.5,
      fillOpacity: 0.95,
    }
  }

  if (isRuin) {
    return {
      radius: 5,
      fillColor: color,
      color: '#fff',
      weight: 1,
      fillOpacity: 0.4,
      dashArray: '3 3',
    }
  }

  // Default: church, chapel, mission
  return {
    radius: 5,
    fillColor: color,
    color: '#fff',
    weight: 1.5,
    fillOpacity: 0.85,
  }
}

const TOPO = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  attribution: 'Tiles &copy; Esri',
})

const SATELLITE = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  attribution: 'Tiles &copy; Esri',
})

const SAT_LABELS = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  opacity: 0.9,
})

export default class LeafletAdapter implements MapAdapter {
  private map!: L.Map
  private layer!: L.GeoJSON
  private fullData!: FeatureCollection<Point, ChurchFeature['properties']>
  private data!: FeatureCollection<Point, ChurchFeature['properties']>
  private onSelect?: (id: string)=>void

  init(el: HTMLElement, opts?: { onSelectChurch?: (id: string)=>void }) {
    this.onSelect = opts?.onSelectChurch
    this.map = L.map(el, { attributionControl: true }).setView([18.1,-77.3], 8)

    // Default to topo
    TOPO.addTo(this.map)

    // Layer toggle control
    L.control.layers(
      { 'Terrain': TOPO, 'Satellite': SATELLITE },
      { 'Labels': SAT_LABELS },
      { position: 'topright', collapsed: false }
    ).addTo(this.map)
  }

  plot(fc: FeatureCollection<Point, ChurchFeature['properties']>) {
    if (!this.fullData) this.fullData = fc
    this.data = fc
    if(this.layer) this.layer.remove()
    this.layer = L.geoJSON(fc, {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, markerStyle(f.properties!)),
      onEachFeature: (f, layer) => {
        const p = f.properties!
        const label = p.name + (p.classification === 'ruin' ? ' (ruin)' : '')
        layer.on('click', () => this.onSelect?.(p.id))
        layer.bindTooltip(label)
      }
    }).addTo(this.map)
    this.fitToAll()
  }

  fitToAll(){ if(!this.layer) return; this.map.fitBounds(this.layer.getBounds(), { padding:[20,20] }) }

  fitToParish(parish: string){
    const pts: L.LatLngExpression[] = []
    this.fullData.features.forEach(f => {
      if(f.properties!.parish.toLowerCase()===parish.toLowerCase())
        pts.push([f.geometry.coordinates[1], f.geometry.coordinates[0]])
    })
    if(pts.length) this.map.fitBounds(L.latLngBounds(pts), { padding:[20,20] })
  }

  flyToChurch(id: string){
    const f = this.fullData.features.find(x=>x.properties!.id===id)
    if(!f) return
    this.map.flyTo([f.geometry.coordinates[1], f.geometry.coordinates[0]], 16)
  }

  setFilter(fn: (p: ChurchFeature['properties']) => boolean){
    const filtered = { ...this.fullData, features: this.fullData.features.filter(f=>fn(f.properties!)) }
    this.data = filtered
    if(this.layer) this.layer.remove()
    this.layer = L.geoJSON(filtered, {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, markerStyle(f.properties!)),
      onEachFeature: (f, layer) => {
        const p = f.properties!
        const label = p.name + (p.classification === 'ruin' ? ' (ruin)' : '')
        layer.on('click', () => this.onSelect?.(p.id))
        layer.bindTooltip(label)
      }
    }).addTo(this.map)
    this.fitToAll()
  }

  destroy(){ this.map?.remove() }
}
