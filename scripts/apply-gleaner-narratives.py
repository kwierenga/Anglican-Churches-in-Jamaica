#!/usr/bin/env python
"""Parse gleaner-anglican-report.md and inject the 'Suggested narrative
addition' block into each content/churches/<cid>.md file as a new section.

If the file already has a 'Recent coverage' section, replace its body.
If the content file is missing, create a stub with the Gleaner content."""
import csv
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = os.path.join(ROOT, "gleaner-anglican-report.md")
CONTENT_DIR = os.path.join(ROOT, "content/churches")
CHURCHES = os.path.join(ROOT, "data/churches.csv")

# Load churches.csv for stub generation
churches = {}
with open(CHURCHES, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        churches[row["id"]] = row

# Parse report
report = open(REPORT, encoding="utf-8").read()

# Split by H3 (### <church_id>) — but skip non-cid headings
sections = re.split(r"\n### ", "\n" + report)
entries = {}
for sec in sections:
    if not sec.strip() or sec.startswith("Cross-cutting") or "/cross-cutting" in sec.lower()[:50]:
        continue
    # First line should be the cid
    m = re.match(r"^([a-z0-9\-]+)\s*\n", sec)
    if not m:
        continue
    cid = m.group(1)
    # Find suggested narrative block (lines starting with "> " that come after
    # "Suggested narrative addition" marker)
    sm = re.search(r"\*\*Suggested narrative addition:\*\*\s*\n((?:[ \t]*>.*\n?)+)", sec)
    if not sm:
        continue
    block = sm.group(1)
    # Strip leading whitespace and "> " from each line, join paragraph(s)
    paragraph_lines = []
    for l in block.splitlines():
        stripped = re.sub(r"^[ \t]*>[ \t]?", "", l)
        paragraph_lines.append(stripped)
    paragraph = "\n".join(paragraph_lines).strip()
    if cid in entries:
        # Append second paragraph if duplicate cid
        entries[cid] += "\n\n" + paragraph
    else:
        entries[cid] = paragraph

print(f"parsed {len(entries)} church narratives from report")


def update_file(cid, new_paragraph):
    path = os.path.join(CONTENT_DIR, f"{cid}.md")
    if os.path.exists(path):
        src = open(path, encoding="utf-8").read()
        # If section exists, replace its body
        marker = "## Recent coverage"
        if marker in src:
            # Replace from marker to next H1/H2 or EOF
            new_src = re.sub(
                r"(## Recent coverage\s*\n).*?(\n##\s|\Z)",
                lambda m: m.group(1) + "\n" + new_paragraph + "\n" + m.group(2),
                src,
                flags=re.DOTALL,
                count=1,
            )
        else:
            # Append at end (before final newline)
            new_src = src.rstrip() + f"\n\n## Recent coverage\n\n{new_paragraph}\n"
        if new_src != src:
            open(path, "w", encoding="utf-8").write(new_src)
            return "updated"
        return "unchanged"
    else:
        # Create a basic stub
        info = churches.get(cid)
        if not info:
            return "skipped (cid not in churches.csv)"
        cls_label = info["classification"].replace("_", " ").title()
        status_label = info["status"].title() if info["status"] != "ruin" else "Ruin"
        stub = f"""# {info['name']}, {info['town']}
**{info['parish']}** · {cls_label} · {status_label}

{info['name']} serves {info['town']} in {info['parish']} parish.

## Recent coverage

{new_paragraph}
"""
        open(path, "w", encoding="utf-8").write(stub)
        return "created"


updated = created = unchanged = skipped = 0
for cid, paragraph in sorted(entries.items()):
    result = update_file(cid, paragraph)
    if result == "updated":
        updated += 1
    elif result == "created":
        created += 1
    elif result == "unchanged":
        unchanged += 1
    else:
        skipped += 1
    print(f"  {result:8s}  {cid}")

print(f"\nupdated:   {updated}")
print(f"created:   {created}")
print(f"unchanged: {unchanged}")
print(f"skipped:   {skipped}")
