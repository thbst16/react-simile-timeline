# React Simile Timeline - Product Roadmap

**Last Updated**: 2025-11-14
**Current Version**: v0.1.0-beta.3
**Next Release**: v1.0.0 (Stable)

---

## Overview

This roadmap outlines the planned features and improvements for React Simile Timeline. It provides transparency about what's included in each release and what features are deferred to future versions.

**Guiding Principles**:
- ✅ **v1.0**: Stability, security, and API freeze
- 📈 **v1.x**: Incremental improvements and new features
- 🚀 **v2.0**: Major architectural changes and breaking improvements

---

## V1.0.0 - Stable Foundation ✅ (In Progress)

**Target Release**: December 2025
**Status**: Day 1 of 5-day sprint
**Goal**: Production-ready stable release with frozen API

### Included Features

**Core Functionality**:
- ✅ Timeline rendering with multiple synchronized bands
- ✅ 3 painter types (Original, Compact, Overview)
- ✅ 100% compatibility with original Simile JSON format
- ✅ Event types: instant events, duration events (tapes)
- ✅ Event decorators for highlighting time periods
- ✅ Event bubbles with HTML content (sanitized)

**Themes & Styling**:
- ✅ Classic Vintage theme (aged paper aesthetic)
- ✅ Dark mode theme
- ✅ Auto theme (system preference detection)
- ✅ Theme persistence via localStorage
- ✅ Custom theme API (frozen)

**Performance**:
- ✅ Virtualization for 1000+ events
- ✅ Adaptive rendering (DOM/Canvas)
- ✅ 60fps scrolling and zooming
- ✅ Bundle size: 40.6 KB gzipped (73% under 150KB target)

**Accessibility**:
- ✅ WCAG 2.1 AA compliant
- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Color contrast ratios (4.5:1 text, 3:1 UI)

**Interaction**:
- ✅ Pan & zoom with mouse/wheel
- ✅ Touch gestures (basic: drag, pinch)
- ✅ Keyboard shortcuts (arrows, +/-, Home/End)
- ✅ Band synchronization
- ✅ Highlight bands
- ✅ Panning bounds (prevents scrolling into void)

**Developer Experience**:
- ✅ TypeScript (strict mode)
- ✅ Full type definitions
- ✅ Comprehensive API documentation
- ✅ Migration guide (beta → v1)
- ✅ Code examples and recipes
- ✅ 348+ tests (>80% coverage)

### Explicitly NOT Included (Deferred)

Features that **will NOT be in v1.0** but are planned for future releases:

❌ **Storybook Integration** → v1.1.0
❌ **Additional Painter Types** → v1.2.0
❌ **Advanced Touch Gestures** → v1.2.0
❌ **Mobile-Optimized Layouts** → v1.1.0
❌ **Additional Theme Presets** → v1.1.0
❌ **Plugin Architecture** → v2.0.0
❌ **Real-Time Data Updates** → v1.3.0
❌ **Export to Image/PDF** → v1.2.0

### V1.0 Critical Changes

**Breaking Changes**:
1. **HTML Sanitization** (Security): Event descriptions sanitized with DOMPurify
   - Allowed tags: `<b>`, `<i>`, `<em>`, `<strong>`, `<a>`, `<p>`, `<br>`, `<ul>`, `<ol>`, `<li>`
   - Blocked: `<script>`, `<iframe>`, `onclick`, etc.

2. **API Freeze**: All exported APIs frozen and documented
   - Component props stable
   - Hook interfaces stable
   - Theme API stable

3. **Deprecations**: None in v1.0.0

See [BREAKING_CHANGES.md](./BREAKING_CHANGES.md) for full details.

---

## V1.1.0 - UX Enhancements 📱

**Target Release**: Q1 2026 (6-8 weeks after v1.0)
**Goal**: Improved mobile experience and visual options

### Planned Features

**Mobile Optimization**:
- 📱 Mobile-specific layouts (optimized for small screens)
- 📱 Enhanced touch targets (44px minimum)
- 📱 Improved gesture handling
- 📱 Responsive band heights
- 📱 Mobile-first component variants

