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
  // Jackson Town, Trelawny
  {
    file: "data/new-images/JacksonTown/St_Matthew_s_1.jpg",
    church_id: "st-matthew-s-jackson-town-trelawny",
    caption: "St. Matthew's, Jackson Town",
    order: "1",
  },
  // Marley Hill, St. Catherine
  {
    file: "data/new-images/Marley/Marley_1.jpg",
    church_id: "st-andrew-s-marley-hill-st-catherine",
    caption: "St. Andrew's, Marley Hill",
    order: "1",
  },
  // New Roads, Westmoreland
  {
    file: "data/new-images/NewRoads/St_James_1.jpg",
    church_id: "st-james-new-roads-westmoreland-westmoreland",
    caption: "St. James', New Roads",
    order: "1",
  },
  // Stewart Town, Trelawny
  {
    file: "data/new-images/StewartTown/Stewart_Town_1.jpg",
    church_id: "st-thomas-stewart-town-trelawny",
    caption: "St. Thomas', Stewart Town",
    order: "1",
  },
  // Troy (St. Silas'), Trelawny — 7 images
  ...[1, 2, 3, 4, 5, 6, 7].map((i) => ({
    file: `data/new-images/Troy/St_Silas_${i}.jpg`,
    church_id: "st-silas-s-troy-trelawny",
    caption: "St. Silas', Troy",
    order: String(i),
  })),
  // Wait-a-Bit, Trelawny
  {
    file: "data/new-images/Wait_a_bit/Wait_a_bit_1.jpg",
    church_id: "st-peter-s-wait-a-bit-trelawny",
    caption: "St. Peter's, Wait-a-Bit",
    order: "1",
  },
  // Warsop, Trelawny — 3 images
  ...[1, 2, 3].map((i) => ({
    file: `data/new-images/Warsop/St_Barnabas_${i}.jpg`,
    church_id: "st-barnabas-warsop-trelawny",
    caption: "St. Barnabas', Warsop",
    order: String(i),
  })),
  // Crofts Hill (All Saints'), Clarendon — 3 images
  ...[1, 2, 3].map((i) => ({
    file: `data/new-images/CroftsHill/All_Saints_${i}.jpg`,
    church_id: "all-saints-crofts-hill-clarendon",
    caption: "All Saints', Crofts Hill",
    order: String(i),
  })),
  // Negril (St. Mary the Virgin), Westmoreland — 3 images
  ...[1, 2, 3].map((i) => ({
    file: `data/new-images/Negril/negril-${i}.jpg`,
    church_id: "st-mary-s-negril-westmoreland",
    caption: "St. Mary the Virgin, Hermitage, Negril",
    order: String(i),
  })),
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
