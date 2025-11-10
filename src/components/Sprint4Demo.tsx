/**
 * Sprint 4 Demo - Interactions
 *
 * Demonstrates:
 * - Keyboard navigation (arrows, +/-, ESC, Home, End)
 * - Mouse drag to pan
 * - Mouse wheel to zoom
 * - Touch support (swipe, pinch-to-zoom)
 * - Multi-band synchronization
 * - Visual feedback for interactions
 *
 * Sprint 4: Interactions
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BandV3 } from './BandV3';
import { EventBubble } from './EventBubble';
import { BoundaryIndicator } from './BoundaryIndicator';
import { LinearEther } from '../core/Ether';
import { EventSource } from '../core/EventSource';
import type { TimelineEvent } from '../types/events';
import type { Decorator } from '../types/decorators';
import { useTimelineStore } from '../store/timelineStore';
import { ThemeProvider, useTheme } from '../hooks/useTheme';

// Import our new interaction hooks
import {
  useKeyboardNav,
  useTimelineScroll,
  usePanZoom,
  useBandSync,
  useEventFilter,
  useAnimatedTransition,
  easings,
} from '../hooks';

/**
 * Sprint4Demo Inner Component (with theme access)
 */
function Sprint4DemoInner(): JSX.Element {
  // Access theme
  const { mode, setMode } = useTheme();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Interaction state for visual feedback
  const [panDelta, setPanDelta] = useState(0);
  const [activeInteraction, setActiveInteraction] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Import the timeline store to set bounds
  const { setDateBounds } = useTimelineStore();

  // Load JFK assassination timeline data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const eventSource = new EventSource();
        await eventSource.loadFromUrl('/data/jfk-timeline.json');
        const loadedEvents = eventSource.getEvents();
        setEvents(loadedEvents);

        // Calculate and set date bounds to prevent scrolling into void
        // Import is added at the top of the file
        const { calculateBoundsWithViewportPadding } = await import('../utils/dateBounds');
        const bounds = calculateBoundsWithViewportPadding(loadedEvents, 30 * 24 * 60 * 60 * 1000);
        setDateBounds(bounds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [setDateBounds]);

  // Event filtering and search
  const eventFilter = useEventFilter({
    events,
    sortByRelevance: true,
  });

  // Use filtered events for display
  const displayEvents = eventFilter.filteredEvents;

  // Animated transition for smooth panning
  const panAnimation = useAnimatedTransition({
    duration: 400,
    easing: easings.easeOutCubic,
    onUpdate: () => {
      // Could use this for custom animations
    },
  });

  // Create ethers for different bands (using refs to allow zoom updates)
  const overviewEtherRef = useRef(new LinearEther('YEAR', 200));
  const detailEtherRef = useRef(new LinearEther('MONTH', 150));
  const contextEtherRef = useRef(new LinearEther('DECADE', 100));

  // Band synchronization
  const bandSync = useBandSync({
    bands: [
      { bandId: 'overview', syncRatio: 0.1 },
      { bandId: 'detail', syncRatio: 1.0, isMaster: true },
      { bandId: 'context', syncRatio: 0.05 },
    ],
    onBandScroll: () => {
      // Bands scroll in sync automatically
    },
  });

  // Pan & Zoom hook
  const panZoom = usePanZoom({
    initialZoom: 1,
    minZoom: 0.5,
    maxZoom: 5,
    zoomStep: 0.1,
    enableWheelZoom: true,
    enablePinchZoom: true,
    onZoomChange: (newZoom) => {
      setActiveInteraction(`Zoom: ${newZoom.toFixed(2)}x`);
      // Update ether pixel ratios based on zoom
      overviewEtherRef.current = new LinearEther('YEAR', 200 * newZoom);
      detailEtherRef.current = new LinearEther('MONTH', 150 * newZoom);
      contextEtherRef.current = new LinearEther('DECADE', 100 * newZoom);
    },
    onPan: (deltaX) => {
      setActiveInteraction(`Panning: ${Math.round(deltaX)}px`);
      setPanDelta((prev) => prev + deltaX);
    },
  });

  // Timeline scroll hook
  const timelineScroll = useTimelineScroll({
    enableMouseDrag: true,
    enableTouch: true,
    onScroll: (delta) => {
      setActiveInteraction(`Scrolling: ${Math.round(delta)}px`);
      setPanDelta((prev) => prev + delta);
      // Notify band sync of scroll
      bandSync.notifyScroll('detail', delta);
    },
  });

  // Keyboard navigation hook
  const keyboardNav = useKeyboardNav({
    enabled: true,
    panStep: 50,
    onPan: (direction, amount) => {
      let delta = 0;
      if (direction === 'left') delta = -amount;
      else if (direction === 'right') delta = amount;

      if (delta !== 0) {
        setActiveInteraction(`Keyboard Pan: ${direction}`);
        setPanDelta((prev) => prev + delta);
        bandSync.notifyScroll('detail', delta);
      }
    },
    onZoom: (direction) => {
      setActiveInteraction(`Keyboard Zoom: ${direction}`);
      if (direction === 'in') {
        panZoom.zoomIn();
      } else {
        panZoom.zoomOut();
      }
    },
    onEscape: () => {
      setSelectedEvent(null);
      setActiveInteraction('ESC pressed');
    },
    onNavigate: (position) => {
      setActiveInteraction(`Navigate to ${position}`);
      // Reset to start/end of timeline
      if (position === 'start') {
        setPanDelta(0);
      } else {
        setPanDelta(-10000); // Move far right
      }
    },
  });

  // Create example decorators
  const decorators = useMemo((): Decorator[] => {
    return [
      {
        type: 'span',
        startDate: '1963-11-22T00:00:00',
        endDate: '1963-11-23T00:00:00',
        label: 'Assassination Day',
        color: '#ef4444',
        opacity: 0.2,
      },
      {
        type: 'point',
        date: '1963-11-22T12:30:00',
        label: '12:30 PM',
        color: '#dc2626',
        opacity: 0.8,
        width: 3,
      },
      {
        type: 'span',
        startDate: '1963-11-22T00:00:00',
        endDate: '1964-09-27T00:00:00',
        label: 'Warren Commission Investigation',
        color: '#3b82f6',
        opacity: 0.1,
      },
    ];
  }, []);

  // Handle event click
  const handleEventClick = useCallback((event: TimelineEvent): void => {
    setSelectedEvent(event);
    setActiveInteraction('Event clicked');
  }, []);

  // Clear interaction message after delay
  useEffect(() => {
    if (activeInteraction) {
      const timer = window.setTimeout(() => setActiveInteraction(''), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeInteraction]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Sprint 4 Demo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sprint 4 Demo - Interactions</h1>
            <p className="text-sm text-gray-600 mt-1">
              Try keyboard, mouse, and touch interactions!
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('light')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'light'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Light mode"
              >
                ☀️
              </button>
              <button
                onClick={() => setMode('dark')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'dark'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Dark mode"
              >
                🌙
              </button>
              <button
                onClick={() => setMode('auto')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === 'auto'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Auto (system preference)"
              >
                💻
              </button>
            </div>

            {/* Active Interaction Indicator */}
            {activeInteraction && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium animate-pulse">
                {activeInteraction}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search events... (try 'Kennedy', 'Dallas', etc.)"
              value={eventFilter.searchQuery}
              onChange={(e) => {
                eventFilter.setSearchQuery(e.target.value);
                setActiveInteraction(`Searching: ${e.target.value}`);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {eventFilter.searchQuery && (
              <button
                onClick={() => eventFilter.setSearchQuery('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              eventFilter.hasActiveFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {eventFilter.hasActiveFilters ? `Filters (${eventFilter.count})` : 'Filters'}
          </button>

          {/* Clear Filters */}
          {eventFilter.hasActiveFilters && (
            <button
              onClick={() => {
                eventFilter.clearFilters();
                setActiveInteraction('Filters cleared');
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
            >
              Clear All
            </button>
          )}

          {/* Event Count */}
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {eventFilter.count} / {eventFilter.total} events
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={eventFilter.filters.attributes?.isDuration ?? false}
                  onChange={(e) => {
                    const newAttrs = { ...eventFilter.filters.attributes };
                    if (e.target.checked) {
                      newAttrs.isDuration = true;
                    } else {
                      delete newAttrs.isDuration;
                    }
                    eventFilter.setFilters({
                      ...eventFilter.filters,
                      attributes: newAttrs,
                    });
                  }}
                  className="rounded"
                />
                <span>Duration Events Only</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={eventFilter.filters.attributes?.hasImage ?? false}
                  onChange={(e) => {
                    const newAttrs = { ...eventFilter.filters.attributes };
                    if (e.target.checked) {
                      newAttrs.hasImage = true;
                    } else {
                      delete newAttrs.hasImage;
                    }
                    eventFilter.setFilters({
                      ...eventFilter.filters,
                      attributes: newAttrs,
                    });
                  }}
                  className="rounded"
                />
                <span>Has Image</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={eventFilter.filters.attributes?.hasLink ?? false}
                  onChange={(e) => {
                    const newAttrs = { ...eventFilter.filters.attributes };
                    if (e.target.checked) {
                      newAttrs.hasLink = true;
                    } else {
                      delete newAttrs.hasLink;
                    }
                    eventFilter.setFilters({
                      ...eventFilter.filters,
                      attributes: newAttrs,
                    });
                  }}
                  className="rounded"
                />
                <span>Has Link</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Interaction Help Panel */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-semibold text-blue-900 block mb-1">🖱️ Mouse:</span>
            <span className="text-blue-700">Drag to pan • Wheel to zoom</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900 block mb-1">⌨️ Keyboard:</span>
            <span className="text-blue-700">← → Pan • +/- Zoom • ESC Close</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900 block mb-1">👆 Touch:</span>
            <span className="text-blue-700">Swipe to pan • Pinch to zoom</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900 block mb-1">📊 State:</span>
            <span className="text-blue-700">
              Zoom: {panZoom.zoom.toFixed(2)}x • Pan: {Math.round(panDelta)}px
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={timelineScroll.scrollRef}
        className="flex-1 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing relative"
      >
        {/* Boundary Indicators */}
        <BoundaryIndicator position="left" height={600} />
        <BoundaryIndicator position="right" height={600} />

        {/* Overview Band */}
        <div className="border-b border-gray-300 relative">
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
          {timelineScroll.isScrolling && (
            <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              Scrolling...
            </div>
          )}
        </div>

        {/* Detail Band (Master) */}
        <div className="border-b border-gray-300 relative">
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
          {panZoom.isZooming && (
            <div className="absolute top-2 right-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
              Zooming: {panZoom.zoom.toFixed(2)}x
            </div>
          )}
        </div>

        {/* Context Band */}
        <div className="border-b border-gray-300 relative">
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
          {keyboardNav.isActive && (
            <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              Keyboard Active
            </div>
          )}
        </div>
      </div>

      {/* Event Bubble Modal */}
      {selectedEvent && (
        <EventBubble event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* Stats Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-6 py-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <div>
            Showing: {eventFilter.count} / {eventFilter.total} events
            {eventFilter.hasActiveFilters && <span className="text-blue-600 ml-2">(Filtered)</span>}
            {eventFilter.highlightedEvents.length > 0 && (
              <span className="text-green-600 ml-2">
                | {eventFilter.highlightedEvents.length} matches
              </span>
            )}
          </div>
          <div>
            Hooks: useKeyboardNav ✓ | useTimelineScroll ✓ | usePanZoom ✓ | useBandSync ✓ |
            useEventFilter ✓ | useAnimatedTransition ✓
          </div>
          <div>
            Zoom: {panZoom.zoom.toFixed(2)}x | Pan: {Math.round(panDelta)}px | Animation:{' '}
            {panAnimation.isAnimating ? '⚡' : '💤'}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sprint4Demo Wrapper with ThemeProvider
 */
export function Sprint4Demo(): JSX.Element {
  return (
    <ThemeProvider defaultMode="light">
      <Sprint4DemoInner />
    </ThemeProvider>
  );
}
