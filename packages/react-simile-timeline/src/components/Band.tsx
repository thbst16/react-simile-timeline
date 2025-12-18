import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import type { BandConfig } from '../types';
import { useTimelineContext } from './TimelineProvider';
import { usePan } from '../hooks/usePan';
import { TIME_UNITS, type TimeUnit, getVisibleRange } from '../utils/dateUtils';
import { TimeScale } from './TimeScale';
import { EventTrack } from './EventTrack';
import { OverviewMarkers } from './OverviewMarkers';
import { HotZones } from './HotZones';

/** Height reserved for time scale at bottom of band (24px scale + 16px padding) */
const TIME_SCALE_RESERVED_HEIGHT = 40;

export interface BandProps {
  /** Band configuration */
  config: BandConfig;
  /** Whether this is the primary (controlling) band */
  isPrimary?: boolean;
}

/**
 * Calculate pixels per millisecond from band config
 */
function calculatePixelsPerMs(config: BandConfig): number {
  const timeUnit = config.timeUnit || 'day';
  const intervalPixels = config.intervalPixels || 100;
  const unitMs = TIME_UNITS[timeUnit as TimeUnit] || TIME_UNITS.day;
  return intervalPixels / unitMs;
}

/**
 * Single timeline band component
 * Handles pan interaction and renders time scale + events
 */
export function Band({ config, isPrimary = false }: BandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const { state, actions, events, hotZones } = useTimelineContext();
  const [eventsAreaHeight, setEventsAreaHeight] = useState(0);

  // Calculate this band's pixels per ms (may differ from primary), adjusted by zoom level
  const bandPixelsPerMs = useMemo(
    () => calculatePixelsPerMs(config) * state.zoomLevel,
    [config, state.zoomLevel]
  );

  // Calculate visible range for this band
  const visibleRange = useMemo(
    () => getVisibleRange(state.centerDate, state.viewportWidth, bandPixelsPerMs),
    [state.centerDate, state.viewportWidth, bandPixelsPerMs]
  );

  // Handle pan
  const handlePan = useCallback((deltaMs: number) => {
    actions.pan(deltaMs);
  }, [actions]);

  // Calculate keyboard pan amount based on viewport - pan by ~10% of visible range
  const keyboardPanAmount = useMemo(() => {
    // Pan by 10% of the viewport width in time
    const viewportMs = state.viewportWidth / bandPixelsPerMs;
    return viewportMs * 0.1;
  }, [state.viewportWidth, bandPixelsPerMs]);

  // Pan hook
  const { panProps } = usePan({
    onPan: handlePan,
    pixelsPerMs: bandPixelsPerMs,
    onPanStart: () => actions.setIsPanning(true),
    onPanEnd: () => actions.setIsPanning(false),
    enableKeyboard: isPrimary, // Only primary band handles keyboard
    keyboardPanAmount,
  });

  // Update viewport width on resize and attach wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      if (isPrimary) {
        actions.setViewportWidth(container.clientWidth);
      }
    };

    // Handle mouse wheel zoom - must use native listener with { passive: false }
    // to allow preventDefault() to stop page scrolling while zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Scrolling up (negative deltaY) = zoom in, scrolling down = zoom out
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      actions.zoom(zoomFactor);
    };

    // Initial measurement
    updateWidth();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    // Attach wheel listener with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isPrimary, actions]);

  // Keyboard zoom controls (+ / - keys) - only on primary band
  useEffect(() => {
    if (!isPrimary) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focus is on an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '+':
        case '=':
          // Zoom in
          actions.zoom(1.15);
          e.preventDefault();
          break;
        case '-':
        case '_':
          // Zoom out
          actions.zoom(0.87);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrimary, actions]);

  // Measure events area height for maxTracks calculation
  useEffect(() => {
    const eventsContainer = eventsRef.current;
    if (!eventsContainer) return;

    const measureHeight = () => {
      setEventsAreaHeight(eventsContainer.clientHeight);
    };

    // Initial measurement
    measureHeight();

    // Observe resize
    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(eventsContainer);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate max tracks based on available height
  const trackHeight = config.trackHeight || 24;
  const trackGap = config.trackGap || 4;
  // Reserve extra space at bottom to ensure events don't crowd the time scale
  const BOTTOM_PADDING = 16;
  // Default max tracks when height hasn't been measured yet (prevents initial overflow)
  const DEFAULT_MAX_TRACKS = 6;
  const maxTracks = useMemo(() => {
    if (eventsAreaHeight <= 0) return DEFAULT_MAX_TRACKS;
    // Calculate how many tracks fit in the available space
    // Each track takes trackHeight + trackGap, plus padding at top and bottom
    const availableHeight = eventsAreaHeight - BOTTOM_PADDING - trackGap;
    const calculated = Math.max(1, Math.floor(availableHeight / (trackHeight + trackGap)));
    // Cap at a reasonable maximum to prevent overcrowding
    return Math.min(calculated, 10);
  }, [eventsAreaHeight, trackHeight, trackGap]);

  // Parse height from config
  const height = config.height || (config.overview ? '30%' : '70%');

  // Construct accessible label for band
  const bandLabel = config.overview
    ? `Overview band at ${config.timeUnit || 'year'} scale`
    : `Detail band at ${config.timeUnit || 'day'} scale`;

  return (
    <div
      ref={containerRef}
      className={`timeline-band ${config.overview ? 'timeline-band--overview' : 'timeline-band--detail'}`}
      style={{
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--band-bg, #ffffff)',
        borderBottom: '1px solid var(--band-border, #e0e0e0)',
        ...panProps.style,
      }}
      onPointerDown={panProps.onPointerDown}
      data-band-id={config.id}
      role="group"
      aria-label={bandLabel}
      aria-roledescription="timeline band"
      tabIndex={isPrimary ? 0 : -1}
    >
      {/* Hot zones layer - renders behind events */}
      {hotZones.length > 0 && (
        <HotZones
          hotZones={hotZones}
          visibleRange={visibleRange}
          pixelsPerMs={bandPixelsPerMs}
          viewportWidth={state.viewportWidth}
          centerDate={state.centerDate}
        />
      )}

      {/* Event layer - pointer-events:none allows drag on band, events re-enable on markers */}
      <div
        ref={eventsRef}
        className="timeline-band__events"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: TIME_SCALE_RESERVED_HEIGHT,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {config.overview ? (
          <OverviewMarkers
            events={events}
            visibleRange={visibleRange}
            pixelsPerMs={bandPixelsPerMs}
            viewportWidth={state.viewportWidth}
            centerDate={state.centerDate}
          />
        ) : (
          <EventTrack
            events={events}
            visibleRange={visibleRange}
            pixelsPerMs={bandPixelsPerMs}
            viewportWidth={state.viewportWidth}
            centerDate={state.centerDate}
            trackHeight={trackHeight}
            trackGap={trackGap}
            showLabels={config.showEventLabels !== false}
            maxTracks={maxTracks}
          />
        )}
      </div>

      {/* Time scale at bottom */}
      <div
        className="timeline-band__scale"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          borderTop: '1px solid var(--scale-line-color, #e0e0e0)',
          backgroundColor: 'var(--scale-bg, #fafafa)',
        }}
      >
        <TimeScale
          visibleRange={visibleRange}
          pixelsPerMs={bandPixelsPerMs}
          viewportWidth={state.viewportWidth}
          centerDate={state.centerDate}
          timeUnit={config.timeUnit}
        />
      </div>
    </div>
  );
}
