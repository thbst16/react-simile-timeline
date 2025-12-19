# React Simile Timeline

[![CI](https://github.com/thbst16/react-simile-timeline/actions/workflows/ci.yml/badge.svg)](https://github.com/thbst16/react-simile-timeline/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/react-simile-timeline.svg)](https://www.npmjs.com/package/react-simile-timeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A modern React implementation of the [MIT SIMILE Timeline](https://www.simile-widgets.org/timeline/) visualization component.

**[View Live Demo](https://react-simile-timeline.vercel.app/)**

## Features

- **100% Simile JSON Compatible** - Drop-in replacement for existing Simile Timeline data
- **High Performance** - 60+ FPS smooth scrolling with optimized rendering
- **Modern React** - Built with React 18/19, TypeScript, and hooks
- **Multi-Band Timelines** - Two-band, three-band, or custom configurations
- **Point & Duration Events** - Dots for instants, tapes for time spans
- **Hot Zones** - Highlight important time periods with annotations
- **Theming** - Classic, dark, and custom themes via CSS variables
- **Accessible** - ARIA labels, keyboard navigation, screen reader support
- **Zero Dependencies** - Only React as a peer dependency
- **Tree-Shakeable** - ~12KB gzipped

## Installation

```bash
npm install react-simile-timeline
# or
pnpm add react-simile-timeline
# or
yarn add react-simile-timeline
```

## Quick Start

```tsx
import { Timeline } from 'react-simile-timeline';
import 'react-simile-timeline/style.css';

function App() {
  return (
    <Timeline
      dataUrl="/api/events.json"
      height={400}
      onEventClick={(event) => console.log(event)}
    />
  );
}
```

### With Inline Data

```tsx
import { Timeline } from 'react-simile-timeline';
import 'react-simile-timeline/style.css';

const data = {
  dateTimeFormat: 'iso8601',
  events: [
    {
      start: '2023-01-15',
      title: 'Project Started',
      description: 'Initial project kickoff meeting',
      color: '#4a90d9',
    },
    {
      start: '2023-03-01',
      end: '2023-06-30',
      title: 'Development Phase',
      description: 'Core feature development',
      isDuration: true,
      color: '#6b8e5f',
    },
    {
      start: '2023-07-01',
      title: 'Launch Day',
      color: '#c41e3a',
    },
  ],
};

function App() {
  return <Timeline data={data} height={400} />;
}
```

### With Hot Zones

```tsx
<Timeline
  data={data}
  hotZones={[
    {
      start: '2023-03-01',
      end: '2023-06-30',
      color: 'rgba(107, 142, 95, 0.15)',
      annotation: 'Development Sprint',
    },
  ]}
  height={400}
/>
```

### With Custom Bands

```tsx
<Timeline
  data={data}
  bands={[
    { id: 'main', height: '70%', timeUnit: 'month', intervalPixels: 100 },
    { id: 'overview', height: '30%', timeUnit: 'year', overview: true, syncWith: 'main' },
  ]}
  height={400}
/>
```

### With Themes

```tsx
// Built-in dark theme
<Timeline data={data} theme="dark" />

// Custom theme
<Timeline
  data={data}
  theme={{
    name: 'sepia',
    backgroundColor: '#f5f0e6',
    eventColor: '#8b6914',
    eventTextColor: '#4a3c1f',
    scaleColor: '#6b5a3d',
    gridColor: '#d4c9b5',
  }}
/>
```

## API Reference

### Timeline Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TimelineData` | - | Inline timeline data |
| `dataUrl` | `string` | - | URL to fetch timeline JSON |
| `dataUrls` | `string[]` | - | Multiple URLs to fetch and merge |
| `bands` | `BandConfig[]` | Auto | Band configuration array |
| `hotZones` | `HotZone[]` | `[]` | Highlighted time periods |
| `theme` | `'classic' \| 'dark' \| Theme` | `'classic'` | Theme configuration |
| `centerDate` | `string \| Date` | Median | Initial center date |
| `width` | `string \| number` | `'100%'` | Container width |
| `height` | `string \| number` | `400` | Container height |
| `onEventClick` | `(event) => void` | - | Event click callback |
| `onEventHover` | `(event) => void` | - | Event hover callback |
| `onScroll` | `(date) => void` | - | Scroll/pan callback |
| `branding` | `boolean \| BrandingConfig` | - | Show watermark |
| `className` | `string` | - | Container CSS class |
| `style` | `CSSProperties` | - | Container inline styles |

### Event Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `start` | `string` | Yes | Start date (ISO 8601 or legacy format) |
| `title` | `string` | Yes | Display title |
| `end` | `string` | No | End date for duration events |
| `description` | `string` | No | Longer description (shown in popup) |
| `isDuration` | `boolean` | No | Force duration rendering |
| `color` | `string` | No | Background color |
| `textColor` | `string` | No | Label text color |
| `icon` | `string` | No | URL to custom icon |
| `image` | `string` | No | URL to event image |
| `link` | `string` | No | URL for "more info" |
| `classname` | `string` | No | Custom CSS class |
| `tapeImage` | `string` | No | Background image for duration tape |
| `tapeRepeat` | `string` | No | CSS background-repeat value |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Pan left/right |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `Escape` | Close popup |

## Simile JSON Compatibility

This library is 100% compatible with the original Simile Timeline JSON format:

```json
{
  "dateTimeFormat": "iso8601",
  "events": [
    {
      "start": "1963-11-22",
      "title": "JFK Assassination",
      "description": "President Kennedy assassinated in Dallas, Texas.",
      "color": "#c41e3a"
    }
  ]
}
```

Supported date formats:
- ISO 8601: `2023-01-15`, `2023-01-15T10:30:00`
- Legacy: `Jan 15 2023`, `January 15, 2023`
- Year only: `2023`, `-500` (BCE)

## Development

This project uses a pnpm monorepo structure:

```bash
# Install dependencies
pnpm install

# Start demo dev server
pnpm dev

# Build library
pnpm build:lib

# Run tests
pnpm test        # Unit tests (Vitest)
pnpm test:e2e    # E2E tests (Playwright)

# Code quality
pnpm lint
pnpm format
pnpm typecheck
```

## Project Structure

```
├── packages/
│   └── react-simile-timeline/   # NPM library
├── demo/                        # Demo application
├── docs/                        # Documentation
└── project-background/          # PRD and specifications
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

This project is a modern reimplementation of the original [MIT SIMILE Timeline](https://www.simile-widgets.org/timeline/) project, preserving its intuitive visualization approach while leveraging modern React patterns.
