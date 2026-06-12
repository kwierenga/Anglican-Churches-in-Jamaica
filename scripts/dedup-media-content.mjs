// One-off: remove content-duplicate image rows found by find-dup-media.mjs
// (md5 of downloaded bytes, run 2026-06-12). For each duplicate group the
// earliest-attributed row is kept; the later copies (almost all from the
// v1777120xxx bulk re-upload batch) are dropped, and `order` is renumbered
// per church. Cross-church groups resolved to the earlier attribution:
//   St. Margaret's Liguanea (kept) / St. Stephen's St. Margaret's Bay (dropped x2)
//   St. Andrew's Marley Hill (kept) / Christ Church Adelphi (dropped, -> no photos)
//   St. Helena's Sheffield (kept) / St. Paul's Little London (dropped)
import { readFileSync, writeFileSync } from 'fs'

const DROP_LINES = new Set([
  441, 439, 442, 438, 440,             // st-george-s east street
  435, 429, 433, 43, 45, 434, 432,     // hanover parish church lucea
  456, 458, 457, 454, 460, 455, 459,   // st-george-s savanna-la-mar
  96,                                  // st-andrew-s gilnock
  444, 443, 445,                       // st-luke-s balaclava
  422, 423, 424,                       // kingston parish church
  437,                                 // st-boniface harbour view
  416, 419, 418, 417,                  // st-peter-s port royal
  336, 337,                            // st-stephen-s st-margaret's bay (cross: liguanea)
  209,                                 // st-barnabas siloah
  450, 449, 452, 451,                  // st-mark-s mayfield
  446,                                 // st-james mount hermon
  352,                                 // christ church adelphi (cross: marley hill)
  453,                                 // st-silas-s troy
  356,                                 // st-paul-s little london (cross: sheffield)
  431,                                 // st-peter-s alley
])

const lines = readFileSync('data/media.csv', 'utf8').split(/\r?\n/)
const out = []
const counters = new Map()
for (let i = 0; i < lines.length; i++) {
  const lineNo = i + 1
  const line = lines[i]
  if (line === '' && i === lines.length - 1) continue // trailing newline
  if (lineNo === 1) { out.push(line); continue }
  if (DROP_LINES.has(lineNo)) continue
  const churchId = line.slice(0, line.indexOf(','))
  const n = (counters.get(churchId) || 0) + 1
  counters.set(churchId, n)
  out.push(line.replace(/,\d+$/, `,${n}`))
}
writeFileSync('data/media.csv', out.join('\n') + '\n')
console.log(`kept ${out.length - 1} rows (dropped ${lines.filter(Boolean).length - out.length})`)
