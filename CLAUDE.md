# Cookie Clicker — Obsidian Plugin

A cookie clicker idle game embedded as an Obsidian sidebar view.

## Tech Stack
- TypeScript + Obsidian Plugin API
- esbuild (bundler, watch mode for dev)
- Hot Reload plugin for live development

## Build / Run / Test
- `npm run dev` — start esbuild watch mode (Hot Reload picks up changes)
- `npm run build` — production build (type-check + minified bundle)
- No test framework yet

## Project Structure
```
src/
  main.ts        — Plugin entry point, lifecycle, save/load
  view.ts        — CookieClickerView (ItemView) — all UI rendering
  game-data.ts   — Game state, buildings, upgrades, helper functions
styles.css       — All styling (modern minimal theme, uses Obsidian CSS vars)
manifest.json    — Plugin metadata (id: cookie-clicker)
```

## Key Decisions
- Game state saved via `this.saveData()` / `this.loadData()` — auto-saves every 30s
- Offline production awarded at 50% rate on return
- Buildings use exponential cost scaling (1.15x per owned)
- Upgrades unlock progressively based on building count
- UI uses Obsidian's `createEl` API (no React)
- All CSS uses Obsidian CSS variables for theme compatibility

## Gotchas
- `manifest.json` changes require full Obsidian restart (Hot Reload won't catch them)
- The `cookie` icon in Lucide may not exist in older Obsidian — falls back gracefully
