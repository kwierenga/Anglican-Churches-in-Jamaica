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

// Empty CSV cells (or absent columns) become undefined rather than 0/'' so
// optional structured fields stay genuinely empty until filled in.
const emptyToUndef = (v: unknown) => (v === '' || v == null ? undefined : v)

export const ChurchRowSchema = z.object({
  id: z.string().min(1, 'id required'),
  name: z.string().min(1, 'name required'),
  parish: z.string().min(1, 'parish required'),
  classification: z.enum(['cathedral','parish_church','church','chapel','mission','ruin']),
  status: z.enum(['active','inactive','ruin']),
  lat: z.coerce.number().min(17, 'lat must be within Jamaica').max(19, 'lat must be within Jamaica'),
  lng: z.coerce.number().min(-79, 'lng must be within Jamaica').max(-75, 'lng must be within Jamaica'),
  town: z.string().default(''),
  // Optional structured metadata (#3) — real columns, surfaced in the church
  // page Key Facts panel. Absent today; fill in churches.csv over time.
  founding_year: z.preprocess(emptyToUndef, z.coerce.number().int().min(1500).max(2100).optional()),
  patron_saint: z.preprocess(emptyToUndef, z.string().optional()),
  heritage: z.preprocess(emptyToUndef, z.string().optional()),
  // Derived in build-data (not a CSV column); present in search-index.json.
  photos: z.coerce.number().int().nonnegative().optional(),
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
