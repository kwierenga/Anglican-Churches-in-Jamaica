import { useRoute } from './lib/router'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import DirectoryPage from './pages/DirectoryPage'
import ChurchDetailPage from './pages/ChurchDetailPage'
import About from './pages/About'
import News from './pages/News'
import Sources from './pages/Sources'
import Glossary from './pages/Glossary'
import History from './pages/History'

export default function App() {
  const route = useRoute()

  let page: JSX.Element
  if (route === '#/' || route === '') {
    page = <HomePage />
  } else if (route === '#/churches' || route === '#/map') {
    page = <DirectoryPage />
  } else if (route.startsWith('#/church/')) {
    page = <ChurchDetailPage />
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
