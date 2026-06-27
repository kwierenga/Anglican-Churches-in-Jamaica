import type { ReactNode } from 'react'

type Variant = 'primary' | 'crimson' | 'outline' | 'outlineGold' | 'outlineLight' | 'link' | 'linkLight'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: Variant
  size?: Size
  className?: string
  type?: 'button' | 'submit'
  target?: string
  rel?: string
  ariaLabel?: string
}

const BASE = 'inline-flex items-center justify-center gap-1 font-heading font-semibold rounded transition-colors'

const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'px-5 py-2.5',
  lg: 'text-lg px-8 py-3',
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gold-bright hover:bg-gold text-white',
  crimson: 'bg-crimson hover:bg-crimson-dark text-white',
  outline: 'border-2 border-crimson text-crimson hover:bg-crimson hover:text-white',
  outlineGold: 'border-2 border-gold text-gold hover:bg-gold hover:text-white',
  outlineLight: 'border-2 border-white/70 text-white hover:bg-white hover:text-crimson',
  link: 'text-crimson hover:text-crimson-dark underline-offset-4 hover:underline px-0 py-0',
  linkLight: 'text-gold-bright hover:text-white underline-offset-4 hover:underline px-0 py-0',
}

export default function Button({
  children, href, onClick, variant = 'primary', size = 'md',
  className = '', type = 'button', target, rel, ariaLabel,
}: ButtonProps) {
  const isLink = variant === 'link' || variant === 'linkLight'
  const cls = `${BASE} ${isLink ? '' : SIZES[size]} ${VARIANTS[variant]} ${className}`.trim()

  if (href) {
    return (
      <a href={href} onClick={onClick} className={cls} target={target} rel={rel} aria-label={ariaLabel}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  )
}
