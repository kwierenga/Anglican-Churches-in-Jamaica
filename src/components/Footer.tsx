import { to } from '../lib/router'

const footerLinks = [
  { path: '/churches', label: 'Churches' },
  { path: '/parishes', label: 'Parishes' },
  { path: '/architecture', label: 'Architecture' },
  { path: '/clergy', label: 'Clergy' },
  { path: '/history', label: 'History' },
  { path: '/news', label: 'News & Events' },
  { path: '/about', label: 'About' },
  { path: '/sources', label: 'Sources' },
  { path: '/glossary', label: 'Glossary' },
  { path: '/data', label: 'Data Coverage' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80 py-10">
      <div className="max-w-site mx-auto px-4 text-center space-y-2">
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-5 gap-y-2 pb-4 text-sm">
          {footerLinks.map(l => (
            <a key={l.path} href={to(l.path)} className="text-white/70 hover:text-gold-bright transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <p className="font-heading text-lg text-white">
          The Anglican Diocese of Jamaica &amp; The Cayman Islands
        </p>
        <p className="text-sm text-white/60">
          Church House, 2 Caledonia Avenue, Kingston 5, Jamaica&ensp;|&ensp;
          <a href="https://www.anglicandioceseja.org" target="_blank" rel="noopener noreferrer"
             className="text-gold-bright hover:text-gold underline">
            anglicandioceseja.org
          </a>
        </p>
        <p className="text-xs text-white/40 pt-2">
          This is an independent heritage project and is not an official publication of the Diocese.
        </p>
      </div>
    </footer>
  )
}
