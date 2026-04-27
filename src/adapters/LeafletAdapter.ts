// src/adapters/LeafletAdapter.ts
import L from 'leaflet'
// leaflet.css is imported in main.tsx AFTER tailwind.css to ensure correct cascade
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

/** Predefined parish centers and zoom levels (tuned for Leaflet) */
const PARISH_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'kingston':      { lat: 17.9714, lng: -76.7931, zoom: 13 },
  'st. andrew':    { lat: 18.0300, lng: -76.7500, zoom: 11 },
  'st. catherine': { lat: 18.0200, lng: -77.0800, zoom: 10 },
  'clarendon':     { lat: 18.0000, lng: -77.3000, zoom: 10 },
  'manchester':    { lat: 18.0600, lng: -77.5000, zoom: 11 },
  'st. elizabeth': { lat: 18.0500, lng: -77.7800, zoom: 10 },
  'westmoreland':  { lat: 18.2500, lng: -78.1000, zoom: 11 },
  'hanover':       { lat: 18.4200, lng: -78.1500, zoom: 11 },
  'st. james':     { lat: 18.4700, lng: -77.9200, zoom: 11 },
  'trelawny':      { lat: 18.3500, lng: -77.6200, zoom: 10 },
  'st. ann':       { lat: 18.3500, lng: -77.2000, zoom: 10 },
  'st. mary':      { lat: 18.3000, lng: -76.9000, zoom: 11 },
  'portland':      { lat: 18.1500, lng: -76.4500, zoom: 10 },
  'st. thomas':    { lat: 17.9500, lng: -76.3500, zoom: 11 },
}

