# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (auto-builds data first, opens http://localhost:5177)
npm run build        # Production build: build data → vite build → copy assets → prerender
npm run build:data   # Rebuild JSON indices from CSV sources only
npm run fetch:news   # Scrape news/events from the Diocese and the Gleaner
npm run add:media    # Manage church media attachments
```

## Architecture

React 19 + TypeScript SPA built with Vite. Deployed to GitHub Pages at base path `/Anglican-Churches-in-Jamaica/`.

### Routing & State

History-based routing with real URLs (`/`, `/churches`, `/church/:id`, `/about`, `/news`, etc.) implemented in `src/lib/router.ts` using `useSyncExternalStore`. Links render genuine `<a href>` values via `to()`; a delegated click handler turns same-origin clicks into `pushState` navigations. Query parameters (`?parish=Kingston&class=cathedral`) managed the same way in `src/lib/state.ts`. No routing library — all URL-driven.

Because the URLs are real, `scripts/prerender.ts` must emit a matching `dist/<route>/index.html` for every route, plus `404.html` as the GitHub Pages SPA fallback. Add a route to the router and you must add it there too, or a hard refresh 404s.

**Important:** `useSyncExternalStore` snapshots must return cached primitives, not new objects on every call.

### Data Pipeline

CSV files in `data/` are the source of truth:
- `data/churches.csv` — 305 churches with id, name, parish, classification, status, coordinates
- `data/media.csv` — image/video links (Cloudinary URLs) keyed by church_id

`scripts/build-data.ts` validates CSVs with Zod schemas (`src/lib/schemas.ts`) and outputs to `data/build/`:
- `churches.geo.json` — GeoJSON for map rendering
- `search-index.json` — compact catalog for Fuse.js search
- `media-index.json` — media grouped by church ID
- `architecture-index.json` / `clergy-index.json` — derived from the narratives

Church history content lives as markdown files in `content/churches/` — one per church, all 305 present.

**`displayName`:** the 305 churches share only ~118 distinct dedications ("St. Paul's" ×15), so `build-data.ts` derives a `displayName` that appends the town wherever a dedication is shared. Use it anywhere a church name stands alone (search results, `<title>`, share cards, clergy index); use plain `name` only where the town is already displayed in an adjacent column. The build warns if any `displayName` is still ambiguous.

### News/Events Feed

`scripts/fetch-news.ts` scrapes the Diocese (Cheerio) and Gleaner coverage (via Google News RSS, source-filtered). Items within 6 months are kept; future dates become Events, past dates become News. Existing manually-edited items in `data/feed.json` are preserved on merge, so hand-written entries survive. It also writes `data/feed-meta.json` (run timestamp + per-source health), which the News page reads to show when the feed was last checked. A GitHub Actions workflow triggers this weekly.

ACNS (anglicannews.org) was a third source but is retired: the site returns 403 to non-browser clients regardless of User-Agent, and publishes no working RSS.

Every feed item must lead somewhere — `src/lib/feed.ts` resolves the article URL, else the parish page it concerns, else the publisher's site.

### Map

Abstract `MapAdapter` interface in `src/adapters/` with Leaflet (default) and ArcGIS implementations. Selected at runtime via `VITE_MAP_ADAPTER` env var. Churches are colour-coded by parish; the 14 parish colours live in `src/lib/parishes.ts` (`PARISH_COLOR`) and are shared by the map and the UI. They are saturated map colours — use them for accent bars, dots and rules only, never as text. Parish centres and zoom levels are in the adapter.

### Search

Fuse.js with lazy-loaded compact index from `search-index.json`. Configured with 0.3 threshold on `displayName`, `name` and `town`.

## Styling

TailwindCSS with ecclesiastical theme:
- Colors: crimson (`#8B0000`), gold (`#B8860B`), navy (`#1E2D4E`), ivory, parchment
- Fonts: "EB Garamond" (headings), "Crimson Text" (body)
- Max content width: `max-w-site` (1140px)

**Colour rules (accessibility):**
- `gold` and `gold-bright` fail WCAG AA as text (3.2:1 and 2.6:1). Use them for rules, borders, and gold-on-dark only. For gold text on a light surface use `gold-deep` (`#8A6508`, 5.3:1 on white).
- `text-gray-400` is 2.5:1 — never use it for text; `text-gray-500` is the lightest passing grey.
- Gold is decoration only. Every status / category / state chip comes from `src/components/Badge.tsx`, which owns the semantic tones — don't hand-roll `bg-*` chips in pages.
- Any animation longer than five seconds needs a pause control and a `prefers-reduced-motion` guard (see the homepage ticker).

## React 19 Note

Never use `import React from 'react'` — the tsconfig uses `jsx: react-jsx` so React has no default export.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml` on push to main. The workflow runs `fetch:news` then `build`. A separate workflow triggers weekly news refresh.
