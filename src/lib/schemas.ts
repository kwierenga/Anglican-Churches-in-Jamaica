import { z } from 'zod'

export const validParishes = new Set([
  'Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann',
  'Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth',
  'Manchester','Clarendon','St. Catherine'
])

export const MediaRowSchema = z.object({
  church_id: z.string().min(1),
  type: z.enum(['image','video']),
  url: z.string().min(1),
  caption: z.string().default(''),
  credit: z.string().default(''),
  license: z.string().default(''),
  order: z.coerce.number().int().nonnegative().default(0)
})
export type MediaRow = z.infer<typeof MediaRowSchema>

export const ChurchRowSchema = z.object({
  id: z.string().min(1, 'id required'),
  name: z.string().min(1, 'name required'),
  parish: z.string().min(1, 'parish required'),
  classification: z.enum(['cathedral','parish_church','church','chapel','mission','ruin']),
  status: z.enum(['active','inactive','ruin']),
  lat: z.coerce.number().min(17, 'lat must be within Jamaica').max(19, 'lat must be within Jamaica'),
  lng: z.coerce.number().min(-79, 'lng must be within Jamaica').max(-75, 'lng must be within Jamaica'),
  town: z.string().default('')
})
export type ChurchRow = z.infer<typeof ChurchRowSchema>

export interface FeedItem {
  id: string
  date: string
  title: string
  summary: string
  report: string
  category: string
  parish: string | null
  source: string
  url: string
}
