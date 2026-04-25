#!/usr/bin/env python
"""Download photos referenced in jamaicanancestralrecords-report.md, hash-compare
against any existing local photos for that church (in data/new-images and
data/hurricane-melissa-2025), classify each as DUP or NEW, and emit:
- a TS snippet of new IMAGE_MAP entries (for the upload-new-images pipeline)
- a JSON list of media.csv credit updates to apply to existing rows

The 'reference URL' (the JAR detail page) goes into the credit field.
License is set to 'Fair use'.
"""
import csv
import hashlib
import io
import json
import os
import re
import sys
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEW_IMG = os.path.join(ROOT, "data/new-images")
HURRICANE = os.path.join(ROOT, "data/hurricane-melissa-2025")
MEDIA = os.path.join(ROOT, "data/media.csv")
CHURCHES = os.path.join(ROOT, "data/churches.csv")

# (church_id, detail_url, [image URLs])
JAR_ENTRIES = [
    ("st-paul-s-chapelton-clarendon",
     "https://jamaicanancestralrecords.com/parishes-2/clarendon-2/st-pauls-anglican-chapleton-clarendon/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/05/st-pauls-chapleton.png"]),
    ("st-matthew-s-aenon-town-clarendon",
     "https://jamaicanancestralrecords.com/parishes-2/clarendon-2/st-matthews-anglican-aenon-town-clarendon/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/09/st-matthews-aenon-town.png"]),
    ("st-paul-s-mocho-clarendon",
     "https://jamaicanancestralrecords.com/parishes-2/clarendon-2/st-pauls-anglican-mocho-clarendon/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/10/st-pauls-anglican-mocho.png"]),
    ("st-peter-s-church-alley-clarendon",
     "https://jamaicanancestralrecords.com/parishes-2/clarendon-2/st-peters-anglican-alley-vere-clarendon/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-peters-anglican.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-peters-alley-back.png"]),
    ("st-peter-s-port-royal-kingston",
     "https://jamaicanancestralrecords.com/parishes-2/kingston/st-peters-anglican-port-royal-kingston/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2018/10/st-peters-port-royal.png"]),
    ("christ-church-christiana-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/christ-church-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/christ-church-2.png"]),
    ("st-jude-s-pratville-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/pratville-anglican-manchester/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/01/pratville-anglican.png"]),
    ("st-augustine-s-porus-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-augustines-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-augustines-anglican.png"]),
    ("st-david-s-snowdon-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-davids-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-davids-snowdon.png"]),
    ("st-james-s-craighead-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-james-anglican-manchester/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/05/st-james-craighead-2.png"]),
    ("st-john-the-baptist-s-coleyville-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-john-the-baptist/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-john-the-baptist.png"]),
    ("st-luke-s-smithfield-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-lukes-anglican-manchester/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/01/st-lukes-smithfield.png"]),
    ("st-paul-s-keynsham-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-pauls-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/06/st-pauls-keynsham.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2014/06/st-pauls-keynsham-b.png"]),
    ("st-philip-s-old-england-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-philips-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-philips-anglican.png"]),
    ("st-simon-s-comfort-hall-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-simons-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/01/st-simons-anglican.png"]),
    ("st-stephen-s-chantilly-manchester",
     "https://jamaicanancestralrecords.com/parishes-2/manchester-2/st-stephens-anglican-chantilly-manchester/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/06/st-stephens-chantilly.png"]),
    ("christ-church-parish-church-port-antonio-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/christ-church-anglican-port-antonio/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/christ-church-portland-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/christ-church-portland-2.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/christ-church-portland-3.png"]),
    ("st-dunstan-s-orange-bay-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/saint-dunstans/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/saint-dunstans-portland.png"]),
    ("st-george-s-buff-bay-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/saint-georges/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/st-georges-portland-2.png"]),
    ("st-mark-s-boston-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/saint-marks/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/st-marks-boston-portland-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/st-marks-boston-portland-2.png"]),
    ("st-peter-s-hope-bay-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/saint-peters/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/01/st-peters-portland-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2016/01/st-peters-portland-2.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2016/01/st-peters-portland-3.png"]),
    ("st-stephen-s-church-st-margaret-s-bay-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/saint-stephens/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/st-stephens-portland-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/st-stephens-portland-2.png"]),
    ("st-thomas-manchioneal-portland",
     "https://jamaicanancestralrecords.com/parishes-2/portland-2/saint-thomas/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/12/st-thomas-manchioneal-portland-1.png"]),
    ("st-andrew-parish-church-half-way-tree-st-andrew",
     "https://jamaicanancestralrecords.com/parishes-2/st-andrew-2/st-andrew-parish-church-half-way-tree-st-andrew/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2023/05/st-andrew-parish-church-st-andrew.jpg"]),
    ("st-james-mount-james-st-andrew",
     "https://jamaicanancestralrecords.com/parishes-2/st-andrew-2/st-james-anglican-mt-james-st-andrew/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/02/st-james-angl-mount-james-st-andrew.png"]),
    ("st-jude-s-stony-hill-st-andrew",
     "https://jamaicanancestralrecords.com/parishes-2/st-andrew-2/st-judes-anglican-stony-hill-st-andrew/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/st-judes-anglican-stony-hill.png"]),
    ("st-ann-parish-church-st-ann-s-bay-st-ann",
     "https://jamaicanancestralrecords.com/parishes-2/st-ann-2/st-ann-parish-church-st-anns-bay-st-ann/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-ann-parish-church.png"]),
    ("st-luke-s-aboukir-st-ann",
     "https://jamaicanancestralrecords.com/parishes-2/st-ann-2/st-lukes-anglican-aboukir-st-ann/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/10/st-lukes-anglican-aboukir.png"]),
    ("st-mark-s-church-brown-s-town-st-ann",
     "https://jamaicanancestralrecords.com/parishes-2/st-ann-2/st-marks-anglican-browns-town-st-ann/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/04/st-marks-browns-town.png"]),
    ("all-saints-bellas-gate-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/all-saints-anglican-bellas-gate-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/03/all-saints-bellas-gate.png"]),
    ("st-dorothy-s-church-old-harbour-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-dorothys-anglican-old-harbour-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-dorothys-st-catherine.png"]),
    ("st-george-s-point-hill-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-georges-anglican-point-hill-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/03/st-georges-point-hill.png"]),
    ("st-john-s-opc-guanaboa-vale-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-johns-anglican-guanoboa-vale-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/03/st-johns-guanaboa-vale.png"]),
    ("st-peter-s-lluidas-vale-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-peters-anglican-lluidas-vale-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/03/st-peters-lluidas-vale-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2016/03/st-peters-lluidas-vale-2.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2016/03/st-peters-lluidas-vale-3.png"]),
    ("st-phillip-s-morris-hall-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-phillips-anglican-morris-hall-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/12/st-phillips-morris-hall.png"]),
    ("ss-simon-and-jude-ewarton-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-simon-st-judes-ewarton-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2019/09/st-simon-st-judes-ewarton.png"]),
    ("st-thomas-ye-vale-bog-walk-st-catherine",
     "https://jamaicanancestralrecords.com/parishes-2/st-catherine-2/st-thomas-ye-vale-anglican-church-road-bog-walk-st-catherine/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2016/12/st-thomas-ye-vale-old-harbour.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2016/12/st-thomas-ye-vale-old-harbour-2.png"]),
    ("all-souls-brompton-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/all-souls-anglican-brompton-st-elizabeth/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/12/all-souls-brompton.png"]),
    ("st-andrew-s-gilnock-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-andrews-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-andrews-anglican.png"]),
    ("st-barnabas-s-crawford-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-barnabas-anglican-crawford-st-elizabeth/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/st-barnabas-crawford.png"]),
    ("st-barnabas-siloah-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-barnabas-anglican-siloah-st-elizabeth/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/06/st-barnabas-siloah.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2014/06/st-barnabas-siloah-2.png"]),
    ("st-john-s-parish-church-black-river-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-john-anglican-black-river-st-elizabeth/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/02/st-john-blk-river-1.png"]),
    ("st-luke-s-balaclava-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-lukes-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-lukes-anglican-balaclava.png"]),
    ("st-matthew-s-santa-cruz-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-matthews-anglican-st-elizabeth/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-matthews-anglican.png"]),
    ("st-peter-s-pedro-plains-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-peters-anglican-pedro-plains-st-elizabeth/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2018/07/st-peters-anglican-pedro-plains.png"]),
    ("st-stephen-s-nain-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-stephens-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/07/st-stephens-nain.png"]),
    ("st-thomas-lacovia-st-elizabeth",
     "https://jamaicanancestralrecords.com/parishes-2/st-elizabeth-2/st-thomas-anglican/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/06/st-thomas-lacovia.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2014/06/st-thomas-lacovia-2.png"]),
    ("st-james-parish-church-sam-sharpe-square-st-james",
     "https://jamaicanancestralrecords.com/parishes-2/st-james-2/st-james-parish-church-montego-bay-st-james/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2024/09/st-james-parish-church-montego-bay.png"]),
    ("st-mary-s-montpelier-st-james",
     "https://jamaicanancestralrecords.com/parishes-2/st-james-2/st-marys-anglican-montpelier-st-james/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-marys-anglican-st-james.png"]),
    ("st-james-annotto-bay-st-mary",
     "https://jamaicanancestralrecords.com/parishes-2/st-mary-2/st-james-anglican-annotto-bay-st-mary/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-james-angl-annotto-bay.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-james-angl-annotto-bay-2.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-james-angl-annotto-bay-3.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-james-angl-annotto-bay-4.png"]),
    ("st-mary-parish-church-port-maria-st-mary",
     "https://jamaicanancestralrecords.com/parishes-2/st-mary-2/st-marys-parish-church-port-maria-st-mary/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-mary-parish-church-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-mary-parish-church-2.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/06/st-mary-parish-church-3.png"]),
    ("st-matthew-s-boscobel-st-mary",
     "https://jamaicanancestralrecords.com/parishes-2/st-mary-2/st-matthews-anglican-st-mary/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-matthew-boscobel-1.png"]),
    ("christ-church-morant-bay-st-thomas",
     "https://jamaicanancestralrecords.com/parishes-2/st-thomas/christ-church-morant-bay-st-thomas/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/christ-church-morant-bay-1.png"]),
    ("st-david-s-yallahs-st-thomas",
     "https://jamaicanancestralrecords.com/parishes-2/st-thomas/st-davids-anglican-yallahs-st-thomas/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/st-davids-angl-yallahs-1.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/st-davids-angl-yallahs-2.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/st-davids-angl-yallahs-3.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2015/09/st-davids-angl-yallahs-4.png"]),
    ("st-andrew-s-albert-town-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-andrews-anglican-albert-town-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2015/07/st-andrews-anglican-albert-town.png"]),
    ("st-barnabas-warsop-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-barnabas-anglican-warsop-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/11/st-barnabas-warsop.png"]),
    ("st-mark-s-rio-bueno-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-marks-anglican-rio-bueno-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-marks-anglican-rio-bueno.png"]),
    ("st-matthew-s-jackson-town-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-matthews-anglican-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/11/st-matthews-trelawny.png"]),
    ("st-michael-s-clarks-town-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-michael-anglican-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/03/st-michael-clarks-town.png"]),
    ("st-peter-s-wait-a-bit-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-peters-anglican-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/11/st-peters-anglican-wait-a-bit.png"]),
    ("st-silas-s-troy-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-silas-anglican-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/05/st-silas-troy.png"]),
    ("st-thomas-stewart-town-trelawny",
     "https://jamaicanancestralrecords.com/parishes-2/trelawny-2/st-thomas-anglican-trelawny/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/10/st-thomas-angl-stewart-town.png"]),
    ("holy-trinity-grange-hill-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/church-of-the-holy-trinity-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/08/church-of-the-holy-trinity.png"]),
    ("st-barnabas-george-s-plain-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-barnabas-anglican-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/08/st-barnabas-georges-plain.png"]),
    ("st-george-s-savanna-la-mar-parish-church-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-georges-anglican-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/09/st-georges-sav.png"]),
    ("st-john-s-darliston-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-johns-anglican-darliston-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/08/st-johns-anglican.png"]),
    ("st-mark-s-hopewell-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-marks-anglican-hopewell-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/08/st-marks-hopewell.png"]),
    ("st-michael-s-kew-park-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-michaels-all-angels/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2014/08/st-michaels-all-angels-kew-park.png"]),
    ("st-paul-s-little-london-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-pauls-anglican-little-london-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2018/07/st-pauls-anglican.png",
      "https://jamaicanancestralrecords.com/wp-content/uploads/2018/07/st-pauls-anglican-2.png"]),
    ("st-peter-s-petersfield-westmoreland",
     "https://jamaicanancestralrecords.com/parishes-2/westmoreland/st-peters-anglican-petersfield-westmoreland/",
     ["https://jamaicanancestralrecords.com/wp-content/uploads/2018/08/st-peters-angl-petersfield.png"]),
]


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()[:16]


