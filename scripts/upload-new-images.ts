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
  // St. Helena's Sheffield — image filed as NewHope/St_Paul_s_1.jpg.
  // Per the Diocese's Westmoreland Deanery directory there is no
  // Anglican church at New Hope; Sheffield (St. Helena's) is a mission
  // of the Little London cure, whose principal church is St. Paul's —
  // so an image of this mission might naturally be saved under the
  // cure's main dedication.
  {
    file: "data/new-images/NewHope/St_Paul_s_1.jpg",
    church_id: "st-helena-s-sheffield-westmoreland",
    caption: "St. Helena's, Sheffield",
    order: "1",
  },
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
