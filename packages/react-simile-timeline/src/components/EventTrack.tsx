import { useMemo } from 'react';
import type { TimelineEvent } from '../types';
import { calculateLayout, getTrackCount } from '../utils/layoutEngine';
import { EventMarker } from './EventMarker';

export interface EventTrackProps {
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
  /** Height per track in pixels */
  trackHeight?: number;
  /** Gap between tracks in pixels */
  trackGap?: number;
  /** Whether to show event labels */
  showLabels?: boolean;
}

/**
 * Event track component that positions events using the layout engine
 */
export function EventTrack({
  events,
  visibleRange,
  pixelsPerMs,
  viewportWidth,
  centerDate,
  trackHeight = 24,
  trackGap = 4,
  showLabels = true,
}: EventTrackProps) {
  // Calculate layout for all visible events
  const layoutEvents = useMemo(
    () => calculateLayout(
      events,
      visibleRange,
      pixelsPerMs,
      centerDate,
      viewportWidth,
      showLabels
    ),
    [events, visibleRange, pixelsPerMs, centerDate, viewportWidth, showLabels]
  );

  // Calculate total height needed
  const trackCount = useMemo(() => getTrackCount(layoutEvents), [layoutEvents]);
  const totalHeight = trackCount * (trackHeight + trackGap);

  return (
    <div
      className="timeline-event-track"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: totalHeight,
      }}
    >
      {layoutEvents.map((layoutEvent, index) => {
        // Calculate y position based on track
        const y = layoutEvent.track * (trackHeight + trackGap) + trackGap;

        return (
          <EventMarker
            key={`${layoutEvent.event.title}-${layoutEvent.event.start}-${index}`}
            event={layoutEvent.event}
            x={layoutEvent.x}
            y={y}
            showLabel={showLabels}
          />
        );
      })}
    </div>
  );
}
