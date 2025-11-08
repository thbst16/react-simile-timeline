# Simile Timeline React - API Documentation

Complete API reference for all components, hooks, and utilities.

## Table of Contents

- [Components](#components)
  - [Timeline](#timeline)
  - [Band](#band)
  - [EventBubble](#eventbubble)
- [Hooks](#hooks)
  - [Interaction Hooks](#interaction-hooks)
  - [Performance Hooks](#performance-hooks)
  - [Theme Hooks](#theme-hooks)
  - [Accessibility Hooks](#accessibility-hooks)
- [Types](#types)
- [Utilities](#utilities)

---

## Components

### Timeline

Main timeline component for rendering events across time.

```tsx
import { Timeline } from 'simile-timeline-react';

<Timeline
  data={eventData}
  bands={bandConfig}
  width="100%"
  height={600}
  theme="classic"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `EventData` | required | Event data in Simile JSON format |
| `dataUrl` | `string` | - | URL to fetch event data from |
| `bands` | `BandConfig[]` | required | Band configuration array |
| `width` | `string \| number` | `"100%"` | Timeline width |
| `height` | `string \| number` | `600` | Timeline height |
| `theme` | `string \| TimelineTheme` | `"classic"` | Theme name or custom theme object |
| `ariaLabel` | `string` | - | Accessible label for screen readers |
| `bubbleWidth` | `number` | `250` | Event bubble width |
| `bubbleHeight` | `number` | `200` | Event bubble max height |

#### Events

```tsx
<Timeline
  onEventSelect={(event) => console.log('Selected:', event)}
  onEventHover={(event) => console.log('Hovered:', event)}
  onDateChange={(date) => console.log('Center date:', date)}
  onZoomChange={(zoom) => console.log('Zoom level:', zoom)}
/>
```

---

### Band

Individual timeline band component.

```tsx
import { Band } from 'simile-timeline-react';

<Band
  id="band-1"
  width="100%"
  height={150}
  intervalUnit="MONTH"
  intervalPixels={100}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique band identifier |
| `width` | `number \| string` | required | Band width |
| `height` | number | `150` | Band height in pixels |
| `intervalUnit` | `IntervalUnit` | `"MONTH"` | Time interval unit |
| `intervalPixels` | `number` | `100` | Pixels per interval |
| `trackHeight` | `number` | `20` | Event track height |
| `trackGap` | `number` | `2` | Gap between tracks |
| `syncWith` | `string` | - | ID of band to sync with |
| `highlight` | `boolean` | `false` | Highlight this band |

---

### EventBubble

Info bubble for displaying event details.

```tsx
import { EventBubble } from 'simile-timeline-react';

<EventBubble
  event={selectedEvent}
  x={100}
  y={200}
  width={250}
  height={200}
  onClose={() => setSelectedEvent(null)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `event` | `TimelineEvent` | required | Event to display |
| `x` | `number` | required | Bubble X position |
| `y` | `number` | required | Bubble Y position |
| `width` | `number` | `250` | Bubble width |
| `height` | `number` | `200` | Bubble max height |
| `onClose` | `() => void` | - | Close callback |

---

## Hooks

### Interaction Hooks

#### useKeyboardNav

Keyboard navigation for timeline.

```tsx
import { useKeyboardNav } from 'simile-timeline-react';

const keyboard = useKeyboardNav({
  onNavigate: (direction) => scroll(direction),
  onZoom: (direction) => zoom(direction),
  onSelect: () => selectEvent(),
});

// Register custom shortcut
keyboard.registerShortcut({
  key: 'h',
  description: 'Go home',
  handler: () => goToToday(),
});
```

**Options:**
- `onNavigate?: (direction: 'left' | 'right' | 'up' | 'down') => void`
- `onZoom?: (direction: 'in' | 'out') => void`
- `onSelect?: () => void`
- `onEscape?: () => void`
- `enableArrowKeys?: boolean` (default: `true`)
- `enableZoomKeys?: boolean` (default: `true`)

**Returns:**
- `registerShortcut: (shortcut: KeyboardShortcut) => void`
- `unregisterShortcut: (key: string) => void`
- `shortcuts: Map<string, KeyboardShortcut>`

---

#### useTimelineScroll

Mouse and touch scrolling.

```tsx
import { useTimelineScroll } from 'simile-timeline-react';

const scroll = useTimelineScroll({
  containerRef,
  onScroll: (deltaX) => handleScroll(deltaX),
  enableMomentum: true,
  enableTouch: true,
});
```

**Options:**
- `containerRef: React.RefObject<HTMLElement>`
- `onScroll?: (deltaX: number, deltaY: number) => void`
- `enableDrag?: boolean` (default: `true`)
- `enableTouch?: boolean` (default: `true`)
- `enableMomentum?: boolean` (default: `true`)
- `friction?: number` (default: `0.95`)
- `debounceMs?: number` (default: `16`)

---

#### usePanZoom

Pan and zoom interactions.

```tsx
import { usePanZoom } from 'simile-timeline-react';

const panZoom = usePanZoom({
  zoom: 1,
  setZoom: (z) => setZoom(z),
  minZoom: 0.1,
  maxZoom: 10,
  enableWheel: true,
  enablePinch: true,
});
```

**Options:**
- `zoom: number`
- `setZoom: (zoom: number) => void`
- `minZoom?: number` (default: `0.1`)
- `maxZoom?: number` (default: `10`)
- `enableWheel?: boolean` (default: `true`)
- `enablePinchZoom?: boolean` (default: `true`)
- `zoomSpeed?: number` (default: `0.1`)

---

#### useBandSync

Synchronize multiple timeline bands.

```tsx
import { useBandSync } from 'simile-timeline-react';

const sync = useBandSync({
  bands: [
    { id: 'overview', syncRatio: 0.1 },
    { id: 'detail', syncRatio: 1 },
  ],
  onBandScroll: (bandId, delta) => scrollBand(bandId, delta),
});

// Notify when a band scrolls
sync.notifyScroll('detail', 100);
```

---

#### useEventFilter

Filter and search events.

```tsx
import { useEventFilter } from 'simile-timeline-react';

const filter = useEventFilter({
  events: allEvents,
  initialFilters: {
    dateRange: { start: new Date('2020-01-01'), end: new Date('2020-12-31') },
  },
  enableSearch: true,
});

// Update search
filter.setSearchQuery('Kennedy');

// Update filters
filter.setFilters({
  attributes: { isDuration: true },
});
```

---

#### useAnimatedTransition

Smooth animations with easing.

```tsx
import { useAnimatedTransition, easings } from 'simile-timeline-react';

const animation = useAnimatedTransition({
  from: 0,
  to: 100,
  duration: 300,
  easing: easings.easeInOutCubic,
  onUpdate: (value) => setPosition(value),
});

animation.start();
```

**Easing Functions:**
- `linear`
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInQuart`, `easeOutQuart`, `easeInOutQuart`
- `easeInQuint`, `easeOutQuint`, `easeInOutQuint`

---

### Performance Hooks

#### useVirtualization

Render only visible events.

```tsx
import { useVirtualization } from 'simile-timeline-react';

const virtualization = useVirtualization({
  events: allEvents,
  viewportStart: 0,
  viewportEnd: 1000,
  getEventStart: (event) => dateToPixel(event.start),
  getEventEnd: (event) => dateToPixel(event.end),
  bufferSize: 200,
  threshold: 100,
});

// Render only visible events
{virtualization.visibleEvents.map(event => <Event key={event.id} {...event} />)}
```

**Statistics:**
```tsx
console.log(virtualization.stats.renderPercentage); // e.g., 8.5%
console.log(virtualization.stats.memorySaved); // e.g., "920KB"
```

---

#### useCanvasRenderer

High-performance Canvas rendering.

```tsx
import { useCanvasRenderer } from 'simile-timeline-react';

const canvasRef = useRef<HTMLCanvasElement>(null);

const renderer = useCanvasRenderer({
  canvasRef,
  events: visibleEvents,
  theme,
  viewportStart: 0,
  viewportEnd: 1000,
  width: 1000,
  height: 400,
  getEventStart: (e) => dateToPixel(e.start),
  getEventEnd: (e) => dateToPixel(e.end),
  getEventTrack: (e) => e.track || 0,
  quality: 'high',
});

// Hit testing
const event = renderer.getEventAtPoint(mouseX, mouseY);
```

---

#### useAdaptiveRenderer

Automatically switch between DOM and Canvas.

```tsx
import { useAdaptiveRenderer } from 'simile-timeline-react';

const adaptive = useAdaptiveRenderer({
  eventCount: events.length,
  canvasThreshold: 1000,
  enableAutoSwitch: true,
});

if (adaptive.method === 'canvas') {
  return <CanvasEventLayer />;
} else {
  return <DOMEventLayer />;
}
```

---

#### useHotZones

Variable time resolution.

```tsx
import { useHotZones } from 'simile-timeline-react';

const hotZones = useHotZones({
  initialZones: [
    {
      start: '2020-06-01',
      end: '2020-08-31',
      magnify: 3,
      unit: 'DAY',
    },
  ],
});

// Add zone
hotZones.addZone({
  start: '2021-01-01',
  end: '2021-12-31',
  magnify: 2,
});

// Get magnification at date
const mag = hotZones.getMagnificationAt(new Date('2020-07-15')); // 3
```

---

### Theme Hooks

#### useTheme

Access timeline theme.

```tsx
import { useTheme } from 'simile-timeline-react';

const { theme, mode, setMode, setTheme } = useTheme();

// Switch to dark mode
setMode('dark');

// Use theme colors
<div style={{ background: theme.colors.band.background }} />
```

---

#### useThemeColors

Convenience hook for colors.

```tsx
import { useThemeColors } from 'simile-timeline-react';

const colors = useThemeColors();

<Event color={colors.event.tape} />
```

---

#### useThemeToggle

Toggle between light/dark.

```tsx
import { useThemeToggle } from 'simile-timeline-react';

const { isDark, toggle } = useThemeToggle();

<button onClick={toggle}>
  {isDark ? 'Light' : 'Dark'} Mode
</button>
```

---

### Accessibility Hooks

#### useAccessibility

WCAG 2.1 AA compliance.

```tsx
import { useAccessibility } from 'simile-timeline-react';

const a11y = useAccessibility({
  theme,
  containerRef,
  eventCount: events.length,
});

// Announce to screen readers
a11y.announce('Timeline loaded with 150 events');

// Announce event selection
a11y.announceEventSelection(selectedEvent);

// Run accessibility audit
const audit = a11y.runAudit();
console.log('Issues:', audit.issues);
console.log('Compliance:', audit.complianceLevel);
```

---

#### useResponsive

Responsive design support.

```tsx
import { useResponsive } from 'simile-timeline-react';

const responsive = useResponsive({
  breakpoints: { mobile: 640, tablet: 1024 },
});

// Use responsive settings
<Timeline
  height={responsive.recommendations.bandHeight}
  trackHeight={responsive.recommendations.trackHeight}
  enableTouch={responsive.isTouch}
/>
```

---

## Types

### TimelineEvent

```typescript
interface TimelineEvent {
  id?: string;
  title: string;
  start: string;
  end?: string;
  isDuration?: boolean;
  description?: string;
  image?: string;
  link?: string;
  icon?: string;
  color?: string;
  textColor?: string;
  classname?: string;
  caption?: string;
  [key: string]: any;
}
```

### BandConfig

```typescript
interface BandConfig {
  id?: string;
  width: string | number;
  intervalUnit: IntervalUnit;
  intervalPixels: number;
  date?: string | Date;
  timeZone?: number;
  multiple?: number;
  theme?: string | TimelineTheme;
  syncWith?: string;
  highlight?: boolean;
  showEventText?: boolean;
  trackHeight?: number;
  trackGap?: number;
}
```

### TimelineTheme

```typescript
interface TimelineTheme {
  name: string;
  id: string;
  description?: string;
  colors: {
    band: { background: string; backgroundAlt: string; border: string };
    event: { tape: string; point: string; label: string; /* ... */ };
    timescale: { background: string; label: string; /* ... */ };
    ui: { primary: string; text: string; /* ... */ };
    highlight: { hover: string; active: string; /* ... */ };
  };
  typography: { fontFamily: string; fontSize: object; /* ... */ };
  spacing: object;
  event: object;
  band: object;
  timescale: object;
  effects: object;
  animation: object;
  borderRadius: object;
  zIndex: object;
}
```

---

## Utilities

### Date Utilities

```typescript
import { parseDate, formatDate, addInterval } from 'simile-timeline-react/utils';

// Parse various date formats
const date = parseDate('2006-06-28T00:00:00Z');
const bce = parseDate('-500'); // 500 BCE

// Format dates
const formatted = formatDate(date, 'YYYY-MM-DD');

// Add intervals
const later = addInterval(date, 5, 'DAY');
```

### Accessibility Utilities

```typescript
import {
  getContrastRatio,
  meetsWCAGAA,
  announceToScreenReader
} from 'simile-timeline-react/utils';

// Check contrast
const ratio = getContrastRatio('#000', '#fff'); // 21
const passes = meetsWCAGAA('#000', '#fff'); // true

// Screen reader announcement
announceToScreenReader('Timeline scrolled to 2020', 'polite');
```

### Event Filtering

```typescript
import {
  searchEvents,
  filterByDateRange,
  sortByRelevance
} from 'simile-timeline-react/utils';

const results = searchEvents(events, 'Kennedy');
const filtered = filterByDateRange(events, startDate, endDate);
const sorted = sortByRelevance(results, 'Kennedy');
```

---

## Examples

### Basic Timeline

```tsx
import { Timeline, ThemeProvider } from 'simile-timeline-react';

function App() {
  return (
    <ThemeProvider defaultMode="light">
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
          },
        ]}
        width="100%"
        height={600}
      />
    </ThemeProvider>
  );
}
```

### Custom Event Handlers

```tsx
<Timeline
  data={events}
  bands={bands}
  onEventSelect={(event) => {
    console.log('Selected:', event.title);
    setSelectedEvent(event);
  }}
  onEventHover={(event) => {
    setTooltip(event ? event.title : null);
  }}
  onDateChange={(date) => {
    console.log('Centered on:', date);
  }}
/>
```

### With All Features

```tsx
import {
  Timeline,
  ThemeProvider,
  useKeyboardNav,
  useEventFilter,
  useResponsive
} from 'simile-timeline-react';

function AdvancedTimeline() {
  const responsive = useResponsive();
  const filter = useEventFilter({ events });
  const keyboard = useKeyboardNav({ /* ... */ });

  return (
    <ThemeProvider defaultMode={responsive.isMobile ? 'light' : 'auto'}>
      <Timeline
        data={filter.filteredEvents}
        bands={bands}
        height={responsive.recommendations.bandHeight}
        enableTouch={responsive.isTouch}
      />
    </ThemeProvider>
  );
}
```

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 14+, Chrome Android

## Development Status

This project is under active development. See [../../docs/SPRINT_PLAN.md](../../docs/SPRINT_PLAN.md) for current sprint status and roadmap.

**Current Phase**: Sprint 6 complete, Sprint 7-8 planned
- Sprint 7: Complete Sprint 5 features & fix panning bounds (Days 33-35)
- Sprint 8: Publication preparation (Days 36-37)
  - CI/CD, LICENSE, CHANGELOG, CONTRIBUTING

## License

MIT