def file_sha(path: str) -> str:
    with open(path, "rb") as f:
        return sha(f.read())


# Build a hash → relative path index of every existing local image we have
# (in data/new-images/ and data/hurricane-melissa-2025/) so we can detect
# byte-identical content even when filenames differ.
LOCAL_HASHES = {}  # sha → relpath
for base, label in [(NEW_IMG, "new-images"), (HURRICANE, "hurricane-melissa-2025")]:
    if not os.path.isdir(base):
        continue
    for r, _, names in os.walk(base):
        for n in names:
            if os.path.splitext(n)[1].lower() not in (".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic", ".heif", ".gif"):
                continue
            full = os.path.join(r, n)
            try:
                LOCAL_HASHES.setdefault(file_sha(full), full)
            except OSError:
                pass

print(f"indexed {len(LOCAL_HASHES)} local images")

# Determine current max order per church_id from media.csv
existing_orders = defaultdict(set)
with open(MEDIA, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        cid = (row.get("church_id") or "").strip()
        order = (row.get("order") or "").strip()
        if cid and order.isdigit():
            existing_orders[cid].add(int(order))

# Stage downloads → local cache
CACHE = os.path.join(ROOT, "data/jar-photos")
os.makedirs(CACHE, exist_ok=True)


def fetch(url: str, dest: str) -> bytes:
    """Download URL to dest (cached). Return raw bytes."""
    if os.path.exists(dest):
        with open(dest, "rb") as f:
            return f.read()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research script)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    with open(dest, "wb") as f:
        f.write(data)
    return data


