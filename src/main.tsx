import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import './styles/tailwind.css'
import 'leaflet/dist/leaflet.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)

// Offline support (production only). Registers the service worker that caches
// the app shell, data, narratives, images and map tiles for field use.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
