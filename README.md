# React Simile Timeline

[![npm version](https://img.shields.io/npm/v/react-simile-timeline)](https://www.npmjs.com/package/react-simile-timeline)
[![npm downloads](https://img.shields.io/npm/dm/react-simile-timeline)](https://www.npmjs.com/package/react-simile-timeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-success)](./src/__tests__)
[![Coverage](https://img.shields.io/badge/coverage->80%25-success)](./docs/PERFORMANCE.md)
[![Bundle Size](https://img.shields.io/badge/bundle-50.98KB%20gzipped-success)](./docs/PERFORMANCE.md)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://react-simile-timeline.vercel.app/)

A modern, production-ready React port of MIT's Simile Timeline widget. Built with TypeScript, optimized for performance, and 100% compatible with original Simile JSON format.

> 🎉 **v1.0.0 Stable Release!** The API is now frozen until v2.0. New features: HTML sanitization (XSS prevention), frozen API, complete documentation suite. [See what's new](#whats-new-in-v100)
>
> Install: `npm install react-simile-timeline`

## 🎮 Live Demo

**[View Interactive Demo →](https://react-simile-timeline.vercel.app/)**

Try the interactive demo with:
- 📊 **3 Demo Timelines**: World History, JFK Assassination, World Cup 2006
- 🎨 **Theme Switcher**: Classic Vintage, Dark, Auto modes
- 🎛️ **Timeline Controls**: Event count, date range, reset button
- 🖱️ **Panning Bounds**: Smooth dragging with limits
- ⌨️ **Full Keyboard Navigation**
- 📱 **Mobile Responsive**

## 🎉 What's New in v1.0.0

**v1.0.0 Stable Release** (November 16, 2025) - The API is now frozen until v2.0!

### 🔒 Security
- **HTML Sanitization**: Event descriptions automatically sanitized with DOMPurify to prevent XSS attacks
- **Safe Defaults**: Only safe HTML tags allowed (text formatting, links, lists, tables)
- **XSS Prevention**: Scripts, event handlers, and dangerous URLs automatically blocked

### 📚 Complete Documentation Suite (2,769 lines)
- **[MIGRATION.md](./docs/MIGRATION.md)**: Beta → v1.0 upgrade guide with examples
- **[BREAKING_CHANGES.md](./docs/BREAKING_CHANGES.md)**: Detailed breaking changes documentation
- **[SECURITY.md](./docs/SECURITY.md)**: Security best practices and XSS prevention
- **[THEMING.md](./docs/THEMING.md)**: Complete theming guide with custom theme creation

### 🔐 API Freeze
- All public APIs frozen until v2.0 (no breaking changes in v1.x)
- TypeScript interfaces, component props, and hooks are now stable
- Safe to use in production with confidence

### ✅ Quality Metrics
- **50.98 KB gzipped** (66% under 150KB target)
- **399/399 tests passing** (100%)
- **60fps performance** with 1000+ events
- **WCAG 2.1 AA compliant**
- **TypeScript strict mode** with 0 errors

**[Full Release Notes →](./RELEASE_NOTES_v1.0.0.md)**

## ✨ Features

- 🎯 **100% JSON Compatible** - Load original Simile timeline data without modification
- ⚡ **High Performance** - Virtualization + Canvas rendering for 1000+ events at 60fps
- ♿ **WCAG 2.1 AA Accessible** - Full keyboard navigation, screen reader support, color contrast
- 🎨 **Themeable** - Classic theme + Dark mode + Custom themes
- 📱 **Mobile First** - Touch gestures, pinch-to-zoom, responsive design
- 🔧 **TypeScript** - Fully typed with strict mode
- 🎭 **Advanced Features** - Hot zones, filtering, animations, band synchronization
- 🧪 **Well Tested** - 348 tests with >80% coverage

## 📦 Installation

**Stable Release (v1.0.0):**
```bash
npm install react-simile-timeline
# or
yarn add react-simile-timeline
# or
pnpm add react-simile-timeline
```

This installs **v1.0.0** (stable, production-ready).

## 🚀 Quick Start

```tsx
import { Timeline, ThemeProvider } from 'react-simile-timeline';

function App() {
  return (
    <ThemeProvider>
      <Timeline
        dataUrl="/events.json"
        bands={[
          {
            width: '70%',
            intervalUnit: 'MONTH',
            intervalPixels: 100,
          },
          {
            width: '30%',
            intervalUnit: 'YEAR',
            intervalPixels: 200,
            syncWith: 0,
            highlight: true,
          },
        ]}
        width="100%"
        height={600}
      />
    </ThemeProvider>
  );
}
```

### Event Data Format

Use the same JSON format as original Simile Timeline:

```json
{
  "events": [
    {
      "title": "World Cup 2006",
      "start": "2006-06-09T00:00:00Z",
      "end": "2006-07-09T00:00:00Z",
      "isDuration": true,
      "description": "FIFA World Cup in Germany",
      "image": "worldcup.jpg",
      "link": "https://example.com"
    }
  ]
}
```

## 📚 Documentation

- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Migration Guide](./docs/MIGRATION.md)** - Migrating from original Simile
- **[Examples](./docs/EXAMPLES.md)** - Code examples and recipes
- **[Performance Guide](./docs/PERFORMANCE.md)** - Optimization tips
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute
- **[Changelog](./CHANGELOG.md)** - Version history

## 🎯 Core Features

### Theming

Switch between light and dark modes, or create custom themes:

```tsx
import { ThemeProvider, useThemeToggle } from 'react-simile-timeline';

function App() {
  const { isDark, toggle } = useThemeToggle();

  return (
    <ThemeProvider defaultMode="auto">
      <button onClick={toggle}>
        {isDark ? 'Light' : 'Dark'} Mode
      </button>
      <Timeline {...props} />
    </ThemeProvider>
  );
}
```

### Keyboard Navigation

Full keyboard support out of the box:
- Arrow keys: Scroll timeline
- +/- or PgUp/PgDn: Zoom in/out
- Home/End: Jump to start/end
- ESC: Close popups
- Custom shortcuts supported

```tsx
import { useKeyboardNav } from 'react-simile-timeline';

const keyboard = useKeyboardNav({
  onNavigate: (direction) => scroll(direction),
  onZoom: (direction) => zoom(direction),
});

// Register custom shortcut
keyboard.registerShortcut({
  key: 'h',
  description: 'Go to today',
  handler: () => goToToday(),
});
```

### Touch Support

- **Drag to scroll** - Smooth momentum scrolling
- **Pinch to zoom** - Natural pinch gestures
- **Swipe navigation** - Fast event browsing
- **44px touch targets** - Mobile-optimized

### Virtualization

Automatically renders only visible events for optimal performance:

```tsx
import { useVirtualization } from 'react-simile-timeline';

const { visibleEvents, stats } = useVirtualization({
  events: allEvents,
  viewportStart: 0,
  viewportEnd: 1000,
  getEventStart,
  getEventEnd,
  threshold: 100, // Activate at 100+ events
});

console.log(stats.renderPercentage); // "8.5%"
console.log(stats.memorySaved); // "920KB"
```

### Canvas Rendering

Automatic Canvas fallback for large datasets:

```tsx
import { useAdaptiveRenderer } from 'react-simile-timeline';

const { method, reason } = useAdaptiveRenderer({
  eventCount: events.length,
  canvasThreshold: 1000, // Switch to Canvas at 1000+ events
});

// Automatically uses DOM for <1000, Canvas for 1000+
```

### Hot Zones

Variable time resolution for focused periods:

```tsx
import { useHotZones } from 'react-simile-timeline';

const hotZones = useHotZones({
  initialZones: [{
    start: '2020-06-01',
    end: '2020-08-31',
    magnify: 3, // 3x magnification
    unit: 'DAY',
  }],
});

hotZones.addZone({
  start: '2021-01-01',
  end: '2021-12-31',
  magnify: 2,
});
```

### Event Filtering & Search

Built-in filtering and full-text search:

```tsx
import { useEventFilter } from 'react-simile-timeline';

const filter = useEventFilter({
  events,
  initialFilters: {
    dateRange: { start: new Date('2020-01-01'), end: new Date('2020-12-31') },
    attributes: { isDuration: true },
  },
});

filter.setSearchQuery('Kennedy');
filter.setFilters({ attributes: { color: 'blue' } });
```

### Responsive Design

Automatic adaptation to device type:

```tsx
import { useResponsive } from 'react-simile-timeline';

const responsive = useResponsive();

<Timeline
  height={responsive.recommendations.bandHeight}
  trackHeight={responsive.recommendations.trackHeight}
  enableTouch={responsive.isTouch}
/>
```

### Accessibility

WCAG 2.1 AA compliant with:
- Keyboard navigation
- Screen reader announcements
- ARIA labels
- Focus management
- Color contrast (4.5:1 text, 3:1 UI)
- `prefers-reduced-motion` support

```tsx
import { useAccessibility } from 'react-simile-timeline';

const a11y = useAccessibility({ theme, containerRef });

// Announce to screen readers
a11y.announceEventSelection(event);

// Run accessibility audit
const audit = a11y.runAudit();
console.log('Compliance:', audit.complianceLevel); // "AA"
```

## 🎨 Advanced Examples

### Multiple Synchronized Bands

```tsx
<Timeline
  data={events}
  bands={[
    {
      id: 'detail',
      width: '70%',
      intervalUnit: 'DAY',
      intervalPixels: 100,
    },
    {
      id: 'overview-month',
      width: '20%',
      intervalUnit: 'MONTH',
      intervalPixels: 50,
      syncWith: 'detail',
      syncRatio: 0.5,
    },
    {
      id: 'overview-year',
      width: '10%',
      intervalUnit: 'YEAR',
      intervalPixels: 100,
      syncWith: 'detail',
      syncRatio: 0.1,
      highlight: true,
    },
  ]}
/>
```

### With All Features

```tsx
import {
  Timeline,
  ThemeProvider,
  useKeyboardNav,
  useEventFilter,
  useResponsive,
  useAccessibility,
} from 'react-simile-timeline';

function AdvancedTimeline() {
  const responsive = useResponsive();
  const filter = useEventFilter({ events });
  const keyboard = useKeyboardNav({ /* ... */ });
  const a11y = useAccessibility({ theme, containerRef });

  return (
    <ThemeProvider defaultMode={responsive.isMobile ? 'light' : 'auto'}>
      <Timeline
        data={filter.filteredEvents}
        bands={bands}
        height={responsive.recommendations.bandHeight}
        enableTouch={responsive.isTouch}
        onEventSelect={(event) => {
          a11y.announceEventSelection(event);
          setSelected(event);
        }}
      />
    </ThemeProvider>
  );
}
```

## 📊 Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Render 500 events | <100ms | ✅ ~85ms |
| Scroll 1000 events | 60fps | ✅ 60fps |
| Render 2000 events | Works | ✅ ~120ms (virtualized) |
| Bundle size | <150KB | ✅ ~140KB gzipped |
| First paint | <1s | ✅ ~800ms |
| Time to interactive | <2s | ✅ ~1.2s |

See [Performance Guide](./docs/PERFORMANCE.md) for optimization tips.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Type check
npm run type-check

# Lint
npm run lint
```

Current test coverage: **348 tests passing** with >80% code coverage across all components, hooks, and utilities.

## 🏗️ Development

### Library Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### Demo Development

The demo is a separate application that imports from the published npm package:

```bash
cd demo

# Install demo dependencies
npm install

# Run demo locally
npm run dev

# Build demo
npm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines.

## 📦 Repository Structure

```
react-simile-timeline/
├── src/                # Library source code
│   ├── components/     # Timeline, Band, EventBubble, etc.
│   ├── hooks/          # All custom hooks
│   ├── types/          # TypeScript definitions
│   ├── themes/         # Classic & Dark themes
│   ├── utils/          # Utilities
│   └── core/           # Core timeline logic
├── demo/               # Standalone demo app (imports from npm)
│   ├── src/            # Demo source
│   ├── public/         # Demo assets
│   └── package.json    # Demo dependencies (includes react-simile-timeline)
├── docs/               # Documentation
└── dist/               # Built library (published to npm)
```

**Note**: The demo application lives in `demo/` and imports from the published `react-simile-timeline` package, showing exactly how developers will use the library in production.

## 🌐 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions (macOS & iOS)
- Mobile: iOS Safari 14+, Chrome Android

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Thomas Beck](https://github.com/thbst16)

See [LICENSE](./LICENSE) for details.

## 🙏 Credits

Based on the original [Simile Timeline](http://www.simile-widgets.org/timeline/) by MIT.

Special thanks to:
- MIT SIMILE project for the original timeline widget
- React team for the amazing framework
- All contributors to this project

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/thbst16/react-simile-timeline/issues)
- 💬 [Discussions](https://github.com/thbst16/react-simile-timeline/discussions)

## 🗺️ Roadmap

See [CHANGELOG.md](./CHANGELOG.md) for planned features.

**Next releases:**
- [ ] Storybook integration
- [ ] Additional painter types
- [ ] Enhanced mobile gestures
- [ ] Plugin architecture
- [ ] Real-time data updates
- [ ] Export to image/PDF

---

Made with ❤️ using React, TypeScript, and modern web technologies.
