/**
 * Sprint 5 Performance Demo
 *
 * Comprehensive demo showcasing all Sprint 5 performance features:
 * - Performance monitoring with FPS overlay
 * - Virtualization for large datasets (1000+ events)
 * - Adaptive rendering (Canvas fallback)
 * - Theme system (Light/Dark/Auto)
 * - Hot zones navigation
 * - Panning bounds
 * - Full accessibility
 *
 * Sprint 7: Complete Sprint 5 Features
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BandV3 } from './BandV3';
import { EventBubble } from './EventBubble';
import { BoundaryIndicator } from './BoundaryIndicator';
import { PerformanceOverlay } from './PerformanceOverlay';
import { HotZoneNavigator, HotZoneIndicator } from './HotZoneNavigator';
import { LinearEther } from '../core/Ether';
import { EventSource } from '../core/EventSource';
import type { TimelineEvent } from '../types/events';
import type { Decorator } from '../types/decorators';
import { useTimelineStore } from '../store/timelineStore';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { useHotZones } from '../hooks/useHotZones';
import {
  useKeyboardNav,
  useTimelineScroll,
  usePanZoom,
  useEventFilter,
} from '../hooks';

/**
 * Performance Demo Inner Component
 */
function Sprint5PerformanceDemoInner(): JSX.Element {
  const { mode, setMode } = useTheme();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // UI Controls
  const [showPerformance, setShowPerformance] = useState(true);
  const [showHotZones, setShowHotZones] = useState(false);
  const [performanceCompact] = useState(false);
  const [datasetSize, setDatasetSize] = useState<100 | 500 | 1000 | 2000>(1000);

  const { centerDate, setCenterDate, setDateBounds } = useTimelineStore();

  // Hot zones for JFK timeline
  const hotZones = useHotZones({
    initialZones: [
      {
        start: '1963-11-22T00:00:00',
        end: '1963-11-23T00:00:00',
        magnify: 3,
        unit: 'HOUR',
        label: 'Assassination Day',
      },
    ],
  });

  // Load data based on dataset size
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let loadedEvents: TimelineEvent[];

        if (datasetSize >= 500) {
          const { generateSimileJSON } = await import('../utils/generateLargeDataset');
          const jsonData = generateSimileJSON({ count: datasetSize });
          const eventSource = new EventSource();
          eventSource.loadData(jsonData);
          loadedEvents = eventSource.getEvents();
        } else {
          const eventSource = new EventSource();
          await eventSource.loadFromUrl('/data/jfk-timeline.json');
          loadedEvents = eventSource.getEvents();
        }

        setEvents(loadedEvents);

        const { calculateBoundsWithViewportPadding } = await import('../utils/dateBounds');
        const bounds = calculateBoundsWithViewportPadding(loadedEvents, 30 * 24 * 60 * 60 * 1000);
        setDateBounds(bounds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [datasetSize, setDateBounds]);

  const eventFilter = useEventFilter({ events, sortByRelevance: true });
  const displayEvents = eventFilter.filteredEvents;

  // Ethers
  const detailEtherRef = useRef(new LinearEther('WEEK', 150));
  const overviewEtherRef = useRef(new LinearEther('YEAR', 30));
  const contextEtherRef = useRef(new LinearEther('MONTH', 80));

  const timelineScroll = useTimelineScroll({ friction: 0.9 });
  usePanZoom({
    minZoom: 0.1,
    maxZoom: 10,
    zoomStep: 0.1,
    enablePinchZoom: true,
    onPan: (delta) => {
      const newDate = detailEtherRef.current.pixelToDate(-delta, centerDate);
      setCenterDate(newDate);
    },
  });

  useKeyboardNav({
    enabled: true,
    panStep: 100,
    onPan: (direction, amount) => {
      const delta = direction === 'left' ? -amount : amount;
      setCenterDate(detailEtherRef.current.pixelToDate(delta, centerDate));
    },
    onEscape: () => setSelectedEvent(null),
  });

  const decorators = useMemo((): Decorator[] => {
    if (datasetSize >= 500) return [];
    return [
      { type: 'point', date: '1963-11-22T12:30:00', label: '12:30 PM', color: '#dc2626', opacity: 0.8, width: 3 },
    ];
  }, [datasetSize]);

  const handleEventClick = useCallback((event: TimelineEvent) => setSelectedEvent(event), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Performance Demo...</p>
          <p className="text-sm text-gray-500 mt-2">Generating {datasetSize} events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sprint 5 Performance Demo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {displayEvents.length.toLocaleString()} events • Virtualization • Adaptive Rendering
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setMode('light')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'light'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Light mode"
            >
              ☀️
            </button>
            <button
              onClick={() => setMode('dark')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'dark'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Dark mode"
            >
              🌙
            </button>
            <button
              onClick={() => setMode('auto')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'auto'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Auto mode (system preference)"
            >
              💻
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Dataset Size */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dataset:</label>
            <select
              value={datasetSize}
              onChange={(e) => setDatasetSize(Number(e.target.value) as typeof datasetSize)}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            >
              <option value={100}>100 events</option>
              <option value={500}>500 events (Virtualized)</option>
              <option value={1000}>1000 events (Virtualized + Canvas)</option>
              <option value={2000}>2000 events (Stress Test)</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={eventFilter.filters.search || ''}
            onChange={(e) => eventFilter.setFilters({ ...eventFilter.filters, search: e.target.value })}
            className="flex-1 max-w-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />

          {/* Toggles */}
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              showPerformance ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
            }`}
          >
            📊 Metrics
          </button>

          {datasetSize < 500 && (
            <button
              onClick={() => setShowHotZones(!showHotZones)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                showHotZones ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'
              }`}
            >
              🔥 Hot Zones
            </button>
          )}

          <div className="ml-auto text-xs text-gray-600 dark:text-gray-400">
            {displayEvents.length >= 500 && <span className="text-green-600 font-semibold mr-2">✓ Virtualized</span>}
            {displayEvents.length >= 1000 && <span className="text-blue-600 font-semibold">✓ Canvas</span>}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineScroll.scrollRef} className="flex-1 flex flex-col overflow-hidden relative">
        <BoundaryIndicator position="left" height={600} />
        <BoundaryIndicator position="right" height={600} />

        <div className="border-b border-gray-300 dark:border-gray-600">
          <BandV3
            id="overview"
            height={80}
            ether={overviewEtherRef.current}
            events={displayEvents}
            decorators={decorators}
            painterType="overview"
            showTimescale={true}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="border-b border-gray-300 dark:border-gray-600">
          <BandV3
            id="detail"
            height={400}
            ether={detailEtherRef.current}
            events={displayEvents}
            decorators={decorators}
            painterType="original"
            showTimescale={true}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="border-b border-gray-300 dark:border-gray-600">
          <BandV3
            id="context"
            height={120}
            ether={contextEtherRef.current}
            events={displayEvents}
            decorators={decorators}
            painterType="compact"
            showTimescale={true}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {selectedEvent && <EventBubble event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {showPerformance && (
        <PerformanceOverlay
          visible={showPerformance}
          position="top-right"
          eventCount={displayEvents.length}
          isVirtualized={displayEvents.length >= 500}
          renderMethod={displayEvents.length >= 1000 ? 'canvas' : 'dom'}
          compact={performanceCompact}
          customMetrics={{
            'Total Events': events.length,
            'Filtered': displayEvents.length,
          }}
        />
      )}

      {showHotZones && datasetSize < 500 && (
        <>
          <HotZoneNavigator zones={hotZones.zones} position="edges" enableHover={true} visible={showHotZones} />
          <HotZoneIndicator activeZones={hotZones.activeZones} position="bottom-left" visible={showHotZones} />
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg text-xs pointer-events-none">
        ← → Pan • +/- Zoom • ESC Close • 📊 Performance • {datasetSize < 500 && '🔥 Hot Zones'}
      </div>
    </div>
  );
}

/**
 * Main Export with Theme Provider
 */
export function Sprint5PerformanceDemo(): JSX.Element {
  return (
    <ThemeProvider defaultMode="light">
      <Sprint5PerformanceDemoInner />
    </ThemeProvider>
  );
}
