# Cookie Clicker Plugin — Plan

## Goal
Build a fun, polished cookie clicker idle game as an Obsidian plugin with modern minimal aesthetics.

## Architecture
- **Plugin class** (`main.ts`): Lifecycle, save/load game state, register view & commands
- **View** (`view.ts`): ItemView with cookie display, click handling, building shop, upgrade shop
- **Game data** (`game-data.ts`): All game constants (buildings, upgrades), state type, helper functions (CPS calc, cost calc, formatting)
- **Styles** (`styles.css`): Clean modern theme using Obsidian CSS variables

## Implementation Phases

### Phase 1: Core Game (DONE)
- [x] Scaffold plugin from sample template
- [x] Cookie clicking with floating +N animations
- [x] 8 buildings with exponential cost scaling
- [x] 17 upgrades (click + per-building multipliers)
- [x] CPS engine (50ms tick)
- [x] Save/load via Obsidian data API
- [x] Offline cookie production
- [x] Modern minimal CSS with theme variable support
- [x] Reset game button

### Phase 2: Polish (future)
- [ ] Achievements system
- [ ] Golden cookies (random bonus events)
- [ ] Stats page (total clicks, time played, etc.)
- [ ] Sound effects (optional toggle)
- [ ] More buildings and upgrades

## Current Phase
Phase 1 — complete.
