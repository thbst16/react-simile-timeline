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

### Planned

- Zone magnification effect
- Full WCAG 2.1 AA compliance ([#25](https://github.com/thbst16/react-simile-timeline/issues/25))
  — audit and remediation. Until that lands, the project describes what is
  implemented rather than asserting a conformance level.
- Visual regression testing
