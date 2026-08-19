# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-08-17

### Fixed

- **Date-only events no longer render one day early outside UTC.** `"2023-01-15"`
  and other date-only strings were parsed as **UTC midnight** — per the ECMAScript
  specification — and then read back with local-time getters. At any negative UTC
  offset the calendar day shifted backwards by one, so an event written as
  January 15 rendered as January 14 throughout the Americas. Date-only strings now
  resolve to **local midnight**, so the day you write is the day that renders.

  **This changes rendered output.** If you previously compensated by shifting your
  data forward a day, remove that adjustment. Timelines built from date-only Simile
  JSON will move by one day at negative offsets — to the correct day.

  Unaffected: datetimes without an offset (`"2023-06-20T14:30:00"`, already local),
  values with an explicit `Z` or `±HH:MM` suffix (still absolute instants), year-only
  and BCE values, and legacy Simile formats. Native ISO bounds are preserved —
  out-of-range months and days still fail, and in-range overflow such as
  `"2023-02-29"` still rolls over.

- The `centerDate` prop shared the same defect. String values were parsed with the
  native constructor, so `centerDate="2023-01-15"` centered a day early at negative
  offsets. String values now use the same parser as event dates, and an unparseable
  string falls back to the median event date instead of producing an `Invalid Date`.

### Added

- **The published package carries npm provenance.** Releases are now attested,
  giving a verifiable link between the tarball on npm and the workflow run and
  commit that built it. Check it with
  `npm view react-simile-timeline dist.attestations`.

### Changed

- CI runs the unit suite under a non-UTC timezone as a required check. GitHub
  runners are UTC, where this defect was invisible; the suite was red on any
  developer machine west of Greenwich while CI stayed green.
- The release workflow refuses to publish when the pushed tag does not match
  the version in `package.json`.
- Documentation corrections: both `Live Demo` links pointed at a host that
  returned 404; the CHANGELOG release dates for `1.0.0`–`1.0.2` were a year
  early; the TypeScript badge was pinned to a version the project had long
  since left; and the README's size claim did not distinguish the ~12 KB that
  reaches your users from the ~404 KB installed on disk.

## [1.0.2] - 2025-12-19

### Fixed

- Include README.md in NPM package for proper display on npmjs.com

## [1.0.1] - 2025-12-19

### Changed

- Enhanced README with feature table, code examples, and API reference for NPM

## [1.0.0] - 2025-11-16

> **Not installable from npm.** `1.0.0` was published and then unpublished, and
> npm permanently blocks republishing an unpublished version. Use `1.0.1` or
> later. The tag and GitHub release remain as history.

### Added

#### Core Features

- `<Timeline>` component with configurable multi-band layout
- Two-band and three-band timeline configurations
- Band synchronization (linked scrolling between bands)
- Horizontal pan with drag interaction
- Mouse wheel zoom with dynamic scale adjustment
- Keyboard navigation (arrow keys to pan, +/- to zoom)
- Time scale rendering with automatic label formatting

#### Event Rendering

- Point events with dot markers and labels
- Duration events with horizontal tape/bar rendering
- Smart label layout engine (vertical stacking, overlap prevention)
- Sticky labels (events remain visible when scrolled off-left)
- Event `color`, `textColor`, and `classname` attribute support
- `tapeImage` and `tapeRepeat` attributes for custom tape backgrounds
- Overview band with tick markers

#### Hot Zones

- Highlighted background regions for time periods
- Hot zone text annotations
- Customizable colors per zone

#### Theming

- Classic theme (default light theme)
- Dark theme with CSS custom properties
- Custom theme support via Theme object with CSS variable overrides
- Smooth animated transitions between themes

#### Navigation & Data

- Event click handler with popup/details display
- Jump-to-date navigation via `jumpToDate` action
- Simile JSON data loading from URL (`dataUrl` prop)
- Multiple data source loading and merging (`dataUrls` prop)
- Inline data support (`data` prop)
- Graceful error handling for invalid dates

#### Accessibility

- ARIA labels and roles for screen readers
- Keyboard-accessible interactions
- Focus management

#### Other

- Optional SIMILE-style branding/watermark
- 100% backward compatibility with Simile JSON format
- TypeScript types for all public APIs
- CSS-only styling (no runtime dependencies)

### Performance

- 60+ FPS smooth scrolling (verified at 120 FPS average)
- Viewport culling — only events inside the visible date range are rendered, so
  the rendered node count is bounded by the viewport rather than by the size of
  the dataset
- Optimized re-renders with React hooks

## [Unreleased]

### Changed

- **Minimum Node version is now 20.19.** `engines.node` moved from `>=18.0.0`
  to `>=20.19.0`. The build toolchain (Vite 8) requires it, and Node 18 reached
  end of life in April 2025. The library itself is browser-targeted and its
  built output is unaffected — this narrows a claim that could no longer be
  tested rather than removing working support. Node 18 was also dropped from
  the CI matrix, which now covers 20, 22 and 24.
- Build toolchain modernized: Vite 5 → 8, `@vitejs/plugin-react` 4 → 6,
  `vite-plugin-dts` 3 → 5, Vitest 1 → 4, jsdom 24 → 26. The published bundle is
  smaller (ESM 11.7 KB → 10.8 KB gzipped) and the emitted type declarations are
  byte-identical to `1.0.3`.
- **Layout is no longer re-parsed on every pan frame.** Event dates were parsed
  from strings on each layout pass, so the cost of panning and zooming scaled
  with the total number of events even though only the events inside the
  viewport are rendered. Dates are now parsed once when the data changes and the
  visible window is found by binary search over a sorted index, making the
  per-frame cost independent of dataset size for point events. Measured on a
  1200px viewport: a 50,000-event timeline dropped from ~19.5 ms per layout pass
  to ~0.002 ms, so the 60 FPS target now holds at scale rather than only for
  small datasets. Rendered output is unchanged — the two paths are verified
  identical.
- **React 19 support is now tested, not just asserted.** The library's own test
  suite runs against React 19 by default, and a dedicated CI job exercises the
  React 18 floor, so the `react: ^18 || ^19` peer promise is verified on both
  ends for the first time. Adopted `@types/react`/`@types/react-dom` 19,
  `@testing-library/react` 16, and TypeScript 6. The published type
  declarations now resolve the `JSX` namespace through `react` (React 19's
  location) rather than `react/jsx-runtime`; this is compatible with
  `@types/react` 18.3 and later. Lint moved to ESLint 9 flat config.

### Planned

- Zone magnification effect
- Full WCAG 2.1 AA compliance ([#25](https://github.com/thbst16/react-simile-timeline/issues/25))
  — audit and remediation. Until that lands, the project describes what is
  implemented rather than asserting a conformance level.
- Visual regression testing
