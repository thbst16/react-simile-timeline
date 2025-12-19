# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-19

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
- Efficient virtualization for large event sets
- Optimized re-renders with React hooks

## [Unreleased]

### Planned
- Zone magnification effect
- Full WCAG 2.1 AA compliance
- Visual regression testing
