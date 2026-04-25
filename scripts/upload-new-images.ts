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
  { file: "data/new-images/Southfield/southfield-3.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "5" },
  { file: "data/new-images/Southfield/southfield-4.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "6" },
  { file: "data/new-images/Southfield/Southfield-5.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "7" },
  { file: "data/new-images/Southfield/st-mark-southfield.png", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "8" },

  // St. Margaret's, Liguanea (St. Andrew) — 3 uploaded; adding the StMargaret folder as orders 4-6.
  { file: "data/new-images/StMargaret/St_Margaret_1.jpg", church_id: "st-margaret-s-liguanea-st-andrew", caption: "St. Margaret's, Liguanea", order: "4" },
  { file: "data/new-images/StMargaret/St_Margaret_2.jpg", church_id: "st-margaret-s-liguanea-st-andrew", caption: "St. Margaret's, Liguanea", order: "5" },
  { file: "data/new-images/StMargaret/St_Margaret_3.jpg", church_id: "st-margaret-s-liguanea-st-andrew", caption: "St. Margaret's, Liguanea", order: "6" },

  // SS Simon and Jude, Ewarton (St. Catherine) — order 1 is the
  // diocesan Hurricane Melissa damage photo; adding a fresh image as order 2.
  { file: "data/new-images/Ewarton/St_Simon_and_St_Jude_1.jpg", church_id: "ss-simon-and-jude-ewarton-st-catherine", caption: "SS Simon and Jude, Ewarton", order: "2" },

  // St. Peter's, Lluidas Vale (St. Catherine).
  { file: "data/new-images/LLuidas Vale/St_Peter_s_1.jpg", church_id: "st-peter-s-lluidas-vale-st-catherine", caption: "St. Peter's, Lluidas Vale", order: "1" },
  { file: "data/new-images/LLuidas Vale/St_Peter_s_2.jpg", church_id: "st-peter-s-lluidas-vale-st-catherine", caption: "St. Peter's, Lluidas Vale", order: "2" },


  // === auto-appended batch (2026-04) ===
  { file: "data/new-images/Accompong/accompong-1.jpg", church_id: "st-martin-s-accompong-st-elizabeth", caption: "St. Martin's, Accompong", order: "2" },
  { file: "data/new-images/AenonTown/St_Matthew_s_1.jpg", church_id: "st-matthew-s-aenon-town-clarendon", caption: "St. Matthew's, Aenon Town", order: "2" },
  { file: "data/new-images/Alley Clarendon/St_Peter_s_1.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "4" },
  { file: "data/new-images/Alley Clarendon/St_Peter_s_2.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "5" },
  { file: "data/new-images/Alley Clarendon/St_Peter_s_3.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "6" },
  { file: "data/new-images/Anglican Churches/Balaclava/balaclava-1.png", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "5" },
  { file: "data/new-images/Anglican Churches/Balaclava/balaclava-2.jpg", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "6" },
  { file: "data/new-images/Anglican Churches/Balaclava/balaclava-3.jpg", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "7" },
  { file: "data/new-images/Anglican Churches/Gilnock/gilnock-1.jpg", church_id: "st-andrew-s-gilnock-st-elizabeth", caption: "St. Andrew's, Gilnock", order: "8" },
  { file: "data/new-images/Anglican Churches/Gilnock/gilnock-2.jpg", church_id: "st-andrew-s-gilnock-st-elizabeth", caption: "St. Andrew's, Gilnock", order: "9" },
  { file: "data/new-images/Anglican Churches/Gilnock/gilnock-3.webp", church_id: "st-andrew-s-gilnock-st-elizabeth", caption: "St. Andrew's, Gilnock", order: "10" },
  { file: "data/new-images/Anglican Churches/Gilnock/gilnock-4.jpg", church_id: "st-andrew-s-gilnock-st-elizabeth", caption: "St. Andrew's, Gilnock", order: "11" },
  { file: "data/new-images/Anglican Churches/Lucea/6432714495_5da8ce1155.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "9" },
  { file: "data/new-images/Anglican Churches/Lucea/HanoverParishCh.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "10" },
  { file: "data/new-images/Anglican Churches/Lucea/heritagec20121206mt.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "11" },
  { file: "data/new-images/Anglican Churches/Lucea/lucea-3.webp", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "12" },
  { file: "data/new-images/Anglican Churches/Lucea/lucea-4.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "13" },
  { file: "data/new-images/Anglican Churches/Negril/negril-1.jpg", church_id: "st-mary-s-negril-westmoreland", caption: "St. Mary's, Negril", order: "4" },
  { file: "data/new-images/Anglican Churches/Negril/negril-2.jpg", church_id: "st-mary-s-negril-westmoreland", caption: "St. Mary's, Negril", order: "5" },
  { file: "data/new-images/Anglican Churches/Negril/negril-3.jpg", church_id: "st-mary-s-negril-westmoreland", caption: "St. Mary's, Negril", order: "6" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/137510505_413939169688860_2918095276225249095_n.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "3" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/470221586_18472002334006891_1444889057300938779_n.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "4" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/470230709_18472002439006891_8794087569665877494_n.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "5" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/506459430_10163241925469697_1513838942202646981_n.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "6" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/St.-Georges-Church-95-Great-George-Street-Savanna-la-Mar-Westmoreland.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "7" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/e6207332e8a92b1c32f5cb714bca35fe.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "8" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/savannah-la-mar-2.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "9" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/savannah-la-mar-3.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "10" },
  { file: "data/new-images/Anglican Churches/Savannah-la-Mar/savannah-la-mar-4.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "11" },
  { file: "data/new-images/Anglican Churches/Southfield/151220131973.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "9" },
  { file: "data/new-images/Anglican Churches/Southfield/southfield-1.png", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "10" },
  { file: "data/new-images/Anglican Churches/Southfield/southfield-2.jpeg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "11" },
  { file: "data/new-images/Anglican Churches/Southfield/southfield-3.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "12" },
  { file: "data/new-images/Anglican Churches/Southfield/southfield-4.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "13" },
  { file: "data/new-images/Anglican Churches/Southfield/st-mark-southfield.png", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "14" },
  { file: "data/new-images/Anglican Churches/St Ann's Bay/St.-Anns-Bay-Parish-Church-Hall-St.-Ann.jpg", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "6" },
  { file: "data/new-images/Anglican Churches/St Ann's Bay/st-anns-bay-2.png", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "7" },
  { file: "data/new-images/Anglican Churches/St Ann's Bay/st-anns-bay-3.png", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "8" },
  { file: "data/new-images/Anglican Churches/St Ann's Bay/st-anns-bay-4.png", church_id: "st-ann-parish-church-st-ann-s-bay-st-ann", caption: "St. Ann Parish Church, St. Ann's Bay", order: "9" },
  { file: "data/new-images/Annotto Bay/St_James_1.jpg", church_id: "st-james-annotto-bay-st-mary", caption: "St. James', Annotto Bay", order: "1" },
  { file: "data/new-images/ArthursSeat/Arthurs_Seat_1.jpg", church_id: "st-michael-s-arthurs-seat-clarendon", caption: "St. Michael's, Arthur's Seat", order: "1" },
  { file: "data/new-images/AugustTown/GoodShepherd/Good_Shepherd_1.jpg", church_id: "church-of-the-good-shepherd-constant-spring-st-andrew", caption: "Church of the Good Shepherd, Constant Spring", order: "4" },
  { file: "data/new-images/AugustTown/GoodShepherd/Good_Shepherd_2.jpg", church_id: "church-of-the-good-shepherd-constant-spring-st-andrew", caption: "Church of the Good Shepherd, Constant Spring", order: "5" },
  { file: "data/new-images/AugustTown/GoodShepherd/Good_Shepherd_3.jpg", church_id: "church-of-the-good-shepherd-constant-spring-st-andrew", caption: "Church of the Good Shepherd, Constant Spring", order: "6" },
  { file: "data/new-images/AugustTown/StMargaret/St_Margaret_1.jpg", church_id: "st-margaret-s-liguanea-st-andrew", caption: "St. Margaret's, Liguanea", order: "7" },
  { file: "data/new-images/AugustTown/StMargaret/St_Margaret_2.jpg", church_id: "st-margaret-s-liguanea-st-andrew", caption: "St. Margaret's, Liguanea", order: "8" },
  { file: "data/new-images/AugustTown/StMargaret/St_Margaret_3.jpg", church_id: "st-margaret-s-liguanea-st-andrew", caption: "St. Margaret's, Liguanea", order: "9" },
  { file: "data/new-images/AugustTown/St_Cyprian_s_1.jpg", church_id: "st-cyprians-august-town-st-andrew", caption: "St Cyprian’s, August Town", order: "2" },
  { file: "data/new-images/BarbaryHall/Barbary_Hall_1.jpg", church_id: "st-paul-s-barbary-hall-st-elizabeth", caption: "St. Paul's, Barbary Hall", order: "3" },
  { file: "data/new-images/BarbaryHall/Barbary_Hall_2.jpg", church_id: "st-paul-s-barbary-hall-st-elizabeth", caption: "St. Paul's, Barbary Hall", order: "4" },
  { file: "data/new-images/Bath/St_Thomas_1.jpg", church_id: "st-thomas-bath-st-thomas", caption: "St. Thomas', Bath", order: "1" },
  { file: "data/new-images/Boscobel/St_Matthew_s_1.jpg", church_id: "st-matthew-s-boscobel-st-mary", caption: "St. Matthew's, Boscobel", order: "1" },
  { file: "data/new-images/Boston/St_Mark_s_1.jpg", church_id: "st-mark-s-boston-portland", caption: "St. Mark's, Boston", order: "1" },
  { file: "data/new-images/Boston/St_Mark_s_2.jpg", church_id: "st-mark-s-boston-portland", caption: "St. Mark's, Boston", order: "2" },
  { file: "data/new-images/Brampton/All_Souls_1.jpg", church_id: "all-souls-brompton-st-elizabeth", caption: "All Souls', Brompton", order: "1" },
  { file: "data/new-images/Buff Bay/St_George_s_1.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "4" },
  { file: "data/new-images/Buff Bay/St_George_s_2.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "5" },
  { file: "data/new-images/Buff Bay/St_George_s_3.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "6" },
  { file: "data/new-images/Buff Bay/St_George_s_4.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "7" },
  { file: "data/new-images/Buff Bay/St_George_s_5.jpg", church_id: "st-george-s-buff-bay-portland", caption: "St. George's, Buff Bay", order: "8" },
  { file: "data/new-images/Catadupa/St_Matthew_s_1.jpg", church_id: "st-matthew-s-catadupa-st-james", caption: "St. Matthew's, Catadupa", order: "3" },
  { file: "data/new-images/Catadupa/St_Matthew_s_2.jpg", church_id: "st-matthew-s-catadupa-st-james", caption: "St. Matthew's, Catadupa", order: "4" },
  { file: "data/new-images/Cavaliers/St. Christopher_s_1.jpg", church_id: "st-christopher-s-cavaliers-st-andrew", caption: "St. Christopher's, Cavaliers", order: "1" },
  { file: "data/new-images/Chapelton/St_Paul_s_1.jpg", church_id: "st-paul-s-chapelton-clarendon", caption: "St. Paul's, Chapelton", order: "7" },
  { file: "data/new-images/Chapelton/St_Paul_s_2.jpg", church_id: "st-paul-s-chapelton-clarendon", caption: "St. Paul's, Chapelton", order: "8" },
  { file: "data/new-images/Chapelton/St_Paul_s_3.jpg", church_id: "st-paul-s-chapelton-clarendon", caption: "St. Paul's, Chapelton", order: "9" },
  { file: "data/new-images/Chapelton/St_Paul_s_4.jpg", church_id: "st-paul-s-chapelton-clarendon", caption: "St. Paul's, Chapelton", order: "10" },
  { file: "data/new-images/ChesterCastle/Chester_Castle_1.jpg", church_id: "all-saints-chester-castle-st-james", caption: "All Saints', Chester Castle", order: "3" },
  { file: "data/new-images/ChesterCastle/Chester_Castle_2.jpg", church_id: "all-saints-chester-castle-st-james", caption: "All Saints', Chester Castle", order: "4" },
  { file: "data/new-images/Chichester/Chichester_1.jpg", church_id: "st-saviour-s-chichester-st-james", caption: "St. Saviour's, Chichester", order: "3" },
  { file: "data/new-images/Chichester/Chichester_2.jpg", church_id: "st-saviour-s-chichester-st-james", caption: "St. Saviour's, Chichester", order: "4" },
  { file: "data/new-images/Clark_s_Town/Clark_s_Town_1.jpg", church_id: "st-michael-s-clarks-town-trelawny", caption: "St. Michael's, Clarks Town", order: "2" },
  { file: "data/new-images/Craighton/St_Mark_s_1.jpg", church_id: "st-mark-s-craighton-st-andrew", caption: "St. Mark’s, Craighton", order: "5" },
  { file: "data/new-images/Craighton/St_Mark_s_2.jpg", church_id: "st-mark-s-craighton-st-andrew", caption: "St. Mark’s, Craighton", order: "6" },
  { file: "data/new-images/Craighton/St_Mark_s_3.jpg", church_id: "st-mark-s-craighton-st-andrew", caption: "St. Mark’s, Craighton", order: "7" },
  { file: "data/new-images/Craighton/St_Mark_s_4.jpg", church_id: "st-mark-s-craighton-st-andrew", caption: "St. Mark’s, Craighton", order: "8" },
  { file: "data/new-images/Crawford/St_Barnabas_1.jpg", church_id: "st-barnabas-s-crawford-st-elizabeth", caption: "St. Barnabas', Crawford", order: "3" },
  { file: "data/new-images/Crawford/St_Barnabas_2.jpg", church_id: "st-barnabas-s-crawford-st-elizabeth", caption: "St. Barnabas', Crawford", order: "4" },
  { file: "data/new-images/CroftsHill/All_Saints_1.jpg", church_id: "all-saints-crofts-hill-clarendon", caption: "All Saints, Crofts Hill", order: "4" },
  { file: "data/new-images/CroftsHill/All_Saints_2.jpg", church_id: "all-saints-crofts-hill-clarendon", caption: "All Saints, Crofts Hill", order: "5" },
  { file: "data/new-images/CroftsHill/All_Saints_3.jpg", church_id: "all-saints-crofts-hill-clarendon", caption: "All Saints, Crofts Hill", order: "6" },
  { file: "data/new-images/Falmouth/Falmouth_2.jpg", church_id: "st-peter-s-parish-church-falmouth-trelawny", caption: "St. Peter's (Parish Church), Falmouth", order: "2" },
  { file: "data/new-images/Falmouth/Falmouth_3.jpg", church_id: "st-peter-s-parish-church-falmouth-trelawny", caption: "St. Peter's (Parish Church), Falmouth", order: "3" },
  { file: "data/new-images/Gilnock/gilnock-5.jpg", church_id: "st-andrew-s-gilnock-st-elizabeth", caption: "St. Andrew's, Gilnock", order: "12" },
  { file: "data/new-images/GrangeGlenislay/St_James_1.jpg", church_id: "st-james-grange-westmoreland", caption: "St. James', Grange", order: "2" },
  { file: "data/new-images/GrangeHill/Holy_Trinity_1.jpg", church_id: "holy-trinity-grange-hill-westmoreland", caption: "Holy Trinity, Grange Hill", order: "4" },
  { file: "data/new-images/HarbourView/Harbour-View_1.jpg", church_id: "st-boniface-harbour-view-kingston", caption: "St. Boniface, Harbour View", order: "2" },
  { file: "data/new-images/Hope Bay/St_Peter_s_1.jpg", church_id: "st-peter-s-hope-bay-portland", caption: "St. Peter's, Hope Bay", order: "1" },
  { file: "data/new-images/Hope Bay/St_Peter_s_2.jpg", church_id: "st-peter-s-hope-bay-portland", caption: "St. Peter's, Hope Bay", order: "2" },
  { file: "data/new-images/JacksonTown/St_Matthew_s_1.jpg", church_id: "st-matthew-s-jackson-town-trelawny", caption: "St. Matthew's, Jackson Town", order: "2" },
  { file: "data/new-images/Kingston/All Saints/Screenshot 2026-04-16 130539 all saints.jpg", church_id: "all-saints-west-branch-kingston", caption: "All Saints', West Street", order: "3" },
  { file: "data/new-images/Kingston/All Saints/Screenshot 2026-04-16 130656 all saints.jpg", church_id: "all-saints-west-branch-kingston", caption: "All Saints', West Street", order: "4" },
  { file: "data/new-images/Kingston/Kingston Parish Church/Kingston_Parish_Google_Street.jpg", church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church (St. Thomas the Apostle), Kingston (Parade/King St)", order: "6" },
  { file: "data/new-images/Kingston/Kingston Parish Church/Screenshot 2026-04-16 111722.jpg", church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church (St. Thomas the Apostle), Kingston (Parade/King St)", order: "7" },
  { file: "data/new-images/Kingston/Kingston Parish Church/Screenshot 2026-04-16 111859.jpg", church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church (St. Thomas the Apostle), Kingston (Parade/King St)", order: "8" },
  { file: "data/new-images/Kingston/Kingston Parish Church/Screenshot 2026-04-16 111931.jpg", church_id: "kingston-parish-church-st-thomas-the-apostle-kingston-parade-king-st-kingston", caption: "Kingston Parish Church (St. Thomas the Apostle), Kingston (Parade/King St)", order: "9" },
  { file: "data/new-images/Kingston/St George's/2565263.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "7" },
  { file: "data/new-images/Kingston/St George's/st.georges-1.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "8" },
  { file: "data/new-images/Kingston/St George's/st.georges-2.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "9" },
  { file: "data/new-images/Kingston/St George's/st.georges-3.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "10" },
  { file: "data/new-images/Kingston/St George's/st.georges-4.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "11" },
  { file: "data/new-images/Kingston/St Matthew's/St_Matthew's.jpg", church_id: "st-matthew-s-allman-town-kingston", caption: "St. Matthew's, Allman Town", order: "2" },
  { file: "data/new-images/Kingston/St Michael's/St_Michael's.jpg", church_id: "st-michael-s-church-hannah-town-kingston", caption: "St. Michael & All Angels, Victoria Ave", order: "2" },
  { file: "data/new-images/Kingston/St Patrick's/St_Patrick_Kingston.jpg", church_id: "st-patrick-s-windward-road-kingston", caption: "St. Patrick's, Windward Road", order: "2" },
  { file: "data/new-images/Linstead/St-George_s_1.jpg", church_id: "church-of-the-holy-trinity-linstead-st-catherine", caption: "Church of the Holy Trinity, Linstead", order: "1" },
  { file: "data/new-images/Malvern/St_Mary_s_1.jpg", church_id: "st-mary-s-malvern-st-elizabeth", caption: "St. Mary's, Malvern", order: "4" },
  { file: "data/new-images/Malvern/St_Mary_s_2.jpg", church_id: "st-mary-s-malvern-st-elizabeth", caption: "St. Mary's, Malvern", order: "5" },
  { file: "data/new-images/Malvern/St_Mary_s_3.jpg", church_id: "st-mary-s-malvern-st-elizabeth", caption: "St. Mary's, Malvern", order: "6" },
  { file: "data/new-images/MalvernSouthfield/Malvern_1.jpg", church_id: "st-mary-s-malvern-st-elizabeth", caption: "St. Mary's, Malvern", order: "7" },
  { file: "data/new-images/Manchioneal/St_Thomas_1.jpg", church_id: "st-thomas-manchioneal-portland", caption: "St. Thomas', Manchioneal", order: "1" },
  { file: "data/new-images/Margarets Bay/St_Stephen_s_1.jpg", church_id: "st-stephen-s-church-st-margaret-s-bay-portland", caption: "St. Stephen's Church, St. Margaret's Bay", order: "1" },
  { file: "data/new-images/Marley/Marley_1.jpg", church_id: "st-andrew-s-marley-hill-st-catherine", caption: "St. Andrew's, Marley Hill", order: "2" },
  { file: "data/new-images/Mocho/St_Paul_s_1.jpg", church_id: "st-paul-s-mocho-clarendon", caption: "St. Paul's, Mocho", order: "6" },
  { file: "data/new-images/Mocho/St_Paul_s_2.jpg", church_id: "st-paul-s-mocho-clarendon", caption: "St. Paul's, Mocho", order: "7" },
  { file: "data/new-images/Mocho/St_Paul_s_3.jpg", church_id: "st-paul-s-mocho-clarendon", caption: "St. Paul's, Mocho", order: "8" },
  { file: "data/new-images/Mocho/St_Paul_s_4.jpg", church_id: "st-paul-s-mocho-clarendon", caption: "St. Paul's, Mocho", order: "9" },
  { file: "data/new-images/Mocho/St_Paul_s_5.jpg", church_id: "st-paul-s-mocho-clarendon", caption: "St. Paul's, Mocho", order: "10" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154522_509_1776285929849_photo_optimized Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "10" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154624_511_1776285992321_photo_optimized Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "11" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154648_512_1776286015759_photo_optimized Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "12" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154714_513_1776286048412_photo_optimized Copy(1).JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "13" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154714_513_1776286048412_photo_optimized Copy(2).JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "14" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154714_513_1776286048412_photo_optimized Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "15" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154808_517_1776286138319_photo_optimized Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "16" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154848_518_1776286134732_photo_optimized Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "17" },
  { file: "data/new-images/Moneague/dji_fly_20260415_154950_519_1776286197367_photo_optimized Copy Copy.JPG", church_id: "christ-church-moneague-st-ann", caption: "Christ Church, Moneague", order: "18" },
  { file: "data/new-images/Montpelier/St_Mary_s_1.jpg", church_id: "st-mary-s-montpelier-st-james", caption: "St. Mary's, Montpelier", order: "6" },
  { file: "data/new-images/Montpelier/St_Mary_s_2.jpg", church_id: "st-mary-s-montpelier-st-james", caption: "St. Mary's, Montpelier", order: "7" },
  { file: "data/new-images/Montpelier/St_Mary_s_3.jpg", church_id: "st-mary-s-montpelier-st-james", caption: "St. Mary's, Montpelier", order: "8" },
  { file: "data/new-images/Montpelier/St_Mary_s_4.jpg", church_id: "st-mary-s-montpelier-st-james", caption: "St. Mary's, Montpelier", order: "9" },
  { file: "data/new-images/Montpelier/St_Mary_s_5.jpg", church_id: "st-mary-s-montpelier-st-james", caption: "St. Mary's, Montpelier", order: "10" },
  { file: "data/new-images/Morningside/St_David_s_1.jpg", church_id: "st-david-s-morningside-st-elizabeth", caption: "St. David's, Morningside", order: "3" },
  { file: "data/new-images/MountHermon/Mount_Hermon_1.jpg", church_id: "st-james-mount-hermon-st-elizabeth", caption: "St. James', Mount Hermon", order: "3" },
  { file: "data/new-images/MountHermon/Mount_Hermon_2.jpg", church_id: "st-james-mount-hermon-st-elizabeth", caption: "St. James', Mount Hermon", order: "4" },
  { file: "data/new-images/Nain/St_Stephen_s_1.jpg", church_id: "st-stephen-s-nain-st-elizabeth", caption: "St. Stephen's, Nain", order: "4" },
  { file: "data/new-images/Nain/St_Stephen_s_2.jpg", church_id: "st-stephen-s-nain-st-elizabeth", caption: "St. Stephen's, Nain", order: "5" },
  { file: "data/new-images/Nain/St_Stephen_s_3.jpg", church_id: "st-stephen-s-nain-st-elizabeth", caption: "St. Stephen's, Nain", order: "6" },
  { file: "data/new-images/NewRoads/St_James_1.jpg", church_id: "st-james-new-roads-westmoreland-westmoreland", caption: "St. James', New Roads (Westmoreland)", order: "2" },
  { file: "data/new-images/Orange Bay/St_Dunstan_s_1.jpg", church_id: "st-dunstan-s-orange-bay-portland", caption: "St. Dunstan's, Orange Bay", order: "1" },
  { file: "data/new-images/Port Antonio/Christ-Church_1.jpg", church_id: "christ-church-parish-church-port-antonio-portland", caption: "Christ Church (Parish Church), Port Antonio", order: "2" },
  { file: "data/new-images/Port Antonio/Christ-Church_2.jpg", church_id: "christ-church-parish-church-port-antonio-portland", caption: "Christ Church (Parish Church), Port Antonio", order: "3" },
  { file: "data/new-images/Port Maria/Port_maria_parish_church_1.jpg", church_id: "st-mary-parish-church-port-maria-st-mary", caption: "St. Mary (Parish Church), Port Maria", order: "2" },
  { file: "data/new-images/Port Maria/Port_maria_parish_church_2.jpg", church_id: "st-mary-parish-church-port-maria-st-mary", caption: "St. Mary (Parish Church), Port Maria", order: "3" },
  { file: "data/new-images/Port Maria/Port_maria_parish_church_3.jpg", church_id: "st-mary-parish-church-port-maria-st-mary", caption: "St. Mary (Parish Church), Port Maria", order: "4" },
  { file: "data/new-images/Port Morant/St_Barnabas_1.jpg", church_id: "st-barnabas-port-morant-st-thomas", caption: "St. Barnabas', Port Morant", order: "1" },
  { file: "data/new-images/PortRoyal/Screenshot 2026-04-16 000732.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal", order: "7" },
  { file: "data/new-images/PortRoyal/Screenshot 2026-04-16 000908.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal", order: "8" },
  { file: "data/new-images/PortRoyal/Screenshot 2026-04-16 001004.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal", order: "9" },
  { file: "data/new-images/PortRoyal/Screenshot 2026-04-16 001101.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal", order: "10" },
  { file: "data/new-images/PortRoyal/Screenshot 2026-04-16 001124.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal", order: "11" },
  { file: "data/new-images/PortRoyal/Screenshot 2026-04-16 001155.jpg", church_id: "st-peter-s-port-royal-kingston", caption: "St. Peter's, Port Royal", order: "12" },
  { file: "data/new-images/RioBueno/Rio_bueno_10.jpg", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "10" },
  { file: "data/new-images/RioBueno/drone_1.png", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "11" },
  { file: "data/new-images/RioBueno/drone_2.png", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "12" },
  { file: "data/new-images/RioBueno/drone_3.png", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "13" },
  { file: "data/new-images/RioBueno/drone_4.png", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "14" },
  { file: "data/new-images/RioBueno/drone_5.png", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "15" },
  { file: "data/new-images/RioBueno/drone_6.png", church_id: "st-mark-s-rio-bueno-trelawny", caption: "St. Mark's, Rio Bueno", order: "16" },
  { file: "data/new-images/SantaCruz/Santa_Cruz_1.jpg", church_id: "st-matthew-s-santa-cruz-st-elizabeth", caption: "St. Matthew's, Santa Cruz", order: "2" },
  { file: "data/new-images/Sligoville/St_John_s_1.jpg", church_id: "st-john-s-sligoville-st-catherine", caption: "St. John's, Sligoville", order: "1" },
  { file: "data/new-images/Sligoville/St_John_s_2.jpg", church_id: "st-john-s-sligoville-st-catherine", caption: "St. John's, Sligoville", order: "2" },
  { file: "data/new-images/Sligoville/St_John_s_3.jpg", church_id: "st-john-s-sligoville-st-catherine", caption: "St. John's, Sligoville", order: "3" },
  { file: "data/new-images/Sligoville/St_John_s_4.jpg", church_id: "st-john-s-sligoville-st-catherine", caption: "St. John's, Sligoville", order: "4" },
  { file: "data/new-images/St Silas/St_Silas_1.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "8" },
  { file: "data/new-images/StewartTown/Stewart_Town_1.jpg", church_id: "st-thomas-stewart-town-trelawny", caption: "St. Thomas', Stewart Town", order: "2" },
  { file: "data/new-images/Troy/St_Silas_2.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "9" },
  { file: "data/new-images/Troy/St_Silas_3.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "10" },
  { file: "data/new-images/Troy/St_Silas_4.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "11" },
  { file: "data/new-images/Troy/St_Silas_5.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "12" },
  { file: "data/new-images/Troy/St_Silas_6.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "13" },
  { file: "data/new-images/Troy/St_Silas_7.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "14" },
  { file: "data/new-images/Vere/St_Saviour_s_1.jpg", church_id: "st-saviour-s-milk-river-clarendon", caption: "St. Saviour's, Milk River", order: "1" },
  { file: "data/new-images/Wait_a_bit/Wait_a_bit_1.jpg", church_id: "st-peter-s-wait-a-bit-trelawny", caption: "St. Peter's, Wait-a-Bit", order: "2" },
  { file: "data/new-images/Warsop/St_Barnabas_1.jpg", church_id: "st-barnabas-warsop-trelawny", caption: "St. Barnabas', Warsop", order: "4" },
  { file: "data/new-images/Warsop/St_Barnabas_2.jpg", church_id: "st-barnabas-warsop-trelawny", caption: "St. Barnabas', Warsop", order: "5" },
  { file: "data/new-images/Warsop/St_Barnabas_3.jpg", church_id: "st-barnabas-warsop-trelawny", caption: "St. Barnabas', Warsop", order: "6" },
  { file: "data/new-images/Woodford/St_Mary_3.jpg", church_id: "st-mary-s-church-woodford-st-andrew", caption: "St. Mary's Church, Woodford", order: "3" },
  { file: "data/new-images/Woodford/St_Mary_s_1.jpg", church_id: "st-mary-s-church-woodford-st-andrew", caption: "St. Mary's Church, Woodford", order: "4" },
  { file: "data/new-images/Woodford/St_Mary_s_2.jpg", church_id: "st-mary-s-church-woodford-st-andrew", caption: "St. Mary's Church, Woodford", order: "5" },
  { file: "data/new-images/Yallah's/St_David_s_1.jpg", church_id: "st-david-s-yallahs-st-thomas", caption: "St. David's, Yallahs", order: "1" },
  { file: "data/new-images/Yallah's/St_David_s_2.jpg", church_id: "st-david-s-yallahs-st-thomas", caption: "St. David's, Yallahs", order: "2" },

  // === auto-appended batch (2026-04 #2) ===
  { file: "data/new-images/Clarendon parish/Alley Clarendon/St_Peter_s_4.jpg", church_id: "st-peter-s-church-alley-clarendon", caption: "St. Peter's Church, Alley", order: "7" },
  { file: "data/new-images/Hanover parish/Lucea/Lucea_5.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "14" },
  { file: "data/new-images/Hanover parish/Lucea/Lucea_6.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "15" },
  { file: "data/new-images/Hanover parish/Lucea/Lucea_7.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "16" },
  { file: "data/new-images/Hanover parish/Lucea/Lucea_8.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "17" },
  { file: "data/new-images/Hanover parish/Lucea/lucea_3.webp", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "18" },
  { file: "data/new-images/Hanover parish/Lucea/lucea_4.jpg", church_id: "hanover-parish-church-lucea-hanover", caption: "Hanover Parish Church, Lucea", order: "19" },
  { file: "data/new-images/Kingston parish/HarbourView/St_Boniface_1.jpg", church_id: "st-boniface-harbour-view-kingston", caption: "St. Boniface, Harbour View", order: "3" },
  { file: "data/new-images/Kingston parish/HarbourView/St_Boniface_2.jpg", church_id: "st-boniface-harbour-view-kingston", caption: "St. Boniface, Harbour View", order: "4" },
  { file: "data/new-images/Kingston parish/St George's/St_George_s_1.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "12" },
  { file: "data/new-images/Kingston parish/St George's/St_George_s_2.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "13" },
  { file: "data/new-images/Kingston parish/St George's/St_George_s_3.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "14" },
  { file: "data/new-images/Kingston parish/St George's/St_George_s_4.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "15" },
  { file: "data/new-images/Kingston parish/St George's/St_George_s_5.jpg", church_id: "st-george-s-church-83-east-street-kingston", caption: "St. George's Church, 83 East Street", order: "16" },
  { file: "data/new-images/Manchester parish/Snowdon, Manchester/St_David_s_1.jpg", church_id: "st-david-s-snowdon-manchester", caption: "St. David's, Snowdon", order: "1" },
  { file: "data/new-images/Portland parish/StMargaret/St_Stephen_s_2.jpg", church_id: "st-stephen-s-church-st-margaret-s-bay-portland", caption: "St. Stephen's Church, St. Margaret's Bay", order: "2" },
  { file: "data/new-images/Portland parish/StMargaret/St_Stephen_s_3.jpg", church_id: "st-stephen-s-church-st-margaret-s-bay-portland", caption: "St. Stephen's Church, St. Margaret's Bay", order: "3" },
  { file: "data/new-images/St Elizabeth parish/Balaclava/St_Luke_s_1.png", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "8" },
  { file: "data/new-images/St Elizabeth parish/Balaclava/St_Luke_s_2.jpg", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "9" },
  { file: "data/new-images/St Elizabeth parish/Balaclava/St_Luke_s_3.jpg", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "10" },
  { file: "data/new-images/St Elizabeth parish/Balaclava/St_Luke_s_4.jpg", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "11" },
  { file: "data/new-images/St Elizabeth parish/Balaclava/St_luke_s_5.jpg", church_id: "st-luke-s-balaclava-st-elizabeth", caption: "St. Luke's, Balaclava", order: "12" },
  { file: "data/new-images/St Elizabeth parish/Siloah/siloah-1.webp", church_id: "st-barnabas-siloah-st-elizabeth", caption: "St. Barnabas', Siloah", order: "4" },
  { file: "data/new-images/St Elizabeth parish/Siloah/siloah-2.jpg", church_id: "st-barnabas-siloah-st-elizabeth", caption: "St. Barnabas', Siloah", order: "5" },
  { file: "data/new-images/St Elizabeth parish/Siloah/siloah-3.jpg", church_id: "st-barnabas-siloah-st-elizabeth", caption: "St. Barnabas', Siloah", order: "6" },
  { file: "data/new-images/St James parish/Adelphi St James/Christ_Church_Marley_1.jpg", church_id: "christ-church-adelphi-st-james", caption: "Christ Church, Adelphi", order: "1" },
  { file: "data/new-images/St Mary parish/Belfield/St_Michael_s_1.jpg", church_id: "st-michael-s-belfield-st-mary", caption: "St. Michael's, Belfield", order: "1" },
  { file: "data/new-images/St Mary parish/Belfield/St_Michael_s_2.jpg", church_id: "st-michael-s-belfield-st-mary", caption: "St. Michael's, Belfield", order: "2" },
  { file: "data/new-images/St. Elizabeth parish/MountHermon Parsonage/St_James_1.jpg", church_id: "st-james-mount-hermon-st-elizabeth", caption: "St. James', Mount Hermon", order: "5" },
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mark_s_Southfield_1.png", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "15" },
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mark_s_Southfield_2.jpeg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "16" },
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mark_s_Southfield_3.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "17" },
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mark_s_Southfield_4.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "18" },
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mark_s_Southfield_5.png", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "19" },
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mark_s_Southfield_6.jpg", church_id: "st-mark-s-mayfield-st-elizabeth", caption: "St. Mark's, Mayfield", order: "20" },
  { file: "data/new-images/Trelawny parish/Troy/St_Silas_8.jpg", church_id: "st-silas-s-troy-trelawny", caption: "St. Silas', Troy", order: "15" },
  { file: "data/new-images/Westmoreland parish/Darliston/St_John_s_1.jpg", church_id: "st-john-s-darliston-westmoreland", caption: "St. John's, Darliston", order: "1" },
  { file: "data/new-images/Westmoreland parish/NewHope/St_Paul_s_1.jpg", church_id: "st-paul-s-little-london-westmoreland", caption: "St. Paul's, Little London", order: "1" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_1.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "12" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_2.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "13" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_3.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "14" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_4.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "15" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_5.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "16" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_6.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "17" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_7.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "18" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_8.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "19" },
  { file: "data/new-images/Westmoreland parish/Savannah-la-Mar/St_George_s_9.jpg", church_id: "st-george-s-savanna-la-mar-parish-church-westmoreland", caption: "St. George's, Savanna-la-Mar (Parish Church)", order: "20" },

  // === auto-appended batch (2026-04 #3) ===
  { file: "data/new-images/St. Elizabeth parish/Southfield/St_Mary_1.jpg", church_id: "st-mary-s-southfield-st-elizabeth", caption: "St. Mary's, Southfield", order: "1" },

  // === auto-appended batch (2026-04 #4 hopewell) ===
  { file: "data/new-images/Westmoreland parish/Hopewell/St_Mark_s_1.jpg", church_id: "st-mark-s-hopewell-westmoreland", caption: "St. Mark's, Hopewell", order: "1" },
  { file: "data/new-images/Westmoreland parish/Hopewell/St_Mark_s_2.jpg", church_id: "st-mark-s-hopewell-westmoreland", caption: "St. Mark's, Hopewell", order: "2" },
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
