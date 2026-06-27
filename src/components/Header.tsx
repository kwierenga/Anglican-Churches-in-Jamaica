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

  return (
    <header className="bg-crimson border-b-4 border-gold sticky top-0 z-50">
      <div className="max-w-site mx-auto px-4 h-[62px] flex items-center">
        {/* Logo / brand */}
        <a href={to('/')} className="flex items-center gap-2 text-white no-underline shrink-0">
          <span className="text-gold-bright text-xl" aria-hidden="true">&#10013;</span>
          <span className="font-heading text-lg font-semibold text-white tracking-wide">
            Diocese of Jamaica
          </span>
        </a>

        {/* Site-wide search */}
        <div className="ml-auto mr-2 hidden sm:block">
          <HeaderSearch />
        </div>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:ml-0 ml-auto">
          {links.map(l => {
            const active = route === l.path
              || (l.path !== '/' && route.startsWith(l.path + '/'))
              || (l.match ? route.startsWith(l.match) : false)
            return (
              <a
                key={l.path}
                href={to(l.path)}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-1.5 rounded text-sm font-body no-underline transition-colors
                  ${active
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {l.label}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
