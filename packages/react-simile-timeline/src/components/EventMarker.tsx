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
  /** Whether this is a duration event */
  isDuration?: boolean;
  /** Width of the duration tape in pixels */
  durationWidth?: number;
}

/** Default event color */
const DEFAULT_COLOR = '#4a90d9';

/** Default tape color */
const DEFAULT_TAPE_COLOR = '#6ba3d6';
/** Height of duration tape */
const TAPE_HEIGHT = 18;

/**
 * Event marker component - renders point events as dots and duration events as tapes
 */
export function EventMarker({
  event,
  x,
  y,
  showLabel = true,
  isDuration = false,
  durationWidth,
}: EventMarkerProps) {
  const { state, actions } = useTimelineContext();

  const isSelected = state.selectedEvent === event;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Capture click position for popup positioning
    const clickPosition = { x: e.clientX, y: e.clientY };
    actions.setSelectedEvent(isSelected ? null : event, clickPosition);
  }, [actions, event, isSelected]);

  const color = event.color || (isDuration ? DEFAULT_TAPE_COLOR : DEFAULT_COLOR);
  const textColor = event.textColor || 'var(--event-text-color, #333)';

  // Render duration event as a tape/bar
  if (isDuration && durationWidth) {
    return (
      <div
        className={`timeline-event timeline-event--duration ${isSelected ? 'timeline-event--selected' : ''} ${event.classname || ''}`}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: isSelected ? 10 : 1,
          pointerEvents: 'auto',
        }}
        onClick={handleClick}
        data-event-id={event.title}
      >
        {/* Duration tape */}
        <div
          className="timeline-event__tape"
          style={{
            width: durationWidth,
            height: TAPE_HEIGHT,
            backgroundColor: color,
            borderRadius: 3,
            flexShrink: 0,
            boxShadow: isSelected
              ? `0 0 0 2px white, 0 0 0 4px ${color}`
              : '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'box-shadow 0.15s ease',
            backgroundImage: event.tapeImage ? `url(${event.tapeImage})` : undefined,
            backgroundRepeat: event.tapeRepeat || 'repeat',
            opacity: isSelected ? 1 : 0.85,
          }}
        />

        {/* Duration event label */}
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

  // Render point event as a dot
  return (
    <div
      className={`timeline-event ${isSelected ? 'timeline-event--selected' : ''} ${event.classname || ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 1,
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
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
          boxShadow: isSelected
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
