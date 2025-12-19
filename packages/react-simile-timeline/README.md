# React Simile Timeline

[![CI](https://github.com/thbst16/react-simile-timeline/actions/workflows/ci.yml/badge.svg)](https://github.com/thbst16/react-simile-timeline/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/react-simile-timeline.svg)](https://www.npmjs.com/package/react-simile-timeline)
[![npm downloads](https://img.shields.io/npm/dm/react-simile-timeline.svg)](https://www.npmjs.com/package/react-simile-timeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A modern React implementation of the [MIT SIMILE Timeline](https://www.simile-widgets.org/timeline/) visualization component. Build beautiful, interactive timelines with ease.

<p align="center">
  <strong>
    <a href="https://react-simile-timeline.vercel.app/">Live Demo</a> •
    <a href="#installation">Installation</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#api-reference">API</a> •
    <a href="https://github.com/thbst16/react-simile-timeline">GitHub</a>
  </strong>
</p>

---

## Why React Simile Timeline?

| Feature | Description |
|---------|-------------|
| **100% Simile Compatible** | Drop-in replacement for existing Simile Timeline JSON data |
| **High Performance** | 60+ FPS smooth scrolling with optimized rendering |
| **Modern Stack** | Built with React 18/19, TypeScript, and hooks |
| **Multi-Band** | Two-band, three-band, or custom configurations |
| **Fully Themeable** | Classic, dark, and custom themes via CSS variables |
| **Accessible** | ARIA labels, keyboard navigation, screen reader support |
| **Lightweight** | ~12KB gzipped, zero runtime dependencies |

---

## Installation

```bash
npm install react-simile-timeline
```

```bash
yarn add react-simile-timeline
```

```bash
pnpm add react-simile-timeline
```

---

## Quick Start

```tsx
import { Timeline } from 'react-simile-timeline';
import 'react-simile-timeline/style.css';

function App() {
  const data = {
    dateTimeFormat: 'iso8601',
    events: [
      { start: '2024-01-15', title: 'Project Started', color: '#4a90d9' },
      { start: '2024-03-01', end: '2024-06-30', title: 'Development', isDuration: true, color: '#6b8e5f' },
      { start: '2024-07-01', title: 'Launch Day', color: '#c41e3a' },
    ],
  };

  return <Timeline data={data} height={400} />;
}
```

---

## Examples

### Load Data from URL

```tsx
<Timeline
  dataUrl="/api/events.json"
  height={400}
  onEventClick={(event) => console.log(event)}
/>
```

### Hot Zones (Highlighted Periods)

```tsx
<Timeline
  data={data}
  hotZones={[
    {
      start: '2024-03-01',
      end: '2024-06-30',
      color: 'rgba(107, 142, 95, 0.15)',
      annotation: 'Development Sprint',
    },
  ]}
  height={400}
/>
```

### Multi-Band Timeline

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

### Dark Theme

```tsx
<Timeline data={data} theme="dark" height={400} />
```

### Custom Theme

```tsx
<Timeline
  data={data}
  theme={{
    name: 'ocean',
    backgroundColor: '#0f172a',
    eventColor: '#38bdf8',
    eventTextColor: '#e2e8f0',
    scaleColor: '#94a3b8',
    gridColor: '#334155',
  }}
  height={400}
/>
```

---

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
| `branding` | `boolean \| BrandingConfig` | - | Show watermark |
| `className` | `string` | - | Container CSS class |

### Event Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `start` | `string` | Yes | Start date (ISO 8601) |
| `title` | `string` | Yes | Display title |
| `end` | `string` | No | End date for duration events |
| `description` | `string` | No | Shown in popup |
| `isDuration` | `boolean` | No | Force duration rendering |
| `color` | `string` | No | Background color |
| `textColor` | `string` | No | Label text color |
| `icon` | `string` | No | URL to custom icon |
| `image` | `string` | No | URL to event image |
| `link` | `string` | No | URL for "more info" |

### TypeScript Types

```typescript
interface TimelineData {
  dateTimeFormat?: 'iso8601' | 'Gregorian' | string;
  events: TimelineEvent[];
}

interface BandConfig {
  id?: string;
  height?: string;
  timeUnit?: 'day' | 'week' | 'month' | 'year' | 'decade' | 'century';
  intervalPixels?: number;
  overview?: boolean;
  syncWith?: string;
}

interface HotZone {
  start: string;
  end: string;
  color?: string;
  annotation?: string;
}

interface Theme {
  name: string;
  backgroundColor?: string;
  eventColor?: string;
  eventTextColor?: string;
  scaleColor?: string;
  gridColor?: string;
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Pan left/right |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `Escape` | Close popup |

---

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

**Supported date formats:**
- ISO 8601: `2023-01-15`, `2023-01-15T10:30:00`
- Legacy: `Jan 15 2023`, `January 15, 2023`
- Year only: `2023`, `-500` (BCE)

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Edge | Latest |

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/thbst16/react-simile-timeline/blob/main/CONTRIBUTING.md) for details.

---

## License

MIT License - see [LICENSE](https://github.com/thbst16/react-simile-timeline/blob/main/LICENSE) for details.

---

## Links

- [Live Demo](https://react-simile-timeline.vercel.app/)
- [GitHub Repository](https://github.com/thbst16/react-simile-timeline)
- [Issue Tracker](https://github.com/thbst16/react-simile-timeline/issues)
- [Changelog](https://github.com/thbst16/react-simile-timeline/blob/main/CHANGELOG.md)

---

<p align="center">
  Made with React • TypeScript • MIT SIMILE Timeline
</p>
