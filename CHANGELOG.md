# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Storybook integration
- Additional painter types
- Enhanced touch gesture support
- Mobile-optimized layouts
- Additional theme presets
- Plugin architecture for custom painters

## [1.0.0] - 2025-11-16

### 🎉 Stable Release

This is the **first stable release** of React Simile Timeline. The API is now frozen and will remain backward compatible through all 1.x versions. No breaking changes will be introduced until v2.0.0.

### Added

#### Security
- **HTML Sanitization**: Event descriptions containing HTML are now automatically sanitized using DOMPurify to prevent XSS attacks
  - Allowed tags: Text formatting (b, i, em, strong, etc.), links, structure (p, div, span), lists, tables, headers, code blocks
  - Blocked content: Scripts, iframes, event handlers, dangerous URLs (javascript:, data:, vbscript:)
  - Smart URL validation with regex pattern matching
  - Memoized sanitization for optimal performance

#### Documentation
- **MIGRATION.md**: Complete beta → v1.0 upgrade guide (491 lines)
  - Quick start migration steps
  - Detailed breaking changes documentation
  - Migration impact by use case
  - Upgrade checklist and timeline
- **BREAKING_CHANGES.md**: HTML sanitization documentation (605 lines)
  - Comprehensive allowed/blocked tags reference
  - Security rationale and best practices
  - Migration examples for common scenarios
- **SECURITY.md**: Security documentation and XSS prevention (681 lines)
  - DOMPurify configuration details
  - Attack vectors and prevention strategies
  - Reporting vulnerabilities
- **THEMING.md**: Complete theming guide and API reference (992 lines)
  - Built-in themes documentation
  - Custom theme creation tutorial
  - Accessibility guidelines

### Changed
- **API Stability**: All public APIs frozen until v2.0.0
  - Component props (Timeline, Band, EventBubble)
  - Hook signatures (useTheme, useKeyboardNav, etc.)
  - Type definitions (TimelineEvent, BandConfig, etc.)
  - Painter interfaces (OriginalPainter, CompactPainter, OverviewPainter)
- **Version Display**: LandingPage now shows version dynamically from package.json

### Security
- **XSS Prevention**: All HTML content in event descriptions is sanitized
- **Safe Defaults**: Only safe HTML tags and attributes allowed
- **URL Validation**: Dangerous URL schemes automatically blocked

### Performance
- Bundle size: 50.98 KB gzipped (66% under 150KB target)
- 60fps scrolling maintained with 1000+ events
- Memoized HTML sanitization for optimal performance

### Testing
- 399/399 tests passing (100%)
- Comprehensive sanitization test suite (467 lines)
  - XSS prevention tests (script injection, event handlers, dangerous URLs)
  - Allowed HTML tag verification
  - Edge case handling (empty content, unicode, HTML entities)
  - Performance and regression tests

### Breaking Changes

#### HTML Sanitization
Event descriptions containing HTML will be automatically sanitized. This may affect:
- **Scripts**: `<script>` tags removed (use onEventClick prop instead)
- **Event Handlers**: onclick, onerror removed (use React event handlers)
- **Forms**: Form elements blocked (use custom event bubbles)
- **Styles**: Inline styles removed (use CSS classes instead)

See MIGRATION.md and BREAKING_CHANGES.md for complete migration guide.

### Quality Metrics
- ✅ TypeScript: Strict mode, 0 errors
- ✅ ESLint: 0 warnings
- ✅ Prettier: All files formatted
- ✅ Tests: 399/399 passing
- ✅ Build: Success
- ✅ Accessibility: WCAG 2.1 AA compliant
- ✅ Backward Compatibility: Beta releases upgrade seamlessly (except sanitization)

## [0.1.0-beta.3] - 2025-11-13

### Fixed
- **Event Cascading**: Implemented label-aware collision detection in LayoutEngine
  - Events now properly cascade across multiple tracks without label overlap
  - JFK timeline events display correctly across tracks
  - World Cup 2006 dense timeline (36 events in 31 days) renders without overlap
  - Intelligent buffer calculation based on label text width