# Main loop
new_uploads = []   # (cid, src_url, ref_url, local_stage_path, order)
dup_updates = []   # (existing_local_path, ref_url, src_url)
download_errors = []

stage_root = os.path.join(NEW_IMG, "_jar_inbox")
os.makedirs(stage_root, exist_ok=True)

for cid, ref_url, image_urls in JAR_ENTRIES:
    used = set(existing_orders[cid])
    for img_url in image_urls:
        fname = img_url.rsplit("/", 1)[-1]
        cache_path = os.path.join(CACHE, f"{cid}__{fname}")
        try:
            data = fetch(img_url, cache_path)
        except Exception as e:
            download_errors.append((cid, img_url, str(e)))
            continue
        h = sha(data)
        if h in LOCAL_HASHES:
            existing_local = LOCAL_HASHES[h]
            dup_updates.append((existing_local, ref_url, img_url, cid))
            continue
        # NEW: pick next order
        n = 1
        while n in used:
            n += 1
        used.add(n)
        # stage in inbox so the upload script can pick it up
        cid_folder = os.path.join(stage_root, cid)
        os.makedirs(cid_folder, exist_ok=True)
        ext = os.path.splitext(fname)[1] or ".png"
        stage_path = os.path.join(cid_folder, f"jar-{n}{ext}")
        with open(stage_path, "wb") as f:
            f.write(data)
        new_uploads.append((cid, img_url, ref_url, stage_path, n))
        # also record the new file's hash so later URLs in same loop don't re-add it
        LOCAL_HASHES[h] = stage_path

