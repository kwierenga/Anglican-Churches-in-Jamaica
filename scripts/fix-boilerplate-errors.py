"""One-off sweep: fix fact-check errors that repeat as boilerplate across
many narrative files.

  1. 'Law 20 of 1887' -> 'Law 20 of 1867' (May Pen chief-town law)
  2. Vere parish creation 1671 -> 1673 (the 1671 church predates the parish;
     St. Peter's Alley '(1671)' references are left untouched)
  3. Ramble Anglican Church 'demolished' -> 'badly damaged' (Gleaner wording)

Prints every file changed with the rule applied.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NARR = ROOT / "content" / "churches"

RULES = [
    ("law20", re.compile(r"Law 20 of 1887"), "Law 20 of 1867"),
    ("vere-heading", re.compile(r"\(1671–1867\)"), "(1673–1867)"),
    ("vere-carved-1", re.compile(r"carved out of Clarendon in \*\*1671\*\*"),
     "carved out of Clarendon in **1673**"),
    ("vere-carved-2", re.compile(r"carved out as a separate sugar-plain parish in \*\*1671\*\*"),
     "carved out as a separate sugar-plain parish in **1673**"),
    ("ramble", re.compile(r"Ramble Anglican Church, reported by the Jamaica Gleaner as demolished"),
     "Ramble Anglican Church, reported by the Jamaica Gleaner as badly damaged"),
    ("suttons-1690", re.compile(r"some 500 enslaved people escaped to form the Maroon communities"),
     "some 500 enslaved people rose in revolt, and many of those who escaped joined the Maroon communities"),
    ("alley-founding", re.compile(r"founded 1671 at Withywood, relocated to Alley after the 1692 earthquake, present building 1715/1735"),
     "founded 1671, in the district then known as Withywood; the present building was erected around 1715 on the foundations of the original"),
]

changed = 0
for p in sorted(NARR.glob("*.md")):
    text = p.read_text(encoding="utf-8")
    applied = []
    for name, rx, repl in RULES:
        text, n = rx.subn(repl, text)
        if n:
            applied.append(f"{name}x{n}")
    if applied:
        p.write_text(text, encoding="utf-8")
        changed += 1
        print(f"{p.stem}: {', '.join(applied)}")

print(f"\n{changed} files updated")
