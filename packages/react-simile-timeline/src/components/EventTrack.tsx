import { useMemo } from 'react';
import type { TimelineEvent } from '../types';
import { calculateLayoutPrepared, getTrackCount, prepareEvents } from '../utils/layoutEngine';
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
  /** Maximum number of tracks (0 = unlimited) */
  maxTracks?: number;
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
  maxTracks = 0,
}: EventTrackProps) {
  // Parse and sort events once per data change, not per frame. Pan and zoom
  // change the viewport props below but not this, so dates are parsed once
  // rather than on every layout pass (#36).
  const prepared = useMemo(() => prepareEvents(events), [events]);

  // Calculate layout for all visible events from the pre-parsed set.
  const layoutEvents = useMemo(
    () => calculateLayoutPrepared(
      prepared,
      visibleRange,
      pixelsPerMs,
      centerDate,
      viewportWidth,
      showLabels,
      maxTracks
    ),
    [prepared, visibleRange, pixelsPerMs, centerDate, viewportWidth, showLabels, maxTracks]
  );

  // Calculate total height needed
  const trackCount = useMemo(() => getTrackCount(layoutEvents), [layoutEvents]);
  const totalHeight = trackCount * (trackHeight + trackGap);

  return (
    <div
      className="timeline-event-track"
      // Name the collection of event markers so a screen reader announces the
      // grouping (and, via the live count, how many are in view) before the
      // reader steps through the individual event buttons.
      role="group"
      aria-label={`Timeline events, ${layoutEvents.length} in view`}
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
            isDuration={layoutEvent.isDuration}
            durationWidth={layoutEvent.durationWidth}
            isSticky={layoutEvent.isSticky}
            stickyX={layoutEvent.stickyX}
          />
        );
      })}
    </div>
  );
}
