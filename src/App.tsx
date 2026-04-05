import Home from './pages/Home'

export default function App(){
  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 flex items-center gap-4">
        <h1 className="text-xl font-semibold">Anglican Churches in Jamaica</h1>
        <nav className="ml-auto text-sm flex gap-4">
          <a href="#/about">About</a>
          <a href="#/news">News</a>
          <a href="#/sources">Sources</a>
          <a href="#/glossary">Glossary</a>
        </nav>
      </header>
      <Home />
      <footer className="border-t px-4 py-4 text-sm text-gray-600">
        © Anglican Church in Jamaica — Acknowledgments • Sources • Contact
      </footer>
    </div>
  )
}