- **Track Spacing**: Increased trackOffset from 25px to 35px to prevent timescale label overlap
- **Painter Logic**: Conditional painter selection for optimal dense timeline rendering

### Changed
- LayoutEngine collision detection now accounts for label text width (characters × 6px)
- Duration events: 10px buffer (label above tape)
- Instant events: label_width/2 + 10px buffer (label beside icon)

## [0.1.0-beta.2] - 2025-11-13

### Fixed
- Updated README with correct beta.1 feature descriptions and installation instructions
- Fixed prettier code formatting in 5 component files
- Corrected npm badges to show beta version properly

### Documentation
- Comprehensive "What's New in Beta.1" section added to README
- Updated installation instructions to reflect beta.1 as default version
- Clarified alpha version access instructions

## [0.1.0-beta.1] - 2025-11-13

### ⚠️ Beta Release

This is a **beta release** with significant UX improvements and new demo content. API is stabilizing but may still have minor changes before v1.0.0.

### Added
- **Classic Vintage Theme**: Aged paper aesthetic with serif typography and warm sepia tones
- **Demo Timeline Selector**: Interactive landing page with 3 demo timelines
- **JFK Timeline**: 32 events covering JFK's life and assassination (1917-1963)
- **World Cup 2006 Timeline**: 48 events with detailed finals coverage
- **Timeline Controls**: Event count, date range display, and reset button
- **Theme Switcher Component**: Icon-based theme toggle (Classic/Dark/Auto)
- **Panning Bounds**: Prevents dragging into empty space beyond event dates
- **Theme-Aware Rendering**: Event labels adapt to theme (light/dark mode contrast)

