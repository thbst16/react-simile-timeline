import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTimelineContext } from './TimelineProvider';
import { formatDate, parseDate } from '../utils/dateUtils';

export interface EventPopupProps {
  /** Container element for positioning reference */
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Calculate popup position to keep it visible within viewport
 */
function calculatePopupPosition(
  clickX: number,
  clickY: number,
  popupWidth: number,
  popupHeight: number
): { top: number; left: number } {
  const padding = 16;
  const offset = 12; // Offset from click point

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Try to position to the right of the click point
  let left = clickX + offset;
  let top = clickY - popupHeight / 2;

  // If popup would go off the right edge, position to the left of click point
  if (left + popupWidth + padding > viewportWidth) {
    left = clickX - popupWidth - offset;
  }

  // If still off screen (very narrow viewport), center it
  if (left < padding) {
    left = Math.max(padding, (viewportWidth - popupWidth) / 2);
  }

  // Keep within vertical bounds
  if (top < padding) {
    top = padding;
  } else if (top + popupHeight + padding > viewportHeight) {
    top = viewportHeight - popupHeight - padding;
  }

  return { top, left };
}

/**
 * Event details popup component
 * Renders as a portal for proper z-index handling
 */
export function EventPopup(_props: EventPopupProps) {
  const { state, actions } = useTimelineContext();
  const popupRef = useRef<HTMLDivElement>(null);
  const { selectedEvent, clickPosition } = state;
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!selectedEvent) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        // Check if click was on an event marker
        const target = e.target as HTMLElement;
        if (target.closest('.timeline-event')) {
          return; // Let the event marker handle it
        }
        actions.setSelectedEvent(null);
      }
    };

    // Use setTimeout to avoid catching the click that opened the popup
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedEvent, actions]);

  // Close on Escape key
  useEffect(() => {
    if (!selectedEvent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        actions.setSelectedEvent(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent, actions]);

  // Calculate popup position after render
  useEffect(() => {
    if (!selectedEvent || !clickPosition || !popupRef.current) {
      setPosition(null);
      return;
    }

    // Get popup dimensions after render
    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const newPosition = calculatePopupPosition(
      clickPosition.x,
      clickPosition.y,
      rect.width,
      rect.height
    );
    setPosition(newPosition);
  }, [selectedEvent, clickPosition]);

  const handleClose = useCallback(() => {
    actions.setSelectedEvent(null);
  }, [actions]);

  if (!selectedEvent) return null;

  // Format dates
  let dateDisplay = '';
  try {
    const startDate = parseDate(selectedEvent.start);
    dateDisplay = formatDate(startDate, 'MMM d, yyyy');

    if (selectedEvent.end) {
      const endDate = parseDate(selectedEvent.end);
      dateDisplay += ` - ${formatDate(endDate, 'MMM d, yyyy')}`;
    }
  } catch {
    dateDisplay = selectedEvent.start;
  }

  // Use calculated position or fallback to center
  const popupStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--popup-bg, #ffffff)',
        border: '1px solid var(--popup-border, #cccccc)',
        borderRadius: 8,
        boxShadow: 'var(--popup-shadow, 0 4px 16px rgba(0,0,0,0.15))',
        padding: 16,
        maxWidth: 400,
        minWidth: 280,
        zIndex: 1000,
        fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'var(--popup-bg, #ffffff)',
        border: '1px solid var(--popup-border, #cccccc)',
        borderRadius: 8,
        boxShadow: 'var(--popup-shadow, 0 4px 16px rgba(0,0,0,0.15))',
        padding: 16,
        maxWidth: 400,
        minWidth: 280,
        zIndex: 1000,
        fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
        visibility: 'hidden', // Hide during initial position calculation
      };

  const popupContent = (
    <div
      ref={popupRef}
      className="timeline-popup"
      style={popupStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      aria-describedby={selectedEvent.description ? "popup-description" : undefined}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="timeline-popup__close"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          color: 'var(--popup-close-color, #666)',
          padding: 4,
          lineHeight: 1,
        }}
        aria-label="Close popup"
      >
        &times;
      </button>

      {/* Title */}
      <h3
        id="popup-title"
        className="timeline-popup__title"
        style={{
          margin: '0 0 8px 0',
          fontSize: 16,
          fontWeight: 600,
          color: selectedEvent.color || 'var(--event-default-color, #4a90d9)',
          paddingRight: 24, // Space for close button
        }}
      >
        {selectedEvent.title}
      </h3>

      {/* Date */}
      <div
        className="timeline-popup__date"
        style={{
          fontSize: 13,
          color: 'var(--popup-date-color, #888)',
          marginBottom: 12,
        }}
      >
        {dateDisplay}
      </div>

      {/* Description */}
      {selectedEvent.description && (
        <div
          id="popup-description"
          className="timeline-popup__description"
          style={{
            fontSize: 14,
            color: 'var(--popup-text-color, #333)',
            lineHeight: 1.5,
          }}
          // Allow HTML in description for Simile compatibility
          dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
        />
      )}

      {/* Link */}
      {selectedEvent.link && (
        <a
          href={selectedEvent.link}
          target="_blank"
          rel="noopener noreferrer"
          className="timeline-popup__link"
          style={{
            display: 'inline-block',
            marginTop: 12,
            fontSize: 13,
            color: 'var(--popup-link-color, #0066cc)',
            textDecoration: 'none',
          }}
        >
          More information &rarr;
        </a>
      )}

      {/* Image */}
      {selectedEvent.image && (
        <div
          className="timeline-popup__image"
          style={{
            marginTop: 12,
          }}
        >
          <img
            src={selectedEvent.image}
            alt={selectedEvent.title}
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              borderRadius: 4,
            }}
          />
        </div>
      )}
    </div>
  );

  // Render as portal to body for proper z-index
  return createPortal(popupContent, document.body);
}
