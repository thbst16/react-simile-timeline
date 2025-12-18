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
  /** Whether the label should be sticky (event scrolled off-left) */
  isSticky?: boolean;
  /** X position for sticky label */
  stickyX?: number;
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
  isSticky = false,
  stickyX,
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

  // Construct accessible label
  const ariaLabel = event.description
    ? `${event.title}: ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}`
    : event.title;

  // Render duration event as a tape/bar
  if (isDuration && durationWidth) {
    // For sticky labels, calculate offset from parent's x position to achieve stickyX
    // Parent is at position x, we want label at position stickyX
    // So label offset = stickyX - x
    const stickyOffset = isSticky && stickyX !== undefined ? stickyX - x : undefined;

    return (
      <div
        className={`timeline-event timeline-event--duration ${isSelected ? 'timeline-event--selected' : ''} ${isSticky ? 'timeline-event--sticky' : ''} ${event.classname || ''}`}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: isSelected ? 10 : (isSticky ? 5 : 1),
          pointerEvents: 'auto',
        }}
        onClick={handleClick}
        data-event-id={event.title}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as unknown as React.MouseEvent); } }}
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
              ? `0 0 0 2px var(--event-selected-ring-color, white), 0 0 0 4px ${color}`
              : '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'box-shadow 0.15s ease',
            backgroundImage: event.tapeImage ? `url(${event.tapeImage})` : undefined,
            backgroundRepeat: event.tapeRepeat || 'repeat',
            opacity: isSelected ? 1 : 0.85,
          }}
        />

        {/* Duration event label - positioned sticky if needed */}
        {showLabel && (
          <span
            className={`timeline-event__label ${isSticky ? 'timeline-event__label--sticky' : ''}`}
            style={{
              position: stickyOffset !== undefined ? 'absolute' : 'relative',
              left: stickyOffset !== undefined ? stickyOffset : undefined,
              marginLeft: stickyOffset !== undefined ? 0 : 6,
              fontSize: 'var(--event-font-size, 12px)',
              fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
              color: textColor,
              whiteSpace: 'nowrap',
              fontWeight: isSelected || isSticky ? 600 : 400,
              textShadow: 'var(--event-text-shadow, 0 0 2px white, 0 0 2px white)',
              backgroundColor: isSticky ? 'var(--sticky-label-bg, rgba(255, 255, 255, 0.95))' : undefined,
              padding: isSticky ? '2px 6px' : undefined,
              borderRadius: isSticky ? 3 : undefined,
              boxShadow: isSticky ? 'var(--sticky-label-shadow, 0 1px 4px rgba(0,0,0,0.2))' : undefined,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isSticky && <span style={{ marginRight: 4, opacity: 0.5 }}>◀</span>}
            {event.title}
          </span>
        )}

      </div>
    );
  }

  // For sticky point events, calculate offset from parent's x position
  const stickyOffset = isSticky && stickyX !== undefined ? stickyX - x : undefined;

  // Render point event as a dot
  return (
    <div
      className={`timeline-event ${isSelected ? 'timeline-event--selected' : ''} ${isSticky ? 'timeline-event--sticky' : ''} ${event.classname || ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: isSelected ? 10 : (isSticky ? 5 : 1),
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
      data-event-id={event.title}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as unknown as React.MouseEvent); } }}
    >
      {/* Event dot - hidden when sticky (dot is off-screen) */}
      {!isSticky && (
        <div
          className="timeline-event__dot"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
            boxShadow: isSelected
              ? `0 0 0 2px var(--event-selected-ring-color, white), 0 0 0 4px ${color}`
              : 'none',
            transition: 'box-shadow 0.15s ease',
          }}
        />
      )}

      {/* Event label - positioned sticky if needed */}
      {showLabel && (
        <span
          className={`timeline-event__label ${isSticky ? 'timeline-event__label--sticky' : ''}`}
          style={{
            position: stickyOffset !== undefined ? 'absolute' : 'relative',
            left: stickyOffset !== undefined ? stickyOffset : undefined,
            marginLeft: stickyOffset !== undefined ? 0 : 6,
            fontSize: 'var(--event-font-size, 12px)',
            fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
            color: textColor,
            whiteSpace: 'nowrap',
            fontWeight: isSelected || isSticky ? 600 : 400,
            textShadow: 'var(--event-text-shadow, 0 0 2px white, 0 0 2px white)',
            backgroundColor: isSticky ? 'var(--sticky-label-bg, rgba(255, 255, 255, 0.95))' : undefined,
            padding: isSticky ? '2px 6px' : undefined,
            borderRadius: isSticky ? 3 : undefined,
            boxShadow: isSticky ? 'var(--sticky-label-shadow, 0 1px 4px rgba(0,0,0,0.2))' : undefined,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isSticky && (
            <span
              className="timeline-event__sticky-indicator"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: color,
                marginRight: 6,
                flexShrink: 0,
              }}
            />
          )}
          {event.title}
        </span>
      )}

    </div>
  );
}
