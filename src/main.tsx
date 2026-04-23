import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import './styles/tailwind.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
