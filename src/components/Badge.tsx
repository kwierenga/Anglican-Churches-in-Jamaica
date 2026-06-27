import type { ReactNode } from 'react'

export type BadgeTone = 'active' | 'inactive' | 'ruin' | 'classification' | 'gold' | 'navy'

// Thematic palette only — crimson / gold / navy / parchment family, no off-theme red & green.
const TONES: Record<BadgeTone, string> = {
  active: 'bg-gold/15 text-[#7a5c00] border border-gold/40',
  inactive: 'bg-navy/10 text-navy/70 border border-navy/20',
  ruin: 'bg-crimson/10 text-crimson border border-crimson/30',
  classification: 'bg-crimson/10 text-crimson',
  gold: 'bg-gold text-white',
  navy: 'bg-navy text-white',
}

/** Map a church status string to its thematic badge tone. */
export function statusTone(status: string): BadgeTone {
  if (status === 'active') return 'active'
  if (status === 'ruin') return 'ruin'
  return 'inactive'
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
