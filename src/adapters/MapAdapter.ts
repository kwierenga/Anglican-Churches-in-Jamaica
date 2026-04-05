import type { FeatureCollection, Feature, Point } from 'geojson'

export type ChurchFeature = Feature<Point, {
  id: string; name: string; parish: string;
  classification: string; status: string;
}>

export interface MapAdapter {
  init(el: HTMLElement, opts?: { onSelectChurch?: (id: string)=>void }): void | Promise<void>
  plot(fc: FeatureCollection<Point, ChurchFeature['properties']>): void
  fitToAll(): void
  fitToParish(parish: string): void
  flyToChurch(id: string): void
  setFilter(fn: (p: ChurchFeature['properties']) => boolean): void
  setEditMode(enabled: boolean, onMove?: (lat: number, lng: number) => void): void
  destroy(): void
}