# Emit IMAGE_MAP TS snippet for new uploads (with ref URL as caption suffix)
ts_path = os.path.join(ROOT, "scripts/jar-new-entries.generated.ts")
with open(ts_path, "w", encoding="utf-8") as ts:
    # load churches.csv for canonical caption
    churches = {}
    with open(CHURCHES, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            churches[row["id"]] = row
    for cid, src_url, ref_url, stage_path, order in new_uploads:
        info = churches.get(cid, {})
        cap = f'{info.get("name","?")}, {info.get("town","?")}'.replace('"', '\\"')
        rel = os.path.relpath(stage_path, ROOT).replace(os.sep, "/")
        ts.write(f'  {{ file: "{rel}", church_id: "{cid}", caption: "{cap}", order: "{order}" }},\n')

# Emit dup-updates JSON for media.csv credit replacement
json_path = os.path.join(ROOT, "scripts/jar-dup-updates.json")
with open(json_path, "w", encoding="utf-8") as j:
    out = []
    for existing_local, ref_url, src_url, cid in dup_updates:
        # Find the matching media.csv row by URL basename match against existing_local
        out.append({
            "church_id": cid,
            "existing_local": os.path.relpath(existing_local, ROOT).replace(os.sep, "/"),
            "ref_url": ref_url,
            "src_url": src_url,
        })
    json.dump(out, j, indent=2)

print(f"\nNEW uploads: {len(new_uploads)}")
print(f"DUP updates: {len(dup_updates)}")
print(f"errors:      {len(download_errors)}")
print(f"\nTS snippet → {ts_path}")
print(f"DUP JSON   → {json_path}")
if download_errors:
    print("\nDownload errors:")
    for cid, url, err in download_errors:
        print(f"  {cid}: {url} — {err}")
