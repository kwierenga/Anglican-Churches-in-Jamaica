/**
 * Upload Hurricane Melissa 2025 damage photos to Cloudinary
 * and add entries to data/media.csv.
 *
 * Usage: tsx scripts/upload-hurricane-images.ts
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
const IMAGE_DIR = path.resolve('data/hurricane-melissa-2025')

// Map filenames to church IDs and captions
const IMAGE_MAP: { file: string; church_id: string; caption: string }[] = [
  { file: 'Lacovia-St.-Elizabeth-1.jpg', church_id: 'st-thomas-lacovia-st-elizabeth', caption: 'Hurricane Melissa damage, Lacovia' },
  { file: 'Lacovia-St.-Elizabeth-280x300.jpg', church_id: 'st-thomas-lacovia-st-elizabeth', caption: 'Hurricane Melissa damage, Lacovia' },
  { file: 'Bluefields-800x600.jpeg', church_id: 'st-thomas-bluefields-westmoreland', caption: "Hurricane Melissa damage, St. Thomas' Bluefields" },
  { file: 'Christ-CHurch-Christiana-800x600.jpeg', church_id: 'christ-church-christiana-manchester', caption: 'Hurricane Melissa damage, Christ Church Christiana' },
  { file: 'GILNOCK-637x800.jpg', church_id: 'st-andrew-s-gilnock-st-elizabeth', caption: "Hurricane Melissa damage, St. Andrew's Gilnock" },
  { file: 'Holy-Trinity-Grange-Hill-Gordon-Hall2-800x360.jpeg', church_id: 'holy-trinity-grange-hill-westmoreland-2', caption: 'Hurricane Melissa damage, Holy Trinity Grange Hill' },
  { file: 'Holy-Trinity-Whitehall-part-of-the-St-Thomas-Cure-Lacovia-800x600.jpeg', church_id: 'holy-trinity-whitehall-st-elizabeth', caption: 'Hurricane Melissa damage, Holy Trinity Whitehall' },
  { file: 'Lucea-Parish-Church-Vestry-800x450.jpg', church_id: 'hanover-parish-church-lucea-hanover', caption: 'Hurricane Melissa damage, Hanover Parish Church vestry, Lucea' },
  { file: 'St-Simons-St-Judes-Ewarton3-450x800.jpeg', church_id: 'ss-simon-and-jude-ewarton-st-catherine', caption: 'Hurricane Melissa damage, SS Simon and Jude, Ewarton' },
  { file: 'St.-Barnabas-Georges-Plain-800x600.jpeg', church_id: 'st-barnabas-george-s-plain-westmoreland', caption: "Hurricane Melissa damage, St. Barnabas' George's Plain" },
  { file: 'St-Michaels-Clarks-Town-1-800x600.jpeg', church_id: 'st-michael-s-clarks-town-trelawny', caption: "Hurricane Melissa damage, St. Michael's Clarks Town" },
  { file: 'Holy-Trinity-8-800x360.jpeg', church_id: 'holy-trinity-grange-hill-westmoreland-2', caption: 'Hurricane Melissa damage, Holy Trinity Grange Hill' },
  { file: 'Leeds2-800x600.jpeg', church_id: 'the-transfiguration-leeds-st-elizabeth', caption: 'Hurricane Melissa damage, The Transfiguration, Leeds' },
  { file: 'St.-Augustines-Mountainside-600x800.jpeg', church_id: 'st-augustine-s-mountainside-st-elizabeth', caption: "Hurricane Melissa damage, St. Augustine's Mountainside" },
  { file: 'St.-Georges-Sav-la-Mar2-800x600.jpeg', church_id: 'st-george-s-savanna-la-mar-parish-church-westmoreland', caption: "Hurricane Melissa damage, St. George's Savanna-la-Mar" },
  { file: 'St-Peterfield-600x800.jpeg', church_id: 'st-peter-s-petersfield-westmoreland', caption: "Hurricane Melissa damage, St. Peter's Petersfield" },
  { file: 'St-Peterfield2-600x800.jpeg', church_id: 'st-peter-s-petersfield-westmoreland', caption: "Hurricane Melissa damage, St. Peter's Petersfield" },
  { file: 'St-Lukes-Balaclava-1-800x762.jpeg', church_id: 'st-luke-s-balaclava-st-elizabeth', caption: "Hurricane Melissa damage, St. Luke's Balaclava" },
  { file: 'St-Stephens-Chantilly.-Porus-Cure-800x600.jpeg', church_id: 'st-stephen-s-chantilly-manchester', caption: "Hurricane Melissa damage, St. Stephen's Chantilly" },
  { file: 'St-Judes-Battersea.-Christiana-Cure-800x600.jpeg', church_id: 'christ-church-christiana-manchester', caption: "Hurricane Melissa damage, St. Jude's Battersea (Christiana Cure)" },
]

// Images we can't confidently map to a church ID — skip for now
const SKIPPED = [
  'Christ-Church-Marley3-800x600.jpeg',     // No "Marley" church in CSV
  'Clifton-Boys-Home-800x600.jpg',           // Institution, not a church
  'St.-James-Mission3-361x800.jpeg',         // No specific St. James Mission match
  'St.-Phillips-Niagara-St.-James-800x600.jpeg', // No Niagara match
  'Screenshot-2025-11-06-155023-1-800x466.png',  // Screenshot, not a photo
  'We-will-do-it-Again_-701x800.png',        // Infographic, not church photo
  'WhatsApp-Image-2025-11-17-at-7.30.03-PM-602x800.jpeg', // Unknown church
  'WhatsApp-Image-2025-11-17-at-7.30.07-PM-602x800.jpeg', // Unknown church
  'WhatsApp-Image-2025-11-17-at-7.30.08-PM-1-602x800.jpeg', // Unknown church
]

function currentMaxOrder(churchId: string): number {
  if (!fs.existsSync(MEDIA_CSV)) return 0
  const rows: any[] = parse(fs.readFileSync(MEDIA_CSV, 'utf8'), { columns: true, skip_empty_lines: true })
  const orders = rows.filter(r => r.church_id === churchId).map(r => Number(r.order) || 0)
  return orders.length ? Math.max(...orders) : 0
}

async function main() {
  // Track per-church order counters
  const orderCounters = new Map<string, number>()

  let uploaded = 0
  let skipped = 0

  for (const entry of IMAGE_MAP) {
    const filePath = path.join(IMAGE_DIR, entry.file)
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (missing): ${entry.file}`)
      skipped++
      continue
    }

    // Compute next order for this church
    if (!orderCounters.has(entry.church_id)) {
      orderCounters.set(entry.church_id, currentMaxOrder(entry.church_id))
    }
    const nextOrder = orderCounters.get(entry.church_id)! + 1
    orderCounters.set(entry.church_id, nextOrder)

    // Upload to Cloudinary
    const publicId = `hurricane-melissa-2025/${path.parse(entry.file).name}`
    console.log(`  Uploading ${entry.file} → ${publicId}...`)

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: 'hurricane-melissa-2025',
        overwrite: false,
        resource_type: 'image',
      })

      // Append to media.csv
      const row = {
        church_id: entry.church_id,
        type: 'image',
        url: result.secure_url,
        caption: entry.caption,
        credit: 'Anglican Diocese of Jamaica',
        license: 'Fair use',
        order: String(nextOrder),
      }
      const line = stringify([row], { header: false })
      fs.appendFileSync(MEDIA_CSV, line)

      console.log(`  ✓ ${entry.file} → order ${nextOrder}`)
      uploaded++
    } catch (err: any) {
      console.error(`  ✗ ${entry.file}: ${err.message}`)
      skipped++
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped`)
  console.log(`\nSkipped (unmapped) files:`)
  SKIPPED.forEach(f => console.log(`  - ${f}`))

  // Rebuild data indices
  console.log('\nRebuilding data...')
  const { execSync } = await import('node:child_process')
  execSync('npm run build:data', { stdio: 'inherit' })
}

main().catch(err => { console.error(err); process.exit(1) })
