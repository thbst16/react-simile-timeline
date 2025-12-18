import React, { useCallback } from 'react';
import type { TimelineEvent } from '../types';
import { useTimelineContext } from './TimelineProvider';

export interface EventMarkerProps {
  /** The event to render */
  event: TimelineEvent;
  /** X position in pixels */
  x: number;
  /** Y position in pixels (based on track) */
  y: number;
  /** Whether to show the label */
  showLabel?: boolean;
}

/** Default event color */
const DEFAULT_COLOR = '#4a90d9';

/**
 * Single point event marker (dot + optional label)
 */
export function EventMarker({
  event,
  x,
  y,
  showLabel = true,
}: EventMarkerProps) {
  const { state, actions } = useTimelineContext();

  const isSelected = state.selectedEvent === event;
  const isHovered = state.hoveredEvent === event;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Capture click position for popup positioning
    const clickPosition = { x: e.clientX, y: e.clientY };
    actions.setSelectedEvent(isSelected ? null : event, clickPosition);
  }, [actions, event, isSelected]);

  const handleMouseEnter = useCallback(() => {
    actions.setHoveredEvent(event);
  }, [actions, event]);

  const handleMouseLeave = useCallback(() => {
    actions.setHoveredEvent(null);
  }, [actions]);

  const color = event.color || DEFAULT_COLOR;
  const textColor = event.textColor || 'var(--event-text-color, #333)';

  return (
    <div
      className={`timeline-event ${isSelected ? 'timeline-event--selected' : ''} ${isHovered ? 'timeline-event--hovered' : ''} ${event.classname || ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: isSelected || isHovered ? 10 : 1,
        pointerEvents: 'auto', // Re-enable for event markers
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-event-id={event.title}
    >
      {/* Event dot */}
      <div
        className="timeline-event__dot"
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
          boxShadow: isSelected || isHovered
            ? `0 0 0 2px white, 0 0 0 4px ${color}`
            : 'none',
          transition: 'box-shadow 0.15s ease',
        }}
      />

      {/* Event label */}
      {showLabel && (
        <span
          className="timeline-event__label"
          style={{
            marginLeft: 6,
            fontSize: 'var(--event-font-size, 12px)',
            fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
            color: textColor,
            whiteSpace: 'nowrap',
            fontWeight: isSelected ? 600 : 400,
            textShadow: '0 0 2px white, 0 0 2px white',
          }}
        >
          {event.title}
        </span>
      )}
    </div>
  );
}
