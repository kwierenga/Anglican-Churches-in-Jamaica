/**
 * Copies data/build and content/churches into dist/ after Vite build,
 * so they're served as static assets on GitHub Pages.
 */
import { cpSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')

const copies: [string, string][] = [
  [join(root, 'data', 'build'), join(dist, 'data', 'build')],
  [join(root, 'content'), join(dist, 'content')],
]

for (const [src, dest] of copies) {
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true })
    console.log(`✅ Copied ${src} → ${dest}`)
  } else {
    console.warn(`⚠️  Skipped ${src} (not found)`)
  }
}
