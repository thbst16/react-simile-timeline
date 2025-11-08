# Code Examples

Comprehensive examples for using Simile Timeline React.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Data Loading](#data-loading)
- [Multiple Bands](#multiple-bands)
- [Event Interactions](#event-interactions)
- [Theming](#theming)
- [Keyboard Navigation](#keyboard-navigation)
- [Touch Support](#touch-support)
- [Filtering & Search](#filtering--search)
- [Hot Zones](#hot-zones)
- [Performance Optimization](#performance-optimization)
- [Accessibility](#accessibility)
- [Responsive Design](#responsive-design)
- [Advanced Patterns](#advanced-patterns)

---

## Basic Usage

### Minimal Timeline

```tsx
import { Timeline } from 'react-simile-timeline';

function App() {
  const events = {
    events: [
      {
        start: '2020-01-15',
        title: 'First Event',
        description: 'This is the first event',
      },
      {
        start: '2020-03-20',
        end: '2020-04-10',
        isDuration: true,
        title: 'Duration Event',
        description: 'This spans multiple days',
      },
    ],
  };

  return (
    <Timeline
      data={events}
      bands={[
        {
          width: '100%',
          intervalUnit: 'MONTH',
          intervalPixels: 100,
        },
      ]}
      height={400}
    />
  );
}
```

### With Theme Provider

```tsx
import { Timeline, ThemeProvider } from 'react-simile-timeline';

function App() {
  return (
    <ThemeProvider defaultMode="light">
      <Timeline
        dataUrl="/events.json"
        bands={[
          {
            width: '100%',
            intervalUnit: 'MONTH',
            intervalPixels: 100,
          },
        ]}
        height={500}
      />
    </ThemeProvider>
  );
}
```

---

## Data Loading

### Load from URL

```tsx
import { Timeline } from 'react-simile-timeline';

function App() {
  return (
    <Timeline
      dataUrl="/api/events.json"
      bands={[...]}
      height={500}
      onDataLoad={(data) => console.log('Loaded:', data)}
      onDataError={(error) => console.error('Error:', error)}
    />
  );
}
```

### Load from State

```tsx
import { useState, useEffect } from 'react';
import { Timeline } from 'react-simile-timeline';

function App() {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  if (loading) return <div>Loading timeline...</div>;
  if (!events) return <div>Failed to load events</div>;

  return (
    <Timeline
      data={events}
      bands={[...]}
      height={500}
    />
  );
}
```

### Progressive Loading

```tsx
import { useState, useEffect } from 'react';
import { Timeline } from 'react-simile-timeline';

function App() {
  const [events, setEvents] = useState({ events: [] });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function loadMore() {
      const response = await fetch(`/api/events?page=${page}`);
      const data = await response.json();

      setEvents((prev) => ({
        events: [...prev.events, ...data.events],
      }));

      setHasMore(data.hasMore);
    }

    if (hasMore) loadMore();
  }, [page, hasMore]);

  return (
    <Timeline
      data={events}
      bands={[...]}
      height={500}
      onScroll={(position) => {
        // Load more when near end
        if (position > 0.8 && hasMore) {
          setPage((p) => p + 1);
        }
      }}
    />
  );
}
```

---

## Multiple Bands

### Two Synchronized Bands

```tsx
<Timeline
  data={events}
  bands={[
    {
      id: 'detail',
      width: '70%',
      intervalUnit: 'MONTH',
      intervalPixels: 100,
    },
    {
      id: 'overview',
      width: '30%',
      intervalUnit: 'YEAR',
      intervalPixels: 200,
      syncWith: 'detail',
      highlight: true,
    },
  ]}
  height={600}
/>
```

### Three Bands with Different Resolutions

```tsx
<Timeline
  data={events}
  bands={[
    {
      id: 'days',
      width: '50%',
      intervalUnit: 'DAY',
      intervalPixels: 50,
    },
    {
      id: 'months',
      width: '30%',
      intervalUnit: 'MONTH',
      intervalPixels: 100,
      syncWith: 'days',
      syncRatio: 0.5,
    },
    {
      id: 'years',
      width: '20%',
      intervalUnit: 'YEAR',
      intervalPixels: 200,
      syncWith: 'days',
      syncRatio: 0.1,
      highlight: true,
    },
  ]}
  height={700}
/>
```

---

## Event Interactions

### Event Selection

```tsx
import { useState } from 'react';
import { Timeline } from 'react-simile-timeline';

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <>
      <Timeline
        data={events}
        bands={[...]}
        height={500}
        onEventSelect={(event) => {
          console.log('Selected:', event.title);
          setSelectedEvent(event);
        }}
      />

      {selectedEvent && (
        <div className="event-details">
          <h2>{selectedEvent.title}</h2>
          <p>{selectedEvent.description}</p>
          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </>
  );
}
```

### Event Hover

```tsx
import { useState } from 'react';
import { Timeline } from 'react-simile-timeline';

function App() {
  const [hoveredEvent, setHoveredEvent] = useState(null);

  return (
    <>
      <Timeline
        data={events}
        bands={[...]}
        height={500}
        onEventHover={(event) => setHoveredEvent(event)}
      />

      {hoveredEvent && (
        <div className="tooltip">
          {hoveredEvent.title}
        </div>
      )}
    </>
  );
}
```

### Custom Event Click Handler

```tsx
<Timeline
  data={events}
  bands={[...]}
  height={500}
  onEventSelect={(event) => {
    if (event.link) {
      window.open(event.link, '_blank');
    } else {
      showEventDetails(event);
    }
  }}
/>
```

---

## Theming

### Dark Mode Toggle

```tsx
import { Timeline, ThemeProvider, useThemeToggle } from 'react-simile-timeline';

function TimelineWithToggle() {
  const { isDark, toggle } = useThemeToggle();

  return (
    <div>
      <button onClick={toggle}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>
      <Timeline data={events} bands={[...]} height={500} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultMode="auto">
      <TimelineWithToggle />
    </ThemeProvider>
  );
}
```

### Custom Theme

```tsx
import { Timeline, ThemeProvider } from 'react-simile-timeline';

const customTheme = {
  name: 'ocean',
  id: 'ocean',
  description: 'Ocean blue theme',
  colors: {
    band: {
      background: '#e3f2fd',
      backgroundAlt: '#bbdefb',
      border: '#2196f3',
    },
    event: {
      tape: '#1976d2',
      point: '#0d47a1',
      label: '#0d47a1',
      background: '#ffffff',
    },
    timescale: {
      background: '#90caf9',
      label: '#0d47a1',
      grid: '#64b5f6',
    },
    ui: {
      primary: '#2196f3',
      text: '#0d47a1',
      background: '#ffffff',
    },
  },
  // ... other theme properties
};

function App() {
  return (
    <ThemeProvider customTheme={customTheme}>
      <Timeline data={events} bands={[...]} height={500} />
    </ThemeProvider>
  );
}
```

---

## Keyboard Navigation

### Basic Keyboard Support

```tsx
import { Timeline, useKeyboardNav } from 'react-simile-timeline';

function App() {
  const keyboard = useKeyboardNav({
    onNavigate: (direction) => {
      console.log('Navigate:', direction);
    },
    onZoom: (direction) => {
      console.log('Zoom:', direction);
    },
    onSelect: () => {
      console.log('Select current event');
    },
  });

  return (
    <Timeline
      data={events}
      bands={[...]}
      height={500}
      enableKeyboard={true}
    />
  );
}
```

### Custom Keyboard Shortcuts

```tsx
import { Timeline, useKeyboardNav } from 'react-simile-timeline';

function App() {
  const keyboard = useKeyboardNav({
    onNavigate: handleNavigate,
    onZoom: handleZoom,
  });

  // Register custom shortcuts
  keyboard.registerShortcut({
    key: 't',
    description: 'Go to today',
    handler: () => goToToday(),
  });

  keyboard.registerShortcut({
    key: 'f',
    ctrl: true,
    description: 'Search events',
    handler: () => openSearch(),
  });

  return <Timeline data={events} bands={[...]} height={500} />;
}
```

---

## Touch Support

### Mobile-Optimized Timeline

```tsx
import { Timeline, useResponsive } from 'react-simile-timeline';

function App() {
  const responsive = useResponsive();

  return (
    <Timeline
      data={events}
      bands={[
        {
          width: '100%',
          intervalUnit: responsive.isMobile ? 'MONTH' : 'DAY',
          intervalPixels: responsive.isMobile ? 80 : 100,
        },
      ]}
      height={responsive.recommendations.bandHeight}
      trackHeight={responsive.recommendations.trackHeight}
      enableTouch={responsive.isTouch}
      enablePinchZoom={responsive.isTouch}
    />
  );
}
```

---

## Filtering & Search

### Event Search

```tsx
import { useState } from 'react';
import { Timeline, useEventFilter } from 'react-simile-timeline';

function App() {
  const filter = useEventFilter({
    events: allEvents,
    enableSearch: true,
  });

  return (
    <>
      <input
        type="search"
        placeholder="Search events..."
        onChange={(e) => filter.setSearchQuery(e.target.value)}
      />

      <Timeline
        data={{ events: filter.filteredEvents }}
        bands={[...]}
        height={500}
      />

      <div>
        Showing {filter.filteredEvents.length} of {allEvents.length} events
      </div>
    </>
  );
}
```

### Filter by Date Range

```tsx
import { Timeline, useEventFilter } from 'react-simile-timeline';

function App() {
  const filter = useEventFilter({
    events: allEvents,
  });

  const filterByYear = (year) => {
    filter.setFilters({
      dateRange: {
        start: new Date(`${year}-01-01`),
        end: new Date(`${year}-12-31`),
      },
    });
  };

  return (
    <>
      <div>
        <button onClick={() => filterByYear(2020)}>2020</button>
        <button onClick={() => filterByYear(2021)}>2021</button>
        <button onClick={() => filterByYear(2022)}>2022</button>
        <button onClick={() => filter.clearFilters()}>All</button>
      </div>

      <Timeline
        data={{ events: filter.filteredEvents }}
        bands={[...]}
        height={500}
      />
    </>
  );
}
```

### Filter by Attributes

```tsx
const filter = useEventFilter({
  events: allEvents,
});

// Show only duration events
filter.setFilters({
  attributes: { isDuration: true },
});

// Show only events with images
filter.setFilters({
  attributes: { hasImage: true },
});

// Combine filters
filter.setFilters({
  dateRange: {
    start: new Date('2020-01-01'),
    end: new Date('2020-12-31'),
  },
  attributes: { isDuration: true },
  properties: { category: 'sports' },
});
```

---

## Hot Zones

### Basic Hot Zone

```tsx
import { Timeline, useHotZones } from 'react-simile-timeline';

function App() {
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

  return (
    <Timeline
      data={events}
      bands={[
        {
          width: '100%',
          intervalUnit: 'MONTH',
          intervalPixels: 100,
          hotZones: hotZones.zones,
        },
      ]}
      height={500}
    />
  );
}
```

### Dynamic Hot Zones

```tsx
import { Timeline, useHotZones } from 'react-simile-timeline';

function App() {
  const hotZones = useHotZones({
    initialZones: [],
  });

  const addFocusZone = (start, end) => {
    hotZones.addZone({
      start,
      end,
      magnify: 5,
      unit: 'DAY',
    });
  };

  return (
    <>
      <button onClick={() => addFocusZone('2020-06-01', '2020-06-30')}>
        Focus on June 2020
      </button>

      <Timeline
        data={events}
        bands={[
          {
            width: '100%',
            intervalUnit: 'MONTH',
            intervalPixels: 100,
            hotZones: hotZones.zones,
          },
        ]}
        height={500}
        onEventSelect={(event) => {
          // Auto-create hot zone around selected event
          const start = new Date(event.start);
          const end = new Date(start);
          end.setMonth(start.getMonth() + 1);

          addFocusZone(start.toISOString(), end.toISOString());
        }}
      />
    </>
  );
}
```

---

## Performance Optimization

### Large Dataset (10,000+ Events)

```tsx
import {
  Timeline,
  useAutoVirtualization,
  useAdaptiveRenderer,
} from 'react-simile-timeline';

function App() {
  const { visibleEvents, stats } = useAutoVirtualization({
    events: largeEventDataset,
    viewportStart,
    viewportEnd,
    getEventStart: (e) => dateToPixel(e.start),
    getEventEnd: (e) => dateToPixel(e.end || e.start),
    threshold: 100, // Enable at 100+ events
  });

  const { method } = useAdaptiveRenderer({
    eventCount: largeEventDataset.length,
    canvasThreshold: 1000,
  });

  return (
    <>
      <div>
        Rendering {stats.renderPercentage}% ({stats.visibleCount} of{' '}
        {stats.totalCount}) using {method}
      </div>

      <Timeline
        data={{ events: visibleEvents }}
        bands={[...]}
        height={500}
        renderMethod={method}
      />
    </>
  );
}
```

---

## Accessibility

### Full Accessibility Support

```tsx
import { Timeline, useAccessibility } from 'react-simile-timeline';

function App() {
  const containerRef = useRef(null);

  const a11y = useAccessibility({
    theme,
    containerRef,
    eventCount: events.length,
  });

  return (
    <div ref={containerRef}>
      <Timeline
        data={events}
        bands={[...]}
        height={500}
        ariaLabel="Historical events timeline from 2020 to 2023"
        onEventSelect={(event) => {
          a11y.announceEventSelection(event);
        }}
        onDateChange={(date) => {
          a11y.announce(`Viewing events from ${date.toLocaleDateString()}`);
        }}
      />

      {/* Accessibility audit */}
      <button
        onClick={() => {
          const audit = a11y.runAudit();
          console.log('Accessibility:', audit);
          console.log('Compliance Level:', audit.complianceLevel);
        }}
      >
        Run A11y Audit
      </button>
    </div>
  );
}
```

---

## Responsive Design

### Fully Responsive Timeline

```tsx
import { Timeline, useResponsive } from 'react-simile-timeline';

function App() {
  const responsive = useResponsive();

  return (
    <Timeline
      data={events}
      bands={[
        {
          width: '100%',
          intervalUnit: responsive.isMobile ? 'MONTH' : 'DAY',
          intervalPixels: responsive.recommendations.intervalPixels,
          trackHeight: responsive.recommendations.trackHeight,
        },
      ]}
      height={responsive.recommendations.bandHeight}
      bubbleWidth={responsive.recommendations.bubbleWidth}
      enableTouch={responsive.isTouch}
      quality={responsive.isMobile ? 'medium' : 'high'}
    />
  );
}
```

---

## Advanced Patterns

### Complete Feature Integration

```tsx
import {
  Timeline,
  ThemeProvider,
  useKeyboardNav,
  useEventFilter,
  useResponsive,
  useAccessibility,
  useHotZones,
} from 'react-simile-timeline';

function AdvancedTimeline({ events }) {
  const responsive = useResponsive();
  const filter = useEventFilter({ events });
  const hotZones = useHotZones({ initialZones: [] });

  const keyboard = useKeyboardNav({
    onNavigate: (dir) => scroll(dir),
    onZoom: (dir) => zoom(dir),
  });

  const a11y = useAccessibility({
    theme,
    containerRef,
    eventCount: events.length,
  });

  return (
    <ThemeProvider defaultMode={responsive.isMobile ? 'light' : 'auto'}>
      <div>
        {/* Search */}
        <input
          type="search"
          placeholder="Search events..."
          onChange={(e) => filter.setSearchQuery(e.target.value)}
        />

        {/* Timeline */}
        <Timeline
          data={{ events: filter.filteredEvents }}
          bands={[
            {
              width: '70%',
              intervalUnit: 'MONTH',
              intervalPixels: 100,
              hotZones: hotZones.zones,
            },
            {
              width: '30%',
              intervalUnit: 'YEAR',
              intervalPixels: 200,
              syncWith: 0,
              highlight: true,
            },
          ]}
          height={responsive.recommendations.bandHeight}
          enableTouch={responsive.isTouch}
          enableKeyboard={true}
          onEventSelect={(event) => {
            a11y.announceEventSelection(event);
            // Add hot zone around selected event
            hotZones.addZone({
              start: event.start,
              end: event.end || event.start,
              magnify: 3,
            });
          }}
        />

        {/* Stats */}
        <div>
          Showing {filter.filteredEvents.length} of {events.length} events
        </div>
      </div>
    </ThemeProvider>
  );
}
```

### Server-Side Rendering (SSR)

```tsx
// app/timeline/page.tsx (Next.js App Router)
import { Timeline, ThemeProvider } from 'react-simile-timeline';

export default async function TimelinePage() {
  // Fetch data on server
  const events = await fetch('https://api.example.com/events').then((r) =>
    r.json()
  );

  return (
    <ThemeProvider defaultMode="auto">
      <Timeline
        data={events}
        bands={[
          {
            width: '100%',
            intervalUnit: 'MONTH',
            intervalPixels: 100,
          },
        ]}
        height={600}
      />
    </ThemeProvider>
  );
}
```

### Custom Event Painter

```tsx
import { Band, OriginalPainter, CompactPainter } from 'react-simile-timeline';

function CustomBand({ events, config }) {
  // Use different painters based on zoom level
  const painter = zoom > 0.5 ? new OriginalPainter(theme) : new CompactPainter(theme);

  return (
    <Band
      {...config}
      events={events}
      painter={painter}
    />
  );
}
```

---

## More Examples

For more examples, see:
- [Demo Applications](../examples/)
- [Sprint Demos](../src/components/) - Sprint3Demo, Sprint4Demo, Sprint5Demo
- [API Documentation](./API.md)
- [Migration Guide](./MIGRATION.md)
- [Performance Guide](./PERFORMANCE.md)

## Development Status

This project is under active development. See [../../docs/SPRINT_PLAN.md](../../docs/SPRINT_PLAN.md) for current sprint status.

**Note**: Some features demonstrated in examples are in progress (Sprint 7):
- Theme system integration
- Virtualization for large datasets
- Hot zones navigation UI
- Canvas rendering fallback
