/**
 * CompactPainter - Dense vertical layout
 *
 * Optimized for displaying many events in limited vertical space:
 * - Smaller track height (15px)
 * - No icons, just colored bars
 * - Labels shown only on hover
 * - Suitable for 50+ events
 *
 * Sprint 3: Advanced Rendering
 */

import type { ReactNode } from 'react';
import type { EventPainter, EventTheme, Viewport, TimelineEvent } from './types';
import type { LayoutItem } from '../LayoutEngine';

/**
 * CompactPainter - Dense layout for many events
 */
export class CompactPainter implements EventPainter {
  getType(): 'compact' {
    return 'compact';
  }

  getTrackHeight(): number {
    return 15; // Smaller than original
  }

  getTrackGap(): number {
    return 2; // Minimal gap
  }

  getTrackOffset(): number {
    return 35;
  }

  showsLabels(): boolean {
    return false; // Labels only on hover
  }

  showsIcons(): boolean {
    return false; // No icons
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

    // Compact height for bars
    const barHeight = 10;
    const barY = y + (this.getTrackHeight() - barHeight) / 2;

    if (isDuration) {
      return (
        <g
          key={key}
          className="timeline-event compact duration"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Duration bar - no rounded corners for compact look */}
          <rect
            x={viewportX}
            y={barY}
            width={width}
            height={barHeight}
            fill={eventColor}
            fillOpacity={0.85}
            stroke="none"
          />

          {/* Hover title */}
          <title>{event.title}</title>
        </g>
      );
    } else {
      // Instant event - small vertical line
      return (
        <g
          key={key}
          className="timeline-event compact instant"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Vertical marker line */}
          <line
            x1={viewportX}
            y1={y}
            x2={viewportX}
            y2={y + this.getTrackHeight()}
            stroke={eventColor}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Hover title */}
          <title>{event.title}</title>
        </g>
      );
    }
  }
}

/**
 * Create a default instance of CompactPainter
 */
export function createCompactPainter(): CompactPainter {
  return new CompactPainter();
}
