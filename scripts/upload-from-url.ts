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

type Entry = {
  url: string;
  church_id: string;
  caption: string;
  credit: string;
  license: string;
  order: string;
};

// Pass entries via JSON file path as argv[2]
const argv = process.argv.slice(2);
if (argv.length !== 1) {
  console.error("usage: tsx scripts/upload-from-url.ts <entries.json>");
  process.exit(1);
}
const entries: Entry[] = JSON.parse(fs.readFileSync(argv[0], "utf8"));

async function main() {
  for (const e of entries) {
    const publicId = `churches/${e.church_id}-${e.order}`;
    console.log(`Uploading ${e.url} → ${publicId}`);
    try {
      const result = await cloudinary.uploader.upload(e.url, {
        public_id: publicId,
        overwrite: false,
        resource_type: "image",
      });
      const row = {
        church_id: e.church_id,
        type: "image",
        url: result.secure_url,
        caption: e.caption,
        credit: e.credit,
        license: e.license,
        order: e.order,
      };
      fs.appendFileSync(
        MEDIA_CSV,
        stringify([row], { header: false, record_delimiter: "\r\n" })
      );
      console.log(`✓ ${result.secure_url}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`✗ ${e.url}: ${msg}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