/** Marker style based on classification */
function markerStyle(props: ChurchFeature['properties']): L.CircleMarkerOptions {
  const color = PARISH_COLORS[props.parish.toLowerCase()] ?? '#888'
  const isParishChurch = props.classification === 'parish_church'
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

export default class LeafletAdapter implements MapAdapter {
  private map!: L.Map
  private markerLayer!: L.LayerGroup
  private fullData!: FeatureCollection<Point, ChurchFeature['properties']>
  private data!: FeatureCollection<Point, ChurchFeature['properties']>
  private highlight?: L.CircleMarker
  private editHandler?: (e: L.LeafletMouseEvent) => void
  private resizeObserver?: ResizeObserver
  private onSelect?: (id: string)=>void
  private topo!: L.TileLayer
  private satellite!: L.TileLayer

  init(el: HTMLElement, opts?: { onSelectChurch?: (id: string)=>void }) {
    this.onSelect = opts?.onSelectChurch
    this.map = L.map(el, { attributionControl: true }).setView([18.1,-77.3], 8)

    // Keep Leaflet in sync if the container resizes (e.g. ChurchCard appearing)
    this.resizeObserver = new ResizeObserver(() => this.map.invalidateSize())
    this.resizeObserver.observe(el)

    // Create tile layers per instance (not module-level singletons)
    this.topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri',
    })
    this.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri',
    })
    const satLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      opacity: 0.9,
    })

    this.topo.addTo(this.map)

    // Layer toggle control
    L.control.layers(
      { 'Terrain': this.topo, 'Satellite': this.satellite },
      { 'Labels': satLabels },
      { position: 'topright', collapsed: false }
    ).addTo(this.map)
  }

  private buildMarkers(fc: FeatureCollection<Point, ChurchFeature['properties']>) {
    const markers: L.CircleMarker[] = []
    for (const f of fc.features) {
      const [lng, lat] = f.geometry.coordinates
      const p = f.properties!
      const marker = L.circleMarker([lat, lng], markerStyle(p))
      const label = p.name + (p.classification === 'ruin' ? ' (ruin)' : '')
      marker.on('click', () => this.onSelect?.(p.id))
      marker.bindTooltip(label)
      markers.push(marker)
    }
    return markers
  }

  plot(fc: FeatureCollection<Point, ChurchFeature['properties']>) {
    if (!this.fullData) this.fullData = fc
    this.data = fc
    if (this.markerLayer) {
      this.markerLayer.clearLayers()
    } else {
      this.markerLayer = L.layerGroup().addTo(this.map)
    }
    for (const m of this.buildMarkers(fc)) m.addTo(this.markerLayer)
    this.fitToAll()
  }

  private clearHighlight() {
    if (this.highlight) { this.highlight.remove(); this.highlight = undefined }
  }

  private switchToTerrain() {
    if (this.satellite && this.map.hasLayer(this.satellite)) {
      this.map.removeLayer(this.satellite)
      this.topo.addTo(this.map)
    }
  }

  private dataBounds(): L.LatLngBounds | null {
    if (!this.data?.features.length) return null
    const pts: L.LatLngExpression[] = this.data.features.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
    return L.latLngBounds(pts)
  }

  fitToAll(){
    this.clearHighlight()
    this.switchToTerrain()
    const b = this.dataBounds()
    if (b) this.map.fitBounds(b, { padding:[20,20] })
  }

  fitToParish(parish: string){
    this.clearHighlight()
    this.switchToTerrain()
    const key = parish.toLowerCase()
    const center = PARISH_CENTERS[key]
    if (center) {
      this.map.setView([center.lat, center.lng], center.zoom)
    } else {
      // Fallback: fit to church bounds
      const pts: L.LatLngExpression[] = []
      this.fullData.features.forEach(f => {
        if(f.properties!.parish.toLowerCase() === key)
          pts.push([f.geometry.coordinates[1], f.geometry.coordinates[0]])
      })
      if(pts.length) this.map.fitBounds(L.latLngBounds(pts), { padding:[20,20] })
    }
  }

  flyToChurch(id: string){
    const f = this.fullData.features.find(x=>x.properties!.id===id)
    if(!f) return
    const latlng: L.LatLngExpression = [f.geometry.coordinates[1], f.geometry.coordinates[0]]

    // Remove previous highlight
    this.clearHighlight()

    // Add pulsing highlight ring
    this.highlight = L.circleMarker(latlng, {
      radius: 14,
      fillColor: '#D4A017',
      color: '#8B0000',
      weight: 3,
      fillOpacity: 0.4,
    }).addTo(this.map)
    this.highlight.bindTooltip(f.properties!.name, { permanent: true, direction: 'top', offset: [0, -16] })

    this.map.flyTo(latlng, 18, { duration: 0.8, easeLinearity: 0.4 })
    if (this.topo && this.satellite) {
      this.map.removeLayer(this.topo)
      this.satellite.addTo(this.map)
    }
  }

  setFilter(fn: (p: ChurchFeature['properties']) => boolean){
    // Don't clear highlight — filter changes shouldn't deselect a church
    const filtered = { ...this.fullData, features: this.fullData.features.filter(f=>fn(f.properties!)) }
    this.data = filtered
    if (this.markerLayer) {
      this.markerLayer.clearLayers()
    } else {
      this.markerLayer = L.layerGroup().addTo(this.map)
    }
    for (const m of this.buildMarkers(filtered)) m.addTo(this.markerLayer)
    const b = this.dataBounds()
    if (b) this.map.fitBounds(b, { padding:[20,20] })
  }

  setEditMode(enabled: boolean, onMove?: (lat: number, lng: number) => void) {
    // Remove previous handler
    if (this.editHandler) {
      this.map.off('click', this.editHandler)
      this.editHandler = undefined
    }
    if (this.map.getContainer()) {
      this.map.getContainer().style.cursor = enabled ? 'crosshair' : ''
    }
    if (!enabled || !onMove) return

    this.editHandler = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      // Move highlight to clicked location
      this.clearHighlight()
      this.highlight = L.circleMarker([lat, lng], {
        radius: 14,
        fillColor: '#D4A017',
        color: '#8B0000',
        weight: 3,
        fillOpacity: 0.4,
      }).addTo(this.map)
      this.highlight.bindTooltip(
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        { permanent: true, direction: 'top', offset: [0, -16] }
      )
      onMove(lat, lng)
    }
    this.map.on('click', this.editHandler)
  }

  destroy(){
    this.resizeObserver?.disconnect()
    this.map?.remove()
  }
}
