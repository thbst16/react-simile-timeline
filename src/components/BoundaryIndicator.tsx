/**
 * BoundaryIndicator Component
 *
 * Visual indicator displayed when timeline reaches min/max date boundaries.
 * Prevents user confusion by showing they've reached the edge of available data.
 *
 * Sprint 7: Polish & Bug Fixes
 */

import { useEffect, useState } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { isAtBoundary } from '../utils/dateBounds';

export interface BoundaryIndicatorProps {
  /** Position: left (min date) or right (max date) */
  position: 'left' | 'right';
  /** Optional custom message */
  message?: string;
  /** Height of the indicator */
  height?: number;
}

/**
 * Shows a visual indicator when at timeline boundary
 *
 * @example
 * <BoundaryIndicator position="left" />
 * <BoundaryIndicator position="right" message="End of timeline" />
 */
export function BoundaryIndicator({
  position,
  message,
  height = 400,
}: BoundaryIndicatorProps): JSX.Element | null {
  const { centerDate, dateBounds } = useTimelineStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (!dateBounds) {
      setIsVisible(false);
      setIsNear(false);
      return;
    }

    const boundary = isAtBoundary(centerDate, dateBounds);

    if (position === 'left') {
      setIsVisible(boundary.atMin);
      setIsNear(boundary.nearMin);
    } else {
      setIsVisible(boundary.atMax);
      setIsNear(boundary.nearMax);
    }
  }, [centerDate, dateBounds, position]);

  // Don't render if not near or at boundary
  if (!isVisible && !isNear) {
    return null;
  }

  const defaultMessage = position === 'left' ? 'Start of timeline' : 'End of timeline';
  const displayMessage = message || defaultMessage;

  return (
    <div
      className={`absolute top-0 ${position === 'left' ? 'left-0' : 'right-0'} flex items-center justify-center pointer-events-none transition-opacity duration-300`}
      style={{
        height: `${height}px`,
        width: '60px',
        opacity: isVisible ? 1 : isNear ? 0.4 : 0,
        background:
          position === 'left'
            ? 'linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent)'
            : 'linear-gradient(to left, rgba(99, 102, 241, 0.1), transparent)',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Edge indicator line */}
      <div
        className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} h-full w-0.5 bg-indigo-400`}
        style={{
          opacity: isVisible ? 0.6 : 0.2,
        }}
      />

      {/* Message (only when fully at boundary) */}
      {isVisible && (
        <div
          className={`absolute ${position === 'left' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          <span className="text-xs font-medium text-indigo-600 bg-white/90 px-2 py-1 rounded shadow-sm">
            {displayMessage}
          </span>
        </div>
      )}
    </div>
  );
}
