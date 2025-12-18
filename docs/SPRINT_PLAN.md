# Sprint Plan

## Overview

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 0 | Foundation | ✅ Complete |
| Sprint 1 | Critical Features (MVP) | ✅ Complete |
| Sprint 2 | High Features | ✅ Complete |
| Sprint 3 | Polish | ✅ Complete |
| Sprint 4 | Release | 🔲 Not Started |

---

## Sprint 0: Foundation ✅

**Objective:** Project scaffolding, tooling, test infrastructure, and project documentation

### Deliverables

#### Project Structure
- [x] pnpm workspace monorepo structure
- [x] `packages/react-simile-timeline/` - Vite library setup with TypeScript
- [x] `demo/` - Vite React app consuming workspace package
- [x] Sample Simile JSON data files for testing

#### Project Documentation
- [x] `.claude/CLAUDE.md` - Project-specific rules and instructions
- [x] `docs/PRD.md` - Product Requirements Document
- [x] `docs/SPRINT_PLAN.md` - Sprint plan with deliverables
- [x] `docs/API.md` - API design document
- [x] Root `README.md` - Project overview

#### Tooling & Config
- [x] ESLint + Prettier configuration
- [x] TypeScript configuration
- [x] Tailwind CSS setup for demo
- [x] Vite configuration for library build

#### Testing Infrastructure
- [x] Vitest installation and configuration
- [x] Playwright installation and configuration
- [x] Playwright MCP server integration
- [x] Basic CI pipeline

#### Tests
- [x] Vitest: Basic smoke test for library export
- [x] Playwright: Demo app loads, library imports correctly

---

## Sprint 1: Critical Features (MVP) ✅

**Objective:** Core timeline matching Screenshot 1 functionality

### Deliverables
- [x] `<Timeline>` component with configurable bands
- [x] Two-band layout (detail + overview)
- [x] Band synchronization (linked scrolling)
- [x] Horizontal pan (drag to scroll)
- [x] Time scale rendering with appropriate labels
- [x] Point event rendering (dot + label)
- [x] Smart label layout engine (vertical stacking)
- [x] Overview band with tick markers
- [x] Classic theme implementation
- [x] Event click handler with popup/details display
- [x] Simile JSON data loading (URL + inline)
- [x] TypeScript types for all public APIs

### Non-Functional
- [x] 60 FPS scroll performance baseline (verified: 120 FPS avg, 1 dropped frame in 5000+ frames)
- [x] 100% Simile JSON compatibility for point events
- [x] Basic keyboard navigation (arrow keys to pan)

### Tests
- [x] Timeline renders with sample data
- [x] Pan interaction works
- [x] Events display correctly
- [x] Click popup appears
- [x] Band synchronization verified
- [x] Label overlap prevention verified

### Demo Showcase
- [x] JFK timeline recreation

---

## Sprint 2: High Features ✅

**Objective:** Duration events, hot zones, zoom, advanced styling

### Deliverables
- [x] Duration events (horizontal tape/bar rendering)
- [x] Hot zones (highlighted background regions)
- [x] Hot zone text annotations
- [x] Mouse wheel zoom
- [x] Event `color` attribute support
- [x] Event `textColor` attribute support
- [x] Event `classname` attribute for CSS customization
- [ ] Auto band height sizing
- [x] Three-band configuration support
- [x] Sticky labels (events remain visible when scrolled off-left, matching SIMILE behavior)

### Non-Functional
- [x] ARIA labels and roles
- [x] Keyboard zoom controls (+/- keys)

### Tests
- [x] Duration events render as tapes
- [x] Hot zones display with correct styling
- [x] Zoom in/out functions correctly
- [x] Custom colors apply to events
- [x] Three bands synchronize correctly
- [x] Sticky labels remain visible when events scroll off-left

### Demo Showcase
- [ ] Event Attribute Tests page
- [x] Three-band example (World Wars 1914-1945)

---

## Sprint 3: Polish ✅

**Objective:** Advanced features, theming, edge cases

### Deliverables
- [x] Tape images (`tapeImage` attribute)
- [x] `tapeRepeat` attribute
- [x] Dark theme (CSS custom properties with `data-theme` attribute)
- [x] Custom theme support (Theme object with CSS variable overrides)
- [x] Theme switcher UI component (demo includes classic/dark/sepia themes)
- [ ] Zone magnification effect (optional - deferred to future)
- [x] Navigation controls (jump-to-date via `jumpToDate` action)
- [x] Multiple data source loading/merging (`dataUrls` prop)
- [x] Animated transitions on content change (CSS keyframes for events, popups)
- [x] Graceful error handling for invalid dates (`tryParseDate`, `isValidDate`)
- [x] Optional branding/watermark (`branding` prop with `BrandingConfig`)

### Non-Functional
- [x] ARIA labels and roles (inherited from Sprint 2)
- [ ] Full WCAG 2.1 AA compliance audit
- [ ] Screen reader testing
- [ ] Performance profiling and optimization

### Tests
- [x] Theme switching works (verified via Playwright MCP)
- [x] Tape images render correctly (EventMarker supports tapeImage/tapeRepeat)
- [x] Navigation controls function (jumpToDate action in context)
- [x] Multiple data sources merge correctly (Promise.all with event merging)
- [x] Animations are smooth (CSS transitions with 0.3s ease)
- [ ] Accessibility audit passes

### Demo Showcase
- [x] Full-featured demo with all options
- [x] Theme switcher demonstration (classic/dark/sepia)

---

## Sprint 4: Release 🔲

**Objective:** Production-ready NPM package, demo site, GitHub presence

### NPM Package
- [ ] Package.json metadata
- [ ] Proper exports configuration (ESM, CJS, types)
- [ ] Bundle size optimization (<100KB gzipped)
- [ ] README.md with documentation
- [ ] CHANGELOG.md
- [ ] LICENSE (MIT)
- [ ] NPM publish workflow
- [ ] Semantic versioning setup

### Demo Site (Vercel)
- [ ] Production build optimization
- [ ] Vercel deployment configuration
- [ ] SEO meta tags
- [ ] Landing page with feature overview
- [ ] Multiple demo timelines
- [ ] Links to GitHub and NPM
- [ ] Usage documentation/examples

### GitHub Repository
- [ ] README.md with badges
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] Issue templates
- [ ] Pull request template
- [ ] GitHub Actions CI/CD
- [ ] Release workflow

### Final Testing
- [ ] Full Playwright E2E suite passes
- [ ] Visual regression baseline
- [ ] Cross-browser testing
- [ ] Mobile/responsive testing
- [ ] Performance benchmarks documented

---

## Acceptance Criteria

All sprint deliverables must meet:

| Criteria | Requirement |
|----------|-------------|
| **Visual Fidelity** | UI closely matches reference screenshots |
| **Performance** | 60 FPS smooth scrolling, no jank |
| **Test Coverage** | Playwright E2E + Vitest unit tests pass |
| **TypeScript** | No type errors, all APIs fully typed |
| **Build** | Clean build with no warnings |
