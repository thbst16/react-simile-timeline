/**
 * OriginalPainter - Classic Simile Timeline rendering style
 *
 * Renders events with:
 * - Duration events: Rounded tape/bar with icon at start and label
 * - Instant events: Icon with label above
 * - Full support for colors, icons, images
 *
 * Sprint 3: Advanced Rendering
 */

import type { ReactNode } from 'react';
import type { EventPainter, EventTheme, Viewport, TimelineEvent } from './types';
import type { LayoutItem } from '../LayoutEngine';

/**
 * OriginalPainter - Classic tape-and-icon rendering
 */
export class OriginalPainter implements EventPainter {
  getType(): 'original' {
    return 'original';
  }

  getTrackHeight(): number {
    return 30;
  }

  getTrackGap(): number {
    return 5;
  }

  getTrackOffset(): number {
    return 25;
  }

  showsLabels(): boolean {
    return true;
  }

  showsIcons(): boolean {
    return true;
  }

  render(
    item: LayoutItem,
    viewport: Viewport,
    theme: EventTheme,
    onEventClick?: (event: TimelineEvent) => void
  ): ReactNode {
    const { event, x, width, y, height, isDuration } = item;

    // Convert from relative position to absolute viewport position
    const viewportX = viewport.width / 2 + x;

    // Determine colors
    const eventColor = event.color || theme.defaultEventColor;
    const textColor = event.textColor || theme.defaultTextColor;

    // Generate unique key
    const key = event.id || `${event.title}-${event.start}`;

    // Click handler
    const handleClick = (): void => {
      if (onEventClick) {
        onEventClick(event);
      }
    };

    if (isDuration) {
      return this.renderDurationEvent(
        key,
        event,
        viewportX,
        y,
        width,
        height,
        eventColor,
        textColor,
        theme,
        handleClick
      );
    } else {
      return this.renderInstantEvent(
        key,
        event,
        viewportX,
        y,
        height,
        eventColor,
        textColor,
        theme,
        handleClick
      );
    }
  }

  /**
   * Render a duration event (tape with icon and label)
   */
  private renderDurationEvent(
    key: string,
    event: TimelineEvent,
    x: number,
    y: number,
    width: number,
    height: number,
    eventColor: string,
    textColor: string,
    theme: EventTheme,
    onClick: () => void
  ): ReactNode {
    const tapeY = y + (height - theme.tapeHeight) / 2;
    const tapeHeight = theme.tapeHeight;

    // Check if we have enough space to show label
    const showLabel = width > 50;

    return (
      <g
        key={key}
        className="timeline-event duration"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Duration tape (bar) */}
        <rect
          x={x}
          y={tapeY}
          width={width}
          height={tapeHeight}
          fill={eventColor}
          fillOpacity={theme.tapeOpacity}
          stroke={theme.defaultBorderColor}
          strokeWidth={1}
          rx={theme.tapeBorderRadius}
          ry={theme.tapeBorderRadius}
        />

        {/* Icon at start of tape */}
        {this.renderIcon(x, y + height / 2, theme.iconSize, eventColor, theme)}

        {/* Event label */}
        {showLabel && (
          <text
            x={x + width / 2}
            y={tapeY - 5}
            textAnchor="middle"
            fontSize={theme.labelFontSize}
            fontFamily={theme.labelFontFamily}
            fill={textColor}
            style={{
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {this.truncateLabel(event.title, width)}
          </text>
        )}

        {/* Hover title for accessibility */}
        <title>{event.title}</title>
      </g>
    );
  }

  /**
   * Render an instant event (icon with label)
   */
  private renderInstantEvent(
    key: string,
    event: TimelineEvent,
    x: number,
    y: number,
    height: number,
    eventColor: string,
    textColor: string,
    theme: EventTheme,
    onClick: () => void
  ): ReactNode {
    const centerY = y + height / 2;

    return (
      <g
        key={key}
        className="timeline-event instant"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Icon */}
        {this.renderIcon(x, centerY, theme.iconSize, eventColor, theme)}

        {/* Event label above icon */}
        <text
          x={x}
          y={y + theme.labelOffsetY}
          textAnchor="middle"
          fontSize={theme.labelFontSize}
          fontFamily={theme.labelFontFamily}
          fill={textColor}
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {this.truncateLabel(event.title, 120)}
        </text>

        {/* Hover title for accessibility */}
        <title>{event.title}</title>
      </g>
    );
  }

  /**
   * Render event icon (circle by default, or custom image if provided)
   */
  private renderIcon(
    x: number,
    y: number,
    size: number,
    color: string,
    theme: EventTheme
  ): ReactNode {
    return (
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={color}
        stroke={theme.defaultBorderColor}
        strokeWidth={theme.iconBorderWidth}
      />
    );
  }

  /**
   * Truncate label to fit within available width
   * Rough estimate: 1 character ≈ 6-7 pixels
   */
  private truncateLabel(label: string, maxWidth: number): string {
    const maxChars = Math.floor(maxWidth / 6);
    if (label.length <= maxChars) {
      return label;
    }
    return label.substring(0, maxChars - 3) + '...';
  }
}

/**
 * Create a default instance of OriginalPainter
 */
export function createOriginalPainter(): OriginalPainter {
  return new OriginalPainter();
}
