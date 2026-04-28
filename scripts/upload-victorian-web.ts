/**
 * One-shot: download 17 Victorian Web photos by Tim Willasey-Wilsey from
 * https://victorianweb.org/history/empire/westindies/churches.html
 * (Bennett, "Anglican Churches of Eighteenth-Century Jamaica"), upload each
 * to Cloudinary, and append rows to data/media.csv with proper credit.
 *
 * Usage:  tsx scripts/upload-victorian-web.ts
 */
import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MEDIA_CSV = path.resolve("data/media.csv");
const STAGE_DIR = path.resolve("data/victorian-web");
const REF_URL = "https://victorianweb.org/history/empire/westindies/churches.html";
const PHOTOGRAPHER = "Tim Willasey-Wilsey";

type Entry = {
  src: string;            // remote filename on victorianweb.org
  church_id: string;
  caption: string;
};

const ENTRIES: Entry[] = [
  // Port Royal
  { src: "3.jpg",  church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal — exterior" },
  { src: "3b.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal — interior" },
  { src: "3c.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal — organ loft (1745)" },
  { src: "3d.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal — churchyard grave" },
  // Spanish Town Cathedral
  { src: "4.jpg",  church_id: "st-jago-de-la-vega-the-cathedral-spanish-town-st-catherine", caption: "St. Jago de la Vega Cathedral, Spanish Town — exterior" },
  { src: "14.jpg", church_id: "st-jago-de-la-vega-the-cathedral-spanish-town-st-catherine", caption: "St. Jago de la Vega Cathedral — gravestone of Sir Thomas Modyford" },
  { src: "15.jpg", church_id: "st-jago-de-la-vega-the-cathedral-spanish-town-st-catherine", caption: "St. Jago de la Vega Cathedral — interior" },
  // Kingston Parish Church
  { src: "5.jpg",  church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church" },
  { src: "6.jpg",  church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Old Kingston Parish Church (pre-1907)" },
  { src: "11.jpg", church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church — carved pew (pineapple motif)" },
  { src: "12.jpg", church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church — gravestone of Admiral John Benbow" },
  // St. Andrew Parish Church, Half-Way-Tree
  { src: "6b.jpg", church_id: "st-andrew-parish-church-half-way-tree-st-andrew", caption: "St. Andrew Parish Church, Half-Way-Tree" },
  { src: "13.jpg", church_id: "st-andrew-parish-church-half-way-tree-st-andrew", caption: "St. Andrew Parish Church — General Villette's memorial" },
  // St. James Parish Church, Montego Bay
  { src: "7.jpg",  church_id: "st-james-parish-church-sam-sharpe-square-st-james", caption: "St. James Parish Church, Montego Bay — exterior" },
  // St. Peter's, Falmouth
  { src: "8.jpg",  church_id: "st-peter-s-parish-church-falmouth-trelawny", caption: "St. Peter's Parish Church, Falmouth" },
  // Hanover Parish Church, Lucea
  { src: "9.jpg",  church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea" },
  // St. Mark's, Rio Bueno
  { src: "10.jpg", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno" },
];

function loadExistingKeys(): Set<string> {
  const set = new Set<string>();
  if (!fs.existsSync(MEDIA_CSV)) return set;
  const rows: Array<{ church_id: string; order: string }> = parse(
    fs.readFileSync(MEDIA_CSV, "utf8"),
    { columns: true, skip_empty_lines: true, relax_column_count: true }
  );
  for (const r of rows) {
    if (r.church_id) set.add(`${r.church_id}|${String(r.order ?? "")}`);
  }
  return set;
}

function nextOrders(): Map<string, number> {
  const rows: Array<{ church_id: string; order: string }> = parse(
    fs.readFileSync(MEDIA_CSV, "utf8"),
    { columns: true, skip_empty_lines: true, relax_column_count: true }
  );
  const max = new Map<string, number>();
  for (const r of rows) {
    if (!r.church_id) continue;
    const o = Number(r.order) || 0;
    max.set(r.church_id, Math.max(max.get(r.church_id) ?? 0, o));
  }
  return max;
}

async function download(url: string, dest: string): Promise<void> {
  if (fs.existsSync(dest)) return;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (research script for ACJ-site)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  fs.mkdirSync(STAGE_DIR, { recursive: true });
  const existing = loadExistingKeys();
  const maxOrder = nextOrders();
  const nextOrder = new Map<string, number>();
  for (const e of ENTRIES) {
    const start = (maxOrder.get(e.church_id) ?? 0);
    if (!nextOrder.has(e.church_id)) nextOrder.set(e.church_id, start);
  }

  for (const e of ENTRIES) {
    const order = (nextOrder.get(e.church_id)! + 1);
    nextOrder.set(e.church_id, order);

    const stagePath = path.join(STAGE_DIR, `${e.church_id}-${order}-${e.src}`);
    const srcUrl = `https://victorianweb.org/history/empire/westindies/images/${e.src}`;

    console.log(`↓ ${srcUrl}`);
    await download(srcUrl, stagePath);

    const key = `${e.church_id}|${order}`;
    if (existing.has(key)) {
      console.log(`SKIP (already in media.csv): ${key}`);
      continue;
    }

    const ext = path.extname(e.src).toLowerCase().replace(".", "") || "jpg";
    const publicId = `churches/${e.church_id}-${order}`;
    console.log(`↑ Cloudinary upload → ${publicId}`);
    const result = await cloudinary.uploader.upload(stagePath, {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
      format: ext === "jpeg" ? "jpg" : ext,
    });

    const row = {
      church_id: e.church_id,
      type: "image",
      url: result.secure_url,
      caption: e.caption,
      credit: `${REF_URL} (photo: ${PHOTOGRAPHER})`,
      license: "Fair use",
      order: String(order),
    };
    fs.appendFileSync(MEDIA_CSV, stringify([row], { header: false }));
    console.log(`✓ ${result.secure_url}`);
  }

  console.log("\nRebuilding data…");
  const { execSync } = await import("node:child_process");
  execSync("npm run build:data", { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
