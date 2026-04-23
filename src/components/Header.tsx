import { useRoute } from '../lib/router'

const links = [
  { href: '#/', label: 'Home' },
  { href: '#/churches', label: 'Churches' },
  { href: '#/architecture', label: 'Architecture' },
  { href: '#/clergy', label: 'Clergy' },
  { href: '#/history', label: 'History' },
  { href: '#/about', label: 'About' },
  { href: '#/news', label: 'News' },
]

export default function Header() {
  const route = useRoute()

  return (
    <header className="bg-crimson border-b-4 border-gold sticky top-0 z-50">
      <div className="max-w-site mx-auto px-4 h-[62px] flex items-center">
        {/* Logo / brand */}
        <a href="#/" className="flex items-center gap-2 text-white no-underline">
          <span className="text-gold-bright text-xl">&#10013;</span>
          <span className="font-heading text-lg font-semibold text-white tracking-wide">
            Diocese of Jamaica
          </span>
        </a>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="ml-auto flex items-center gap-1">
          {links.map(l => {
            const active = route === l.href || (l.href !== '#/' && route.startsWith(l.href))
            return (
              <a
                key={l.href}
                href={l.href}
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