### Changed
- Improved event label positioning for better readability
- Enhanced theme switcher contrast in classic/vintage mode
- Auto-centering on timeline load for better initial view
- Better zoom levels for dense timelines
- Dark mode label colors for improved contrast (#e0e0e0 in dark mode)

### Fixed
- Event label overlap in dense timelines
- JSON filename mapping for demo data
- Event track assignment for proper vertical cascading
- Theme colors not applying to event labels

### Removed
- Internal sprint demo components (Sprint1Demo through Sprint5Demo)
- Development documentation and artifacts
- Sprint-specific test files

### Performance
- Bundle size: 40.62 KB gzipped (well under 150KB target)
- 60fps maintained during panning and zooming
- Instant theme switching (<16ms)
- Efficient event layout for 1000+ events

### Documentation
- All essential production docs retained (API.md, EXAMPLES.md, MIGRATION.md, PERFORMANCE.md)

## [0.1.0-alpha.0] - 2025-11-08

### ⚠️ Alpha Release Warning

This is an **alpha release** intended for early testing and feedback. The API may change before v1.0.0. Not recommended for production use without thorough testing.

### Added

#### Core Infrastructure (Sprint 1)
- **TypeScript Support**: Full TypeScript with strict mode enabled
- **Data Layer**: Complete event source management with Zustand store
- **Date Handling**: Comprehensive date parsing supporting ISO-8601, Gregorian strings, and BCE dates
- **JSON Compatibility**: 100% compatible with original MIT Simile Timeline JSON format
- **Data Validation**: Robust validation with helpful error messages

#### Rendering Engine (Sprints 2-3)
- **Ether System**: Time-to-pixel conversion engine supporting multiple interval units
- **Band Component**: Multi-band timeline rendering with synchronization
- **Time Scale**: Dynamic time labels that adjust to zoom level
- **Event Painters**: Three painter types (Original, Compact, Overview)
- **Event Types**: Support for point events and duration events (tapes)
- **Event Layout Engine**: Intelligent event positioning preventing overlaps
- **Event Bubbles**: Interactive info popups with HTML content support
- **Decorators**: Timeline decorators for highlighting time periods
- **Event Styling**: Full support for colors, images, icons, and custom CSS classes

#### Interactions (Sprint 4)
- **Pan & Zoom**: Smooth panning and zooming with mouse, wheel, and touch gestures
- **Keyboard Navigation**: Complete keyboard accessibility (arrow keys, +/-, Home/End, Page Up/Down)
- **Band Synchronization**: Multiple bands stay in sync during interactions
- **Highlight Bands**: Visual feedback for band interactions
- **Event Filtering**: Filter events by text, date range, or custom criteria
- **Event Search**: Real-time search with highlighting
- **Animated Transitions**: Smooth animations for scroll, zoom, and focus changes
- **Touch Gestures**: Pinch-to-zoom and two-finger pan on touch devices

#### Performance & Polish (Sprints 5 & 7)
- **Virtualization**: Automatic virtualization for datasets >500 events
- **Adaptive Rendering**: Canvas fallback when FPS drops or event count exceeds thresholds
- **Performance Monitoring**: Real-time FPS tracking and performance metrics
- **Performance Overlay**: Developer tool showing FPS, render time, and event counts
- **Theme System**: Built-in light/dark mode support with auto-detection
- **Custom Themes**: Full theming API for custom color schemes
- **Hot Zones Navigation**: Edge-based navigation with hover-to-scroll
- **Panning Bounds**: Prevents scrolling into empty void
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

#### Testing & Documentation (Sprint 6)
- **Test Suite**: 348 tests with >80% code coverage
- **API Documentation**: Comprehensive API reference
- **Migration Guide**: Step-by-step guide from original Simile Timeline
- **Examples**: Multiple usage examples and recipes
- **Performance Guide**: Optimization strategies and best practices

### Performance Achievements

- ✅ Render 500 events in <100ms
- ✅ Maintain 60fps scrolling with 1000+ events
- ✅ Bundle size <150KB gzipped
- ✅ First contentful paint <1s
- ✅ Time to interactive <2s

### Known Limitations

- **Alpha Status**: API may change before v1.0.0
- **Storybook**: Not yet integrated (planned for beta)
- **IE11**: Not supported (modern browsers only: Chrome, Firefox, Safari, Edge)
- **Server-Side Rendering**: Limited SSR support (client-side rendering recommended)
- **Mobile Gestures**: Basic touch support (advanced gestures in development)
- **Large Datasets**: Performance may degrade with >5000 events (use virtualization)
- **Custom Painters**: Plugin architecture not yet available

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari/Chrome: Latest 2 versions

### Dependencies

- React 18.0.0+
- React DOM 18.0.0+
- date-fns 3.0.0+
- Zustand 4.5.0+

### Migration from Original Simile Timeline

See [MIGRATION.md](./docs/MIGRATION.md) for detailed migration instructions.

**Key Benefits Over Original:**
- Modern React component architecture
- Full TypeScript support with type safety
- Better performance (60fps vs 30fps)
- Touch gesture support
- WCAG 2.1 AA accessibility
- Dark mode support
- Better mobile experience
- Active maintenance and modern tooling

### Technical Stack

- **Framework**: React 18 with functional components and hooks
- **Language**: TypeScript 5.4+ (strict mode)
- **Build Tool**: Vite 5.x
- **State Management**: Zustand
- **Styling**: Tailwind CSS 3.x
- **Date Utilities**: date-fns 3.x
- **Testing**: Vitest + Testing Library
- **Package Manager**: npm

### Contributing

This is an alpha release. We welcome feedback and contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### License

MIT License - see [LICENSE](./LICENSE) for details.

### Acknowledgments

Based on the original [MIT Simile Timeline](http://www.simile-widgets.org/timeline/) project. Rebuilt from the ground up with modern React and TypeScript.

---

## Version History Summary

- **0.1.0-alpha.0** (2025-11-08) - Initial alpha release with core features
- More versions coming soon...

---

[unreleased]: https://github.com/thbst16/react-simile-timeline/compare/v0.1.0-alpha.0...HEAD
[0.1.0-alpha.0]: https://github.com/thbst16/react-simile-timeline/releases/tag/v0.1.0-alpha.0
