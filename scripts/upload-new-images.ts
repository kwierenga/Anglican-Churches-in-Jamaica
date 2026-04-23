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
  // St. Peter's Church, Alley (Clarendon) — 1671 parish church of the
  // old parish of Vere, third-oldest Anglican church in Jamaica.
  { file: "data/new-images/Alley Clarendon/St_Peter_s_1.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "1" },
  { file: "data/new-images/Alley Clarendon/St_Peter_s_2.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "2" },
  { file: "data/new-images/Alley Clarendon/St_Peter_s_3.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "3" },

  // St. George's, Buff Bay (Portland).
  { file: "data/new-images/Buff Bay/St_George_s_1.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "1" },
  { file: "data/new-images/Buff Bay/St_George_s_2.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "2" },
  { file: "data/new-images/Buff Bay/St_George_s_3.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "3" },
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
