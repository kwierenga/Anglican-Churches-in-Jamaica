import { lazy, Suspense, useEffect, type ReactElement } from 'react'
import { useRoute } from './lib/router'

// Disable browser scroll-restoration globally so route changes always start
// at top, regardless of how navigation happens (link click, back/forward).
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
import { setSeo } from './lib/seo'
import Header from './components/Header'
import Footer from './components/Footer'

// Lazy-loaded routes: each page is its own chunk, so heavy deps (Leaflet on the
// map/detail pages, marked on church pages) stay out of the initial bundle.
const HomePage = lazy(() => import('./pages/HomePage'))
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'))
const ChurchDetailPage = lazy(() => import('./pages/ChurchDetailPage'))
const ParishPage = lazy(() => import('./pages/ParishPage'))
const ParishesIndex = lazy(() => import('./pages/ParishesIndex'))
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage'))
const ClergyPage = lazy(() => import('./pages/ClergyPage'))
const About = lazy(() => import('./pages/About'))
const News = lazy(() => import('./pages/News'))
const Sources = lazy(() => import('./pages/Sources'))
const Glossary = lazy(() => import('./pages/Glossary'))
const History = lazy(() => import('./pages/History'))
const DataPage = lazy(() => import('./pages/DataPage'))

const STATIC_META: Record<string, { title?: string; description?: string }> = {
  '/': { },
  '/churches': { title: 'Church Directory', description: 'Browse, search and filter all Anglican churches in Jamaica on an interactive map.' },
  '/map': { title: 'Church Directory', description: 'Browse, search and filter all Anglican churches in Jamaica on an interactive map.' },
  '/parishes': { title: 'Parishes', description: 'The fourteen civil parishes of Jamaica and their Anglican churches.' },
  '/history': { title: 'History', description: 'The history of the Anglican Church in Jamaica from 1655 to the present.' },
  '/about': { title: 'About & Sources', description: 'About this project, and the full list of UK and Jamaican sources cited in the church narratives.' },
  '/news': { title: 'News & Events', description: 'Recent news and upcoming events from the Anglican Diocese of Jamaica and the Cayman Islands.' },
  '/sources': { title: 'Sources', description: 'Primary and secondary sources used across the site.' },
  '/glossary': { title: 'Glossary', description: 'Terms and vocabulary used across the site.' },
  '/data': { title: 'Data Coverage', description: 'Maintainer punch-list of what each church entry still needs — photos, fuller histories, structured facts.' },
  '/architecture': { title: 'Architecture', description: 'Browse Jamaican Anglican churches by architectural style — Georgian, Gothic Revival, vernacular Caribbean, estate chapels, and post-war modernist.' },
  '/clergy': { title: 'Clergy Index', description: 'Index of clergy — bishops, archbishops, rectors, and priests — named in the church narratives.' },
}

export default function App() {
  const route = useRoute()

  useEffect(() => {
    if (route.startsWith('/church/') || route.startsWith('/parish/')) return
    const meta = STATIC_META[route] ?? {}
    setSeo(meta)
  }, [route])

  let page: ReactElement
  if (route === '/' || route === '') {
    page = <HomePage />
  } else if (route === '/churches' || route === '/map') {
    page = <DirectoryPage />
  } else if (route.startsWith('/church/')) {
    // key={route} forces a fresh mount on every church change -- guarantees
    // a new component instance, fresh state and refs, and scroll at top.
    page = <ChurchDetailPage key={route} />
  } else if (route === '/parishes') {
    page = <ParishesIndex />
  } else if (route.startsWith('/parish/')) {
    page = <ParishPage />
  } else if (route === '/architecture') {
    page = <ArchitecturePage />
  } else if (route === '/clergy') {
    page = <ClergyPage />
  } else if (route === '/history') {
    page = <History />
  } else if (route === '/about') {
    page = <About />
  } else if (route === '/news') {
    page = <News />
  } else if (route === '/sources') {
    page = <Sources />
  } else if (route === '/glossary') {
    page = <Glossary />
  } else if (route === '/data') {
    page = <DataPage />
  } else {
    page = <HomePage />
  }

  // Directory page has its own full-screen layout, no footer
  const isDirectory = route === '/churches' || route === '/map'

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100]
                   focus:bg-white focus:text-crimson focus:font-semibold focus:px-4 focus:py-2 focus:rounded focus:shadow"
      >
        Skip to content
      </a>
      <Header />
      <div id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<div className="grid place-items-center py-24 text-gray-400 font-body">Loading…</div>}>
          {page}
        </Suspense>
      </div>
      {!isDirectory && <Footer />}
    </div>
  )
}
