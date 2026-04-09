import { parse } from 'csv-parse/sync';
import fs from 'fs';
const media = parse(fs.readFileSync('data/media.csv','utf8'),{columns:true,skip_empty_lines:true});
const withImages = new Set(media.map((r:any)=>r.church_id));
const churches = JSON.parse(fs.readFileSync('data/build/churches.geo.json','utf8'));
const missing = churches.features.filter((f:any)=>!withImages.has(f.properties.id)).map((f:any)=>({id:f.properties.id,name:f.properties.name}));
console.log(missing.length+' churches without images:');
missing.forEach((c:any)=>console.log(c.id,' | ',c.name));