**Theme Enhancements**:
- 🎨 2-3 additional theme presets:
  - Light Modern (clean, minimal)
  - High Contrast (accessibility-focused)
  - Dark Blue (professional)
- 🎨 Theme customization UI component
- 🎨 Theme export/import functionality

**Developer Tools**:
- 📖 **Storybook Integration**:
  - Interactive component demos
  - All props documented
  - Visual regression testing
  - Design system documentation
- 📖 Improved debugging tools
- 📖 Performance profiler component

**UX Improvements**:
- ⚡ Smoother animations
- ⚡ Better loading states
- ⚡ Enhanced error messages
- ⚡ Improved event overlap handling

### Non-Goals for v1.1

Will NOT include:
- ❌ Plugin architecture (too large for minor release)
- ❌ Export features (deferred to v1.2)
- ❌ Real-time updates (deferred to v1.3)

---

## V1.2.0 - Advanced Features 🎯

**Target Release**: Q2 2026 (12-16 weeks after v1.0)
**Goal**: Export capabilities and visualization enhancements

### Planned Features

**Export Functionality**:
- 💾 Export timeline to PNG (client-side rendering)
- 💾 Export timeline to SVG (vector format)
- 💾 Export timeline to PDF (with jsPDF)
- 💾 Export event data to JSON/CSV
- 💾 Print-optimized layouts
- 💾 Custom export dimensions

**Additional Painters**:
- 🎨 Detailed Painter (extended labels, rich formatting)
- 🎨 Minimal Painter (ultra-compact, high-density)
- 🎨 Custom painter configuration API

**Advanced Filtering**:
- 🔍 Enhanced filtering UI component
- 🔍 Multi-criteria filters (AND/OR logic)
- 🔍 Date range slider component
- 🔍 Category/tag filtering
- 🔍 Full-text search with highlighting
- 🔍 Filter presets and saved searches

**Touch Gestures**:
- 👆 Advanced pinch-to-zoom (smooth, momentum)
- 👆 Two-finger rotation (optional)
- 👆 Swipe to navigate events
- 👆 Long-press for context menu
- 👆 Gesture customization API

### Non-Goals for v1.2

Will NOT include:
- ❌ Real-time updates (v1.3)
- ❌ Plugin architecture (v2.0)
- ❌ Major API changes (v2.0)

---

## V1.3.0 - Real-Time & Performance 🚀

**Target Release**: Q3 2026 (18-24 weeks after v1.0)
**Goal**: Real-time data support and performance optimizations

### Planned Features

**Real-Time Support**:
- ⚡ Real-time event updates (WebSocket)
- ⚡ Event streaming API
- ⚡ Incremental data loading
- ⚡ Optimistic updates
- ⚡ Conflict resolution
- ⚡ Connection state management

**Performance Improvements**:
- 🎯 Optimized bundle size (target: <120KB gzipped)
- 🎯 Tree-shaking improvements
- 🎯 Code splitting for painters
- 🎯 Lazy loading for non-critical features
- 🎯 Web Worker support for heavy calculations
- 🎯 Advanced virtualization (bi-directional)

**Data Management**:
- 📊 Data pagination
- 📊 Infinite scrolling
- 📊 Data caching strategies
- 📊 Background data prefetching
- 📊 Memory optimization

**Developer Experience**:
- 🛠️ Performance profiling tools
- 🛠️ Bundle analyzer integration
- 🛠️ Debug mode with metrics
- 🛠️ Development warnings

### Non-Goals for v1.3

Will NOT include:
- ❌ Plugin architecture (v2.0)
- ❌ Breaking API changes (v2.0)

---

## V2.0.0 - Plugin Architecture 🔌

**Target Release**: Q4 2026 (24-30 weeks after v1.0)
**Goal**: Extensibility framework and community contributions

### Planned Features (Breaking Changes)

**Plugin System**:
- 🔌 Plugin architecture (breaking change)
- 🔌 Custom painter plugin API
- 🔌 Theme plugin system
- 🔌 Event transformer plugins
- 🔌 Data source plugins
- 🔌 Extension marketplace integration

**API Improvements** (Breaking):
- 🔧 Improved component composition
- 🔧 Better TypeScript types
- 🔧 Simplified prop names (where needed)
- 🔧 Hooks API refinements
- 🔧 Context API improvements

