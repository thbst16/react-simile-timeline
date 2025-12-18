import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { BandConfig } from '../types';
import { useTimelineContext } from './TimelineProvider';
import { usePan } from '../hooks/usePan';
import { TIME_UNITS, type TimeUnit, getVisibleRange } from '../utils/dateUtils';
import { TimeScale } from './TimeScale';
import { EventTrack } from './EventTrack';
import { OverviewMarkers } from './OverviewMarkers';

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
  const { state, actions, events } = useTimelineContext();

  // Calculate this band's pixels per ms (may differ from primary)
  const bandPixelsPerMs = useMemo(() => calculatePixelsPerMs(config), [config]);

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

  // Update viewport width on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      if (isPrimary) {
        actions.setViewportWidth(container.clientWidth);
      }
    };

    // Initial measurement
    updateWidth();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [isPrimary, actions]);

  // Parse height from config
  const height = config.height || (config.overview ? '30%' : '70%');

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
    >
      {/* Event layer - pointer-events:none allows drag on band, events re-enable on markers */}
      <div
        className="timeline-band__events"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 32, // Leave space for time scale + padding
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
            trackHeight={config.trackHeight || 24}
            trackGap={config.trackGap || 4}
            showLabels={config.showEventLabels !== false}
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
