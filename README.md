# React Simile Timeline

[![npm version](https://img.shields.io/npm/v/react-simile-timeline)](https://www.npmjs.com/package/react-simile-timeline)
[![npm beta](https://img.shields.io/npm/v/react-simile-timeline/beta?label=beta)](https://www.npmjs.com/package/react-simile-timeline)
[![npm downloads](https://img.shields.io/npm/dm/react-simile-timeline)](https://www.npmjs.com/package/react-simile-timeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-success)](./src/__tests__)
[![Coverage](https://img.shields.io/badge/coverage->80%25-success)](./docs/PERFORMANCE.md)
[![Bundle Size](https://img.shields.io/badge/bundle-40.6KB%20gzipped-success)](./docs/PERFORMANCE.md)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://react-simile-timeline.vercel.app/)

A modern, production-ready React port of MIT's Simile Timeline widget. Built with TypeScript, optimized for performance, and 100% compatible with original Simile JSON format.

> 🎉 **Beta Release**: v0.1.0-beta.1 now available! New features: Classic Vintage theme, 3 demo timelines, timeline controls, panning bounds. [See what's new](#whats-new-in-beta1)
>
> Install beta: `npm install react-simile-timeline@beta`

## 🎮 Live Demo

**[View Interactive Demo →](https://react-simile-timeline.vercel.app/)**

Try the interactive demo with:
- 📊 **3 Demo Timelines**: World History, JFK Assassination, World Cup 2006
- 🎨 **Theme Switcher**: Classic Vintage, Dark, Auto modes
- 🎛️ **Timeline Controls**: Event count, date range, reset button
- 🖱️ **Panning Bounds**: Smooth dragging with limits
- ⌨️ **Full Keyboard Navigation**
- 📱 **Mobile Responsive**

## 🎉 What's New in Beta.1

**v0.1.0-beta.1** (November 2025) introduces major UX improvements:

- ✨ **Classic Vintage Theme**: Aged paper aesthetic with serif typography and warm sepia tones
- 📚 **Demo Timelines**: 3 pre-loaded timelines showcasing different use cases
  - 🌍 World History (10 major events, 3000 BCE - 2000 CE)
  - 🇺🇸 JFK (32 events from his life and assassination)
  - ⚽ World Cup 2006 (48 events with detailed finals coverage)
- 🎛️ **Timeline Controls**: New panel showing event count, date range, and reset button
- 🚫 **Panning Bounds**: Prevents dragging into empty space beyond event dates
- 🎨 **Theme Switcher**: Easy toggle between Classic, Dark, and Auto themes
- 🌓 **Dark Mode Polish**: Improved label contrast (#e0e0e0 on dark backgrounds)
- 📦 **Smaller Bundle**: Removed 2,000+ lines of internal demo code

**Quality**: 40.6KB gzipped, 60fps performance, TypeScript strict mode, WCAG 2.1 AA compliant

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

**Beta Version (Recommended):**
```bash
npm install react-simile-timeline@beta
# or
yarn add react-simile-timeline@beta
# or
pnpm add react-simile-timeline@beta
```

**Stable Version:**
```bash
npm install react-simile-timeline
# Gets v0.1.0-alpha.0 (previous stable)
```

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

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Run tests in watch mode
npm run test
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines.

## 📦 Package Structure

```
react-simile-timeline/
├── src/
│   ├── components/     # Timeline, Band, EventBubble, etc.
│   ├── hooks/          # All custom hooks
│   ├── types/          # TypeScript definitions
│   ├── themes/         # Classic & Dark themes
│   ├── utils/          # Utilities
│   └── core/           # Core timeline logic
├── docs/               # Documentation
└── public/             # Demo assets
```

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

**v0.1.0-alpha.0** - Initial alpha release
