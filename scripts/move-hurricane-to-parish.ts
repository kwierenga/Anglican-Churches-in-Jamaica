/**
 * Move Hurricane Melissa images from hurricane-melissa-2025/ to parish folders on Cloudinary.
 * Updates media.csv with new URLs.
 *
 * Usage: tsx scripts/move-hurricane-to-parish.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { v2 as cloudinary } from 'cloudinary'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MEDIA_CSV = path.resolve('data/media.csv')
const CHURCHES_CSV = path.resolve('data/churches.csv')

// Build church_id → parish lookup
const churchRows: any[] = parse(fs.readFileSync(CHURCHES_CSV, 'utf8'), { columns: true, skip_empty_lines: true })
const parishMap = new Map<string, string>()
for (const row of churchRows) {
  parishMap.set(row.id, row.parish)
}

// Slugify parish name for Cloudinary folder
function parishSlug(parish: string): string {
  return parish.toLowerCase().replace(/[.\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function main() {
  const csv = fs.readFileSync(MEDIA_CSV, 'utf8')
  const rows: any[] = parse(csv, { columns: true, skip_empty_lines: true })

  const hurricaneRows = rows.filter(r => r.url.includes('hurricane-melissa-2025'))
  console.log(`Found ${hurricaneRows.length} hurricane images to move\n`)

  for (const row of hurricaneRows) {
    const parish = parishMap.get(row.church_id)
    if (!parish) {
      console.log(`  SKIP: no parish found for ${row.church_id}`)
      continue
    }

    // Extract current public_id from URL
    // URL format: .../upload/v1234/hurricane-melissa-2025/hurricane-melissa-2025/filename.jpg
    const match = row.url.match(/\/upload\/v\d+\/(.+)\.\w+$/)
    if (!match) {
      console.log(`  SKIP: can't parse public_id from ${row.url}`)
      continue
    }
    const oldPublicId = match[1]
    const filename = oldPublicId.split('/').pop()!
    const newPublicId = `${parishSlug(parish)}/hurricane-melissa/${filename}`

    console.log(`  ${oldPublicId} → ${newPublicId}`)

    try {
      // Rename (move) on Cloudinary
      await cloudinary.uploader.rename(oldPublicId, newPublicId, { overwrite: true })

      // Update URL in the row
      const newUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${newPublicId}.jpg`
      row.url = newUrl
      console.log(`  ✓ moved`)
    } catch (err: any) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  // Write updated CSV
  const header = 'church_id,type,url,caption,credit,license,order\n'
  const body = rows.map(r => stringify([r], { header: false })).join('')
  fs.writeFileSync(MEDIA_CSV, header + body)

  console.log(`\nUpdated media.csv`)

  // Clean up empty Cloudinary folders
  try {
    await cloudinary.api.delete_folder('hurricane-melissa-2025/hurricane-melissa-2025')
    await cloudinary.api.delete_folder('hurricane-melissa-2025')
    console.log('Cleaned up old Cloudinary folders')
  } catch { /* ignore if already empty */ }

  // Rebuild
  console.log('\nRebuilding data...')
  const { execSync } = await import('node:child_process')
  execSync('npm run build:data', { stdio: 'inherit' })
}

main().catch(err => { console.error(err); process.exit(1) })
