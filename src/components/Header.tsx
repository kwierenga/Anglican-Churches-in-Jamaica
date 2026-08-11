import { useEffect, useState } from 'react'
import { useRoute, to } from '../lib/router'
import HeaderSearch from './HeaderSearch'

const links: { path: string; label: string; match?: string }[] = [
  { path: '/', label: 'Home' },
  { path: '/churches', label: 'Churches' },
  { path: '/parishes', label: 'Parishes', match: '/parish' },
  { path: '/architecture', label: 'Architecture' },
  { path: '/clergy', label: 'Clergy' },
  { path: '/history', label: 'History' },
  { path: '/news', label: 'News' },
  { path: '/about', label: 'About' },
]

export default function Header() {
  const route = useRoute()
  const [open, setOpen] = useState(false)

  // Close the menu whenever navigation happens, so a tap on a link doesn't
  // leave the panel covering the page it just opened.
  useEffect(() => { setOpen(false) }, [route])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (l: typeof links[number]) =>
    route === l.path
    || (l.path !== '/' && route.startsWith(l.path + '/'))
    || (l.match ? route.startsWith(l.match) : false)

  const linkClass = (active: boolean, block = false) =>
    `${block ? 'block' : ''} px-3 py-1.5 rounded text-sm font-body no-underline transition-colors
     ${active ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`

  return (
    <header className="bg-crimson border-b-4 border-gold sticky top-0 z-50">
      <div className="max-w-site mx-auto px-4 h-[62px] flex items-center gap-3">
        {/* Logo / brand */}
        <a href={to('/')} className="flex items-center gap-2 text-white no-underline shrink-0">
          <span className="text-gold-bright text-xl" aria-hidden="true">&#10013;</span>
          <span className="font-heading text-lg font-semibold text-white tracking-wide">
            Diocese of Jamaica
          </span>
        </a>

        {/* Site-wide search — the eight nav links plus a search box need ~840px,
            so both collapse into the menu below the lg breakpoint. */}
        <div className="ml-auto hidden lg:block">
          <HeaderSearch />
        </div>

        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l.path}
              href={to(l.path)}
              aria-current={isActive(l) ? 'page' : undefined}
              className={linkClass(isActive(l))}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Menu toggle (below lg) */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="ml-auto lg:hidden inline-flex items-center justify-center w-10 h-10 rounded
                     text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open
              ? <><path d="M5 5l14 14" /><path d="M19 5L5 19" /></>
              : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div id="site-menu" className="lg:hidden border-t border-white/15 bg-crimson shadow-lg">
          <div className="max-w-site mx-auto px-4 py-3 space-y-3">
            <HeaderSearch fullWidth />
            <nav aria-label="Main navigation" className="grid grid-cols-2 gap-1">
              {links.map(l => (
                <a
                  key={l.path}
                  href={to(l.path)}
                  aria-current={isActive(l) ? 'page' : undefined}
                  className={linkClass(isActive(l), true)}
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
