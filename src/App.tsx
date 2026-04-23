import { useEffect, type ReactElement } from 'react'
import { useRoute } from './lib/router'
import { setSeo } from './lib/seo'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import DirectoryPage from './pages/DirectoryPage'
import ChurchDetailPage from './pages/ChurchDetailPage'
import ParishPage from './pages/ParishPage'
import ArchitecturePage from './pages/ArchitecturePage'
import ClergyPage from './pages/ClergyPage'
import About from './pages/About'
import News from './pages/News'
import Sources from './pages/Sources'
import Glossary from './pages/Glossary'
import History from './pages/History'

const STATIC_META: Record<string, { title?: string; description?: string }> = {
  '#/': { },
  '#/churches': { title: 'Church Directory', description: 'Browse, search and filter all Anglican churches in Jamaica on an interactive map.' },
  '#/map': { title: 'Church Directory', description: 'Browse, search and filter all Anglican churches in Jamaica on an interactive map.' },
  '#/history': { title: 'History', description: 'The history of the Anglican Church in Jamaica from 1655 to the present.' },
  '#/about': { title: 'About & Sources', description: 'About this project, and the full list of UK and Jamaican sources cited in the church narratives.' },
  '#/news': { title: 'News & Events', description: 'Recent news and upcoming events from the Anglican Diocese of Jamaica and the Cayman Islands.' },
  '#/sources': { title: 'Sources', description: 'Primary and secondary sources used across the site.' },
  '#/glossary': { title: 'Glossary', description: 'Terms and vocabulary used across the site.' },
  '#/architecture': { title: 'Architecture', description: 'Browse Jamaican Anglican churches by architectural style — Georgian, Gothic Revival, vernacular Caribbean, estate chapels, and post-war modernist.' },
  '#/clergy': { title: 'Clergy Index', description: 'Index of clergy — bishops, archbishops, rectors, and priests — named in the church narratives.' },
}

export default function App() {
  const route = useRoute()

  useEffect(() => {
    if (route.startsWith('#/church/') || route.startsWith('#/parish/')) return
    const meta = STATIC_META[route] ?? {}
    setSeo(meta)
  }, [route])

  let page: ReactElement
  if (route === '#/' || route === '') {
    page = <HomePage />
  } else if (route === '#/churches' || route === '#/map') {
    page = <DirectoryPage />
  } else if (route.startsWith('#/church/')) {
    page = <ChurchDetailPage />
  } else if (route.startsWith('#/parish/')) {
    page = <ParishPage />
  } else if (route === '#/architecture') {
    page = <ArchitecturePage />
  } else if (route === '#/clergy') {
    page = <ClergyPage />
  } else if (route === '#/history') {
    page = <History />
  } else if (route === '#/about') {
    page = <About />
  } else if (route === '#/news') {
    page = <News />
  } else if (route === '#/sources') {
    page = <Sources />
  } else if (route === '#/glossary') {
    page = <Glossary />
  } else {
    page = <HomePage />
  }

  // Directory page has its own full-screen layout, no footer
  const isDirectory = route === '#/churches' || route === '#/map'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">{page}</div>
      {!isDirectory && <Footer />}
    </div>
  )
}
