/**
 * OverviewPainter - Simplified rendering for overview bands
 *
 * Minimalist style for showing many events at high level:
 * - Very small height (8px)
 * - No labels at all
 * - No icons
 * - Simple colored rectangles only
 * - Suitable for 100+ events
 *
 * Sprint 3: Advanced Rendering
 */

import type { ReactNode } from 'react';
import type { EventPainter, EventTheme, Viewport, TimelineEvent } from './types';
import type { LayoutItem } from '../LayoutEngine';

/**
 * OverviewPainter - Minimal layout for overview bands
 */
export class OverviewPainter implements EventPainter {
  getType(): 'overview' {
    return 'overview';
  }

  getTrackHeight(): number {
    return 8; // Very small
  }

  getTrackGap(): number {
    return 1; // Minimal gap
  }

  getTrackOffset(): number {
    return 20; // Smaller offset
  }

  showsLabels(): boolean {
    return false;
  }

  showsIcons(): boolean {
    return false;
  }

  render(
    item: LayoutItem,
    viewport: Viewport,
    theme: EventTheme,
    onEventClick?: (event: TimelineEvent) => void
  ): ReactNode {
    const { event, x, width, y, isDuration } = item;

    // Convert from relative position to absolute viewport position
    const viewportX = viewport.width / 2 + x;

    // Determine color
    const eventColor = event.color || theme.defaultEventColor;

    // Generate unique key
    const key = event.id || `${event.title}-${event.start}`;

    // Click handler
    const handleClick = (): void => {
      if (onEventClick) {
        onEventClick(event);
      }
    };

    const barHeight = 6;
    const barY = y + (this.getTrackHeight() - barHeight) / 2;

    if (isDuration) {
      return (
        <g
          key={key}
          className="timeline-event overview duration"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Simple rectangle */}
          <rect
            x={viewportX}
            y={barY}
            width={width}
            height={barHeight}
            fill={eventColor}
            fillOpacity={0.7}
            stroke="none"
          />

          {/* Hover title */}
          <title>{event.title}</title>
        </g>
      );
    } else {
      // Instant event - tiny vertical line
      return (
        <g
          key={key}
          className="timeline-event overview instant"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Thin vertical marker */}
          <line
            x1={viewportX}
            y1={barY}
            x2={viewportX}
            y2={barY + barHeight}
            stroke={eventColor}
            strokeWidth={2}
            strokeLinecap="butt"
          />

          {/* Hover title */}
          <title>{event.title}</title>
        </g>
      );
    }
  }
}

/**
 * Create a default instance of OverviewPainter
 */
export function createOverviewPainter(): OverviewPainter {
  return new OverviewPainter();
}
