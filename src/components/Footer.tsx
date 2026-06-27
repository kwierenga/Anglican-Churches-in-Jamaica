const footerLinks = [
  { href: '#/churches', label: 'Churches' },
  { href: '#/parishes', label: 'Parishes' },
  { href: '#/architecture', label: 'Architecture' },
  { href: '#/clergy', label: 'Clergy' },
  { href: '#/history', label: 'History' },
  { href: '#/news', label: 'News & Events' },
  { href: '#/about', label: 'About' },
  { href: '#/sources', label: 'Sources' },
  { href: '#/glossary', label: 'Glossary' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80 py-10">
      <div className="max-w-site mx-auto px-4 text-center space-y-2">
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-5 gap-y-2 pb-4 text-sm">
          {footerLinks.map(l => (
            <a key={l.href} href={l.href} className="text-white/70 hover:text-gold-bright transition-colors">
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
