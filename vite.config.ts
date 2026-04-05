import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Anglican-Churches-in-Jamaica/',
  plugins: [react()],
  server: {
    host: true,       // bind to all interfaces (fixes localhost/VPN quirks on Windows)
    port: 5177,       // fresh port to avoid conflicts
    strictPort: true, // fail fast if taken
    open: true        // auto-open in your browser
  }
})
