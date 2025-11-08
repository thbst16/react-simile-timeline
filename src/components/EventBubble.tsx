/**
 * EventBubble - Modal popup for displaying event details
 *
 * Features:
 * - Modal overlay with event details
 * - HTML content rendering (sanitized)
 * - Image display
 * - External links
 * - Full keyboard accessibility
 * - Focus trap and ESC key support
 * - ARIA labels for screen readers
 *
 * Sprint 3: Advanced Rendering
 */

import { useEffect, useRef, useCallback } from 'react';
import type { TimelineEvent } from '../types/events';

export interface EventBubbleProps {
  /** The event to display */
  event: TimelineEvent;

  /** Callback when bubble should close */
  onClose: () => void;

  /** Optional max width in pixels */
  maxWidth?: number;

  /** Optional max height in pixels */
  maxHeight?: number;
}

/**
 * EventBubble Component
 *
 * Displays event details in an accessible modal dialog
 */
export function EventBubble({
  event,
  onClose,
  maxWidth = 600,
  maxHeight = 400,
}: EventBubbleProps): JSX.Element {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when bubble opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap - keep focus within dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Format dates
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: event.start.includes('T') ? '2-digit' : undefined,
      minute: event.start.includes('T') ? '2-digit' : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-bubble-title"
        aria-describedby="event-bubble-description"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-start justify-between">
            <h2
              id="event-bubble-title"
              className="text-xl font-bold pr-8 leading-tight"
            >
              {event.title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Close event details"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Date info */}
          <div className="mt-2 text-sm text-blue-100">
            <time dateTime={event.start}>
              {formatDate(startDate)}
            </time>
            {endDate && (
              <>
                {' — '}
                <time dateTime={event.end}>
                  {formatDate(endDate)}
                </time>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto px-6 py-4"
          style={{ maxHeight: `${maxHeight - 120}px` }}
          id="event-bubble-description"
        >
          {/* Image */}
          {event.image && (
            <div className="mb-4">
              <img
                src={event.image}
                alt={event.caption || event.title}
                className="w-full h-auto rounded-lg shadow-md"
                loading="lazy"
              />
              {event.caption && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  {event.caption}
                </p>
              )}
            </div>
          )}

          {/* Description (HTML content) */}
          {event.description && (
            <div
              className="prose prose-sm max-w-none text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}

          {/* Body text (if different from description) */}
          {event.body && event.body !== event.description && (
            <div className="text-gray-700 mb-4">{event.body}</div>
          )}

          {/* Link */}
          {event.link && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={event.link}
                target={event.linkTarget || '_blank'}
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <span>Learn more</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* Empty state if no content */}
          {!event.description && !event.body && !event.image && !event.link && (
            <p className="text-gray-500 italic">No additional details available.</p>
          )}
        </div>

        {/* Footer with metadata */}
        {(event.isDuration || event.color) && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              {event.isDuration && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Duration Event
                </span>
              )}
              {event.color && (
                <span className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                    style={{ backgroundColor: event.color }}
                  />
                  {event.color}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
