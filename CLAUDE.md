# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (auto-builds data first, opens http://localhost:5177)
npm run build        # Production build: build data → vite build → copy assets
npm run build:data   # Rebuild JSON indices from CSV sources only
npm run fetch:news   # Scrape news/events from Diocese, Gleaner, ACNS
npm run add:media    # Manage church media attachments
```

## Architecture

React 19 + TypeScript SPA built with Vite. Deployed to GitHub Pages at base path `/Anglican-Churches-in-Jamaica/`.

### Routing & State

Hash-based routing (`#/`, `#/churches`, `#/church/:id`, `#/about`, `#/news`, etc.) implemented in `src/lib/router.ts` using `useSyncExternalStore`. Query parameters (`?parish=Kingston&class=cathedral`) managed the same way in `src/lib/state.ts`. No routing library — all URL-driven.

**Important:** `useSyncExternalStore` snapshots must return cached primitives, not new objects on every call.

### Data Pipeline

CSV files in `data/` are the source of truth:
- `data/churches.csv` — 313 churches with id, name, parish, classification, status, coordinates
- `data/media.csv` — image/video links (Cloudinary URLs) keyed by church_id

`scripts/build-data.ts` validates CSVs with Zod schemas (`src/lib/schemas.ts`) and outputs to `data/build/`:
- `churches.geo.json` — GeoJSON for map rendering
- `search-index.json` — compact catalog for Fuse.js search
- `media-index.json` — media grouped by church ID

Church history content lives as markdown files in `content/churches/` (150+ files).

### News/Events Feed

`scripts/fetch-news.ts` scrapes three sources with Cheerio. Items within 6 months are kept; future dates become Events, past dates become News. Existing manually-edited items in `data/feed.json` are preserved on merge. A GitHub Actions workflow triggers this weekly.

### Map

Abstract `MapAdapter` interface in `src/adapters/` with Leaflet (default) and ArcGIS implementations. Selected at runtime via `VITE_MAP_ADAPTER` env var. Churches are color-coded by parish (14 parishes with predefined palettes, centers, and zoom levels defined in schemas).

### Search

Fuse.js with lazy-loaded compact index from `search-index.json`. Configured with 0.3 threshold on name + town fields.

## Styling

TailwindCSS with ecclesiastical theme:
- Colors: crimson (`#8B0000`), gold (`#B8860B`), navy (`#1E2D4E`), ivory, parchment
- Fonts: "EB Garamond" (headings), "Crimson Text" (body)
- Max content width: `max-w-site` (1140px)

## React 19 Note

Never use `import React from 'react'` — the tsconfig uses `jsx: react-jsx` so React has no default export.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml` on push to main. The workflow runs `fetch:news` then `build`. A separate workflow triggers weekly news refresh.