**Architecture Updates**:
- 🏗️ Modular core architecture
- 🏗️ Dependency injection
- 🏗️ Plugin lifecycle management
- 🏗️ Hot module replacement for plugins

**Community Features**:
- 🌍 Plugin registry
- 🌍 Community themes
- 🌍 Shared painter library
- 🌍 Example gallery

### Migration Path

v1.x → v2.0 migration guide will include:
- Automated codemod for common patterns
- Deprecation warnings in v1.x releases
- Compatibility layer for gradual migration
- Detailed upgrade documentation

---

## Future Considerations (v3.0+)

Features under consideration for distant future releases:

**Potential Features**:
- 🌐 Server-side rendering (SSR) improvements
- 🌐 Multi-timeline synchronization
- 🌐 Collaborative editing
- 🌐 3D timeline visualization
- 🌐 VR/AR timeline experiences
- 🌐 AI-powered event suggestions
- 🌐 Natural language timeline queries

**Note**: These are exploratory ideas and may never be implemented depending on community feedback and project direction.

---

## Feature Request Process

### How to Request Features

1. **Check Roadmap**: See if it's already planned
2. **Search Issues**: Check if someone already requested it
3. **Open Discussion**: Start a GitHub Discussion for feedback
4. **Create Issue**: If validated, create a feature request issue

### Priority Criteria

Features are prioritized based on:
1. **User Impact**: How many users benefit?
2. **Complexity**: Development effort required
3. **Alignment**: Fits project vision?
4. **Breaking Changes**: Requires API changes?
5. **Community Interest**: Upvotes and discussion

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (v2.0.0): Breaking changes, API changes
- **MINOR** (v1.1.0): New features, backward compatible
- **PATCH** (v1.0.1): Bug fixes, no new features

**Beta/RC Tags**:
- `beta`: Feature complete, may have bugs
- `rc`: Release candidate, stable but needs validation
- `latest`: Stable production release

---

## Release Timeline

```
2025-12  v1.0.0      ──┐
                       │ 6-8 weeks
2026-02  v1.1.0      ──┤
                       │ 12-16 weeks
2026-05  v1.2.0      ──┤
                       │ 18-24 weeks
2026-08  v1.3.0      ──┤
                       │ 24-30 weeks
2026-11  v2.0.0      ──┘
```

**Note**: Timeline is approximate and subject to change based on feedback and development capacity.

---

## Communication

### Release Announcements

- **GitHub Releases**: Detailed release notes
- **npm**: Package updates
- **Blog**: Major version announcements
- **Twitter**: Quick updates
- **Discussions**: Community engagement

### Feedback Channels

- **GitHub Issues**: Bug reports
- **GitHub Discussions**: Feature requests
- **Discord/Slack**: Community chat (if established)
- **Email**: Maintainer contact

---

## Maintenance Policy

### Long-Term Support (LTS)

- **v1.x**: Supported until v2.0 release + 6 months
- **v2.x**: Support duration TBD based on adoption

### Security Updates

- **Critical vulnerabilities**: Patched immediately
- **Security patches**: Backported to LTS versions
- **Disclosure**: Responsible disclosure policy

### Deprecation Policy

1. **Announce**: Feature marked deprecated in minor release
2. **Warn**: Console warnings in development mode
3. **Document**: Migration guide provided
4. **Remove**: Removed in next major version (minimum 6 months)

---

## Contributing to the Roadmap

Want to influence the roadmap?

1. **Vote on Issues**: Use 👍 reactions on GitHub issues
2. **Share Use Cases**: Explain why you need a feature
3. **Contribute Code**: PRs for roadmap items welcome
4. **Sponsor Development**: Financial support for specific features

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## Changelog

| Date | Change |
|------|--------|
| 2025-11-14 | Initial roadmap published (v1.0 planning) |
| TBD | Update after v1.0 release |

---

**Questions or Feedback?**

- 📖 [View Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/thbst16/react-simile-timeline/issues)
- 💬 [Start Discussion](https://github.com/thbst16/react-simile-timeline/discussions)

---

*This roadmap is a living document and will be updated as priorities change and community feedback is received.*
