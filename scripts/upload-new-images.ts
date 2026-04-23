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

const IMAGE_MAP = [
  // --- St. Catherine parish ---------------------------------------------

  // St. Thomas-ye-Vale, Bog Walk (St. Catherine).
  { file: "data/new-images/Bog Walk/St_Thomas_Ye_Vale_1.jpg", church_id: "st-thomas-ye-vale-bog-walk-st-catherine", caption: "St. Thomas-ye-Vale, Bog Walk", order: "1" },
  { file: "data/new-images/Bog Walk/St_Thomas_Ye_Vale_2.jpg", church_id: "st-thomas-ye-vale-bog-walk-st-catherine", caption: "St. Thomas-ye-Vale, Bog Walk", order: "2" },
  { file: "data/new-images/Bog Walk/St_Thomas_Ye_Vale_3.jpg", church_id: "st-thomas-ye-vale-bog-walk-st-catherine", caption: "St. Thomas-ye-Vale, Bog Walk", order: "3" },
  { file: "data/new-images/Bog Walk/St_Thomas_Ye_Vale_4.jpg", church_id: "st-thomas-ye-vale-bog-walk-st-catherine", caption: "St. Thomas-ye-Vale, Bog Walk", order: "4" },

  // St. Dorothy's Church, Old Harbour (St. Catherine) — 1681 land donation
  // from Colonel Thomas Fuller and Catherine Fuller.
  { file: "data/new-images/Old Harbour/St_Dorothy_s_1.jpg", church_id: "st-dorothy-s-church-old-harbour-st-catherine", caption: "St. Dorothy's Church, Old Harbour", order: "1" },
  { file: "data/new-images/Old Harbour/St_Dorothy_s_2.jpg", church_id: "st-dorothy-s-church-old-harbour-st-catherine", caption: "St. Dorothy's Church, Old Harbour", order: "2" },
  { file: "data/new-images/Old Harbour/St_Dorothy_s_3.jpg", church_id: "st-dorothy-s-church-old-harbour-st-catherine", caption: "St. Dorothy's Church, Old Harbour", order: "3" },
  { file: "data/new-images/Old Harbour/St_Dorothy_s_4.jpg", church_id: "st-dorothy-s-church-old-harbour-st-catherine", caption: "St. Dorothy's Church, Old Harbour", order: "4" },

  // St. Philip's, Old Harbour Bay (St. Catherine).
  { file: "data/new-images/Old Harbour Bay/Old_Harbour_Bay_1.jpg", church_id: "st-philip-s-old-harbour-bay-st-catherine", caption: "St. Philip's, Old Harbour Bay", order: "1" },

  // --- St. Elizabeth parish ---------------------------------------------

  // St. Aidan's, Bull Savannah (St. Elizabeth).
  { file: "data/new-images/BullSavannah/St_Aidan_1.jpg", church_id: "st-aidan-s-bull-savannah-st-elizabeth", caption: "St. Aidan's, Bull Savannah", order: "1" },

  // St. Peter's, Pedro Plains (St. Elizabeth).
  { file: "data/new-images/PedroPlains/Pedro_plains_1.jpg", church_id: "st-peter-s-pedro-plains-st-elizabeth", caption: "St. Peter's, Pedro Plains", order: "1" },
  { file: "data/new-images/PedroPlains/Pedro_plains_2.jpg", church_id: "st-peter-s-pedro-plains-st-elizabeth", caption: "St. Peter's, Pedro Plains", order: "2" },
  { file: "data/new-images/PedroPlains/Pedro_plains_3.jpg", church_id: "st-peter-s-pedro-plains-st-elizabeth", caption: "St. Peter's, Pedro Plains", order: "3" },
  { file: "data/new-images/PedroPlains/Pedro_plains_4.jpg", church_id: "st-peter-s-pedro-plains-st-elizabeth", caption: "St. Peter's, Pedro Plains", order: "4" },

  // St. Boniface, Pondside (St. Elizabeth).
  { file: "data/new-images/Pondside/Pondside_1.jpg", church_id: "st-boniface-pondside-st-elizabeth", caption: "St. Boniface, Pondside", order: "1" },
  { file: "data/new-images/Pondside/Pondside_2.jpg", church_id: "st-boniface-pondside-st-elizabeth", caption: "St. Boniface, Pondside", order: "2" },

  // --- Extras for churches already uploaded ----------------------------

  // St. Paul's, Chapelton (Clarendon) — orders 1-4 already uploaded, adding 5 and 6.
  { file: "data/new-images/Chapelton/St_Paul_s_5.jpg", church_id: "st-paul-s-chapelton-clarendon", caption: "St. Paul's, Chapelton", order: "5" },
  { file: "data/new-images/Chapelton/St_Paul_s_6.jpg", church_id: "st-paul-s-chapelton-clarendon", caption: "St. Paul's, Chapelton", order: "6" },

  // St. Ann Parish Church, St. Ann's Bay — 1 uploaded, adding 4 more.
  { file: "data/new-images/St Ann's Bay/st-anns-bay-1.jpeg", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "2" },
  { file: "data/new-images/St Ann's Bay/st-anns-bay-2.png", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "3" },
  { file: "data/new-images/St Ann's Bay/st-anns-bay-3.png", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "4" },
  { file: "data/new-images/St Ann's Bay/st-anns-bay-4.png", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "5" },

  // Hanover Parish Church, Lucea — 3 uploaded; adding 5 more from the main photo set.
  { file: "data/new-images/Lucea/lucea-1.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "4" },
  { file: "data/new-images/Lucea/lucea-2.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "5" },
  { file: "data/new-images/Lucea/lucea-3.webp", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "6" },
  { file: "data/new-images/Lucea/lucea-4.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "7" },
  { file: "data/new-images/Lucea/heritagec20121206mt.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea (heritage record)", order: "8" },

  // St. Mark's, Southfield — 4 uploaded; adding 4 more distinctly-named files.
  { file: "data/new-images/Southfield/southfield-3.jpg", church_id: "st-mark-s-southfield-st-elizabeth", caption: "St. Mark's, Southfield", order: "5" },
  { file: "data/new-images/Southfield/southfield-4.jpg", church_id: "st-mark-s-southfield-st-elizabeth", caption: "St. Mark's, Southfield", order: "6" },
  { file: "data/new-images/Southfield/Southfield-5.jpg", church_id: "st-mark-s-southfield-st-elizabeth", caption: "St. Mark's, Southfield", order: "7" },
  { file: "data/new-images/Southfield/st-mark-southfield.png", church_id: "st-mark-s-southfield-st-elizabeth", caption: "St. Mark's, Southfield", order: "8" },
];

async function main() {
  const existing = loadExistingKeys();
  for (const entry of IMAGE_MAP) {
    const filePath = path.resolve(entry.file);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (missing): ${entry.file}`);
      continue;
    }
    const key = `${entry.church_id}|${entry.order}`;
    if (existing.has(key)) {
      console.log(`SKIP (already uploaded): ${entry.church_id} order=${entry.order}`);
      continue;
    }
    const publicId = `churches/${entry.church_id}-${entry.order}`;
    console.log(`Uploading ${entry.file}...`);
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
    });
    const row = {
      church_id: entry.church_id,
      type: "image",
      url: result.secure_url,
      caption: entry.caption,
      credit: "",
      license: "Fair use",
      order: entry.order,
    };
    fs.appendFileSync(MEDIA_CSV, stringify([row], { header: false }));
    console.log(`✓ Uploaded → ${result.secure_url}`);
  }
  console.log("Rebuilding data...");
  const { execSync } = await import("node:child_process");
  execSync("npm run build:data", { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
