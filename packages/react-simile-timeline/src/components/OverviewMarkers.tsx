import { useMemo } from 'react';
import type { TimelineEvent } from '../types';
import { parseDate, dateToPixel } from '../utils/dateUtils';
import { filterVisibleEvents } from '../utils/layoutEngine';

export interface OverviewMarkersProps {
  /** All timeline events */
  events: TimelineEvent[];
  /** Visible date range */
  visibleRange: { start: Date; end: Date };
  /** Pixels per millisecond */
  pixelsPerMs: number;
  /** Viewport width in pixels */
  viewportWidth: number;
  /** Center date of the viewport */
  centerDate: Date;
}

/** Default marker color */
const DEFAULT_COLOR = '#666';

/**
 * Overview band markers - simplified tick marks for events
 */
export function OverviewMarkers({
  events,
  visibleRange,
  pixelsPerMs,
  viewportWidth,
  centerDate,
}: OverviewMarkersProps) {
  // Calculate marker positions
  const markers = useMemo(() => {
    // Calculate viewport left edge in time
    const viewportLeftMs = centerDate.getTime() - (viewportWidth / 2) / pixelsPerMs;
    const viewportLeftDate = new Date(viewportLeftMs);

    // Filter to visible events with larger buffer for overview
    const bufferMs = 7 * 24 * 60 * 60 * 1000; // 1 week buffer
    const visibleEvents = filterVisibleEvents(events, visibleRange, bufferMs);

    return visibleEvents.map(event => {
      const eventDate = parseDate(event.start);
      const x = dateToPixel(eventDate, viewportLeftDate, pixelsPerMs);
      return {
        event,
        x,
        color: event.color || DEFAULT_COLOR,
      };
    });
  }, [events, visibleRange, pixelsPerMs, viewportWidth, centerDate]);

  return (
    <div
      className="timeline-overview-markers"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: 4,
      }}
    >
      {markers.map((marker, index) => (
        <div
          key={`${marker.event.title}-${marker.event.start}-${index}`}
          className="timeline-overview-marker"
          style={{
            position: 'absolute',
            left: marker.x,
            bottom: 4,
            width: 2,
            height: 'var(--overview-marker-height, 12px)',
            backgroundColor: marker.color,
            transform: 'translateX(-50%)',
          }}
          title={marker.event.title}
        />
      ))}
    </div>
  );
}
