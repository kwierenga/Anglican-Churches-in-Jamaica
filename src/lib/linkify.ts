/**
 * Linkify known entity names inside a rendered narrative.
 *
 * Operates on the live DOM of the rendered <article> (after marked output is
 * injected). Conservative by design:
 *  - only the FIRST occurrence of each term is linked,
 *  - whole-word matches only (no linking "St. Ann" inside "St. Ann's Bay"),
 *  - never inside existing links or headings,
 *  - never in the References / Recent coverage tail.
 */
export interface LinkTerm { text: string; href: string }

function wordBoundedIndex(haystack: string, needle: string): number {
  let from = 0
  while (true) {
    const idx = haystack.indexOf(needle, from)
    if (idx < 0) return -1
    const before = idx === 0 ? '' : haystack[idx - 1]
    const after = haystack[idx + needle.length] ?? ''
    const okBefore = !/[A-Za-z0-9]/.test(before)
    const okAfter = !/[A-Za-z0-9'’]/.test(after)
    if (okBefore && okAfter) return idx
    from = idx + needle.length
  }
}

export function linkifyArticle(root: HTMLElement, terms: LinkTerm[]) {
  // Bound the region: stop at a References / Recent coverage heading.
  let stop: Element | null = null
  root.querySelectorAll('h2, h3').forEach(h => {
    if (!stop && /references|recent coverage|sources/i.test(h.textContent || '')) stop = h
  })

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (stop && (node.compareDocumentPosition(stop) & Node.DOCUMENT_POSITION_PRECEDING)) {
        return NodeFilter.FILTER_REJECT // node sits after the stop heading
      }
      let el = node.parentElement
      while (el && el !== root) {
        const t = el.tagName
        if (t === 'A' || t === 'H1' || t === 'H2' || t === 'H3') return NodeFilter.FILTER_REJECT
        el = el.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) textNodes.push(n as Text)

  const linked = new Set<string>()
  for (const node of textNodes) {
    const text = node.nodeValue || ''
    let best: { term: LinkTerm; idx: number } | null = null
    for (const term of terms) {
      if (linked.has(term.text)) continue
      const idx = wordBoundedIndex(text, term.text)
      if (idx >= 0 && (!best || idx < best.idx)) best = { term, idx }
    }
    if (!best) continue

    const before = text.slice(0, best.idx)
    const after = text.slice(best.idx + best.term.text.length)
    const a = document.createElement('a')
    a.href = best.term.href
    a.textContent = best.term.text
    a.className = 'text-crimson underline underline-offset-2'

    const frag = document.createDocumentFragment()
    if (before) frag.appendChild(document.createTextNode(before))
    frag.appendChild(a)
    if (after) frag.appendChild(document.createTextNode(after))
    node.parentNode?.replaceChild(frag, node)
    linked.add(best.term.text)
  }
}
