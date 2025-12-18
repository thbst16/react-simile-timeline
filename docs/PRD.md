# Product Requirements Document

> Full PRD is maintained in [`project-background/project-background.md`](../project-background/project-background.md)

## Quick Reference

### Project Purpose

Recreate the MIT Simile Timeline component as a modern React component that:
- Implements most/all features of the original MIT Simile Timeline
- Is 100% compatible with loading legacy Simile JSON data
- Distributed as a standalone NPM package
- Includes a demo portfolio website

### Immutable Requirements

1. Releasable as NPM package as stand-alone component
2. Demo portfolio that uses the NPM package directly
3. Full GitHub site (license, support rules, docs)
4. 100% Compatible with source JSON from original Simile Timeline
5. High-performance TypeScript for rapid and extensible rendering

### Technical Stack

| Component | Technology |
|-----------|------------|
| Package Manager | pnpm workspaces |
| Framework | React 18+ |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Build | Vite |
| Unit Tests | Vitest |
| E2E Tests | Playwright |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

### Feature Priorities

- **Critical** (Sprint 1): Multi-band layout, pan, point events, popups, Simile JSON
- **High** (Sprint 2): Duration events, hot zones, zoom, colors, 3-band
- **Non-Critical** (Sprint 3): Themes, animations, navigation controls

See full PRD for complete feature list and specifications.
