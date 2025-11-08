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
