# API Reference

## Timeline Component

The main component for rendering timeline visualizations.

### Import

```tsx
import { Timeline } from 'react-simile-timeline';
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `TimelineData` | No* | - | Inline timeline event data |
| `dataUrl` | `string` | No* | - | URL to fetch timeline data from |
| `bands` | `BandConfig[]` | No | Default 2-band | Band configuration array |
| `hotZones` | `HotZone[]` | No | - | Hot zone configurations |
| `theme` | `Theme \| 'classic' \| 'dark'` | No | `'classic'` | Theme configuration |
| `centerDate` | `string \| Date` | No | Auto | Initial center date |
| `width` | `string \| number` | No | `'100%'` | Container width |
| `height` | `string \| number` | No | `400` | Container height |
| `onEventClick` | `(event: TimelineEvent) => void` | No | - | Event click callback |
| `onEventHover` | `(event: TimelineEvent \| null) => void` | No | - | Event hover callback |
| `onScroll` | `(centerDate: Date) => void` | No | - | Scroll/pan callback |
| `onZoom` | `(zoomLevel: number) => void` | No | - | Zoom callback |
| `className` | `string` | No | - | CSS class for container |
| `style` | `React.CSSProperties` | No | - | Inline styles for container |

*Either `data` or `dataUrl` must be provided.

### Basic Usage

```tsx
// With URL data source
<Timeline
  dataUrl="/api/events.json"
  height={400}
  onEventClick={(event) => console.log('Clicked:', event)}
/>

// With inline data
<Timeline
  data={{
    dateTimeFormat: 'iso8601',
    events: [
      { start: '2023-01-01', title: 'Event 1' },
      { start: '2023-06-15', title: 'Event 2' },
    ],
  }}
  height={400}
/>
```

---

## Types

### TimelineEvent

A single timeline event, compatible with Simile Timeline JSON format.

```typescript
interface TimelineEvent {
  // Required
  start: string;           // Start date (ISO 8601 or parseable string)
  title: string;           // Display title

  // Optional
  end?: string;            // End date for duration events
  description?: string;    // Longer description (can include HTML)
  isDuration?: boolean;    // Explicitly mark as duration event
  durationEvent?: boolean; // Alias for isDuration (legacy)
  color?: string;          // Background color (hex or CSS color)
  textColor?: string;      // Text color for label
  icon?: string;           // URL to custom icon
  image?: string;          // URL to event image
  link?: string;           // URL for more info
  caption?: string;        // Hover caption
  classname?: string;      // CSS class for custom styling
  tapeImage?: string;      // Pattern image URL for tape
  tapeRepeat?: string;     // CSS background-repeat for tape
  trackNum?: number;       // Track number for positioning
}
```

### TimelineData

Root structure for timeline data.

```typescript
interface TimelineData {
  dateTimeFormat?: 'iso8601' | 'Gregorian' | string;
  wikiURL?: string;
  wikiSection?: string;
  events: TimelineEvent[];
}
```

### BandConfig

Configuration for a timeline band.

```typescript
interface BandConfig {
  id?: string;                    // Unique band identifier
  height?: string;                // Band height (CSS value)
  timeUnit?: TimeUnit;            // Scale unit
  intervalPixels?: number;        // Pixels per interval
  overview?: boolean;             // Is overview band
  syncWith?: string;              // ID of band to sync with
  showEventLabels?: boolean;      // Show event labels
  trackHeight?: number;           // Track height for stacking
  trackGap?: number;              // Gap between tracks
}

type TimeUnit =
  | 'millisecond' | 'second' | 'minute' | 'hour'
  | 'day' | 'week' | 'month' | 'year'
  | 'decade' | 'century';
```

### HotZone

Configuration for highlighted time periods.

```typescript
interface HotZone {
  start: string;          // Start date
  end: string;            // End date
  unit?: string;          // Display unit
  magnify?: number;       // Magnification factor
  color?: string;         // Background color
  annotation?: string;    // Text annotation
}
```

### Theme

Theme configuration for timeline styling.

```typescript
interface Theme {
  name: string;
  backgroundColor?: string;
  eventColor?: string;
  eventTextColor?: string;
  tapeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  scaleColor?: string;
  gridColor?: string;
  hotZoneColor?: string;
}
```

---

## Simile JSON Compatibility

The component is 100% compatible with legacy Simile Timeline JSON format.

### Example JSON

```json
{
  "dateTimeFormat": "iso8601",
  "events": [
    {
      "start": "1963-11-22T12:30:00",
      "title": "JFK Assassination",
      "description": "President Kennedy shot in Dallas",
      "color": "#c41e3a"
    },
    {
      "start": "1961-01-20",
      "end": "1963-11-22",
      "title": "Kennedy Presidency",
      "isDuration": true,
      "color": "#4a90d9"
    }
  ]
}
```

### Supported Date Formats

- ISO 8601: `2023-01-15`, `2023-01-15T10:30:00`, `2023-01-15T10:30:00Z`
- Legacy: `Jan 15 2023`, `January 15, 2023`
- Year only: `2023` (interpreted as Jan 1)
- BCE dates: `-500` (500 BCE)
