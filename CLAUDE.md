# Minimal Claude Code Setup for Price Tracker MVP with TradingView Charts

## Complete CLAUDE.md File

Save this as `CLAUDE.md` in your project root:

```markdown
# Price Tracker MVP - Vite + React + TypeScript + TradingView Charts

## Tech Stack
- Build: Vite 6.0 + React 18.3 + TypeScript 5.6
- Charts: TradingView lightweight-charts (35KB)
- State: Zustand 5.0 (minimal, ~8KB)
- Styling: Plain CSS (no frameworks)

## Design Rules
- We don't use strokes, borders underlines or outlines in the styles for this app

## Quick Start
```bash
# One-time setup
npm create vite@latest . -- --template react-swc-ts
npm install lightweight-charts zustand

# Development
npm run dev    # Starts at localhost:3000
```

[... rest of the existing content remains unchanged ...]