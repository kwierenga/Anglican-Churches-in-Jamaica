import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { stringify } from "csv-stringify/sync";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MEDIA_CSV = path.resolve("data/media.csv");

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
];

async function main() {
  for (const entry of IMAGE_MAP) {
    const filePath = path.resolve(entry.file);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (missing): ${entry.file}`);
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
