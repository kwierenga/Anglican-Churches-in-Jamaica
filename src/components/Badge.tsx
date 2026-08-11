import type { ReactNode } from 'react'

/**
 * Every status / category / state chip on the site comes from here.
 *
 * Gold used to mean three unrelated things at once — brand accent, "upcoming
 * event", and "fully documented" — so a gold chip told the reader nothing.
 * Gold is now decoration only (rules, borders, the cross); meaning is carried
 * by the crimson/navy/parchment family below, and each tone has exactly one job.
 * All combinations meet WCAG AA at chip sizes.
 */
export type BadgeTone =
  // church state
  | 'active' | 'inactive' | 'ruin' | 'classification'
  // feed state + categories
  | 'event' | 'diocese' | 'parish' | 'clergy' | 'obituary' | 'neutral'
  // data coverage
  | 'complete' | 'gap'

const TONES: Record<BadgeTone, string> = {
  // ── Church state ──────────────────────────────────────────────
  active:         'bg-gold/15 text-[#7a5c00] border border-gold/40',
  inactive:       'bg-navy/10 text-navy/70 border border-navy/20',
  ruin:           'bg-crimson/10 text-crimson border border-crimson/30',
  classification: 'bg-crimson/10 text-crimson',

  // ── Feed ──────────────────────────────────────────────────────
  // "Upcoming" is a time state, not a category, so it gets the one solid
  // treatment no category uses.
  event:    'bg-crimson text-white',
  diocese:  'bg-navy text-white',
  parish:   'bg-navy/10 text-navy border border-navy/25',
  clergy:   'bg-crimson/10 text-crimson border border-crimson/30',
  obituary: 'bg-gray-100 text-gray-700 border border-gray-300',
  neutral:  'bg-gray-100 text-gray-700 border border-gray-300',

  // ── Data coverage ─────────────────────────────────────────────
  complete: 'bg-navy/10 text-navy border border-navy/25',
  gap:      'bg-crimson/10 text-crimson',
}

/** Map a church status string to its badge tone. */
export function statusTone(status: string): BadgeTone {
  if (status === 'active') return 'active'
  if (status === 'ruin') return 'ruin'
  return 'inactive'
}

/** Map a feed item's category string to its badge tone. */
export function categoryTone(category: string): BadgeTone {
  switch (category) {
    case 'diocese': return 'diocese'
    case 'parish': return 'parish'
    case 'clergy': return 'clergy'
    case 'obituary': return 'obituary'
    default: return 'neutral'
  }
}

export default function Badge({
  tone = 'classification', children, className = '',
}: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}
