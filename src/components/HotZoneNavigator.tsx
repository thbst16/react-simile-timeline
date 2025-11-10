/**
 * HotZoneNavigator Component
 *
 * Provides visual UI for navigating to hot zones in the timeline.
 * Displays zones at the timeline edges with hover-to-navigate behavior.
 *
 * Sprint 7: Complete Sprint 5 Features
 */

import { useState } from 'react';
import type { HotZone } from '../types/hotzone';
import { useTimelineStore } from '../store/timelineStore';

/**
 * HotZoneNavigator Props
 */
export interface HotZoneNavigatorProps {
  /**
   * Hot zones to display
   */
  zones: HotZone[];

  /**
   * Position of the navigator
   * @default 'edges'
   */
  position?: 'edges' | 'top' | 'bottom';

  /**
   * Show/hide the navigator
   * @default true
   */
  visible?: boolean;

  /**
   * Enable hover-to-navigate
   * @default true
   */
  enableHover?: boolean;

  /**
   * Hover delay in ms before navigation
   * @default 500
   */
  hoverDelay?: number;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Format date for display
 */
function formatZoneDate(dateStr: string | Date): string {
  try {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * HotZoneNavigator Component
 *
 * @example
 * <HotZoneNavigator
 *   zones={hotZones.zones}
 *   position="edges"
 *   enableHover={true}
 * />
 */
export function HotZoneNavigator({
  zones,
  position = 'edges',
  visible = true,
  enableHover = true,
  hoverDelay = 500,
  className = '',
}: HotZoneNavigatorProps): JSX.Element | null {
  const { setCenterDate } = useTimelineStore();
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);

  if (!visible || zones.length === 0) {
    return null;
  }

  /**
   * Navigate to a hot zone
   */
  const navigateToZone = (zone: HotZone): void => {
    try {
      const startDate = new Date(zone.start);
      const endDate = new Date(zone.end);
      // Navigate to the middle of the zone
      const centerTime = (startDate.getTime() + endDate.getTime()) / 2;
      setCenterDate(new Date(centerTime));
    } catch (error) {
      console.error('Failed to navigate to hot zone:', error);
    }
  };

  /**
   * Handle zone hover
   */
  const handleZoneHover = (index: number, zone: HotZone): void => {
    setHoveredZone(index);

    if (enableHover) {
      // Clear existing timeout
      if (hoverTimeout) {
        window.clearTimeout(hoverTimeout);
      }

      // Set new timeout to navigate
      const timeout = window.setTimeout(() => {
        navigateToZone(zone);
      }, hoverDelay);

      setHoverTimeout(timeout);
    }
  };

  /**
   * Handle zone hover end
   */
  const handleZoneHoverEnd = (): void => {
    setHoveredZone(null);

    // Clear timeout
    if (hoverTimeout) {
      window.clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  /**
   * Handle zone click
   */
  const handleZoneClick = (zone: HotZone): void => {
    navigateToZone(zone);
  };

  // Edge position (left/right sides)
  if (position === 'edges') {
    return (
      <>
        {/* Left Edge */}
        <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 ${className}`}>
          <div className="flex flex-col gap-2">
            {zones.slice(0, Math.ceil(zones.length / 2)).map((zone, index) => (
              <button
                key={index}
                onClick={() => handleZoneClick(zone)}
                onMouseEnter={() => handleZoneHover(index, zone)}
                onMouseLeave={handleZoneHoverEnd}
                className={`
                  group relative
                  w-3 h-12 rounded-r-full
                  bg-blue-500 hover:bg-blue-600
                  transition-all duration-200
                  ${hoveredZone === index ? 'w-5 shadow-lg' : 'hover:w-4'}
                `}
                title={`${formatZoneDate(zone.start)} - ${formatZoneDate(zone.end)}`}
              >
                {/* Tooltip */}
                <div
                  className={`
                    absolute left-full ml-2 top-1/2 -translate-y-1/2
                    bg-gray-900 text-white text-xs px-3 py-2 rounded
                    whitespace-nowrap pointer-events-none
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                  `}
                >
                  <div className="font-semibold">{zone.label || 'Hot Zone'}</div>
                  <div className="text-gray-300 text-[10px]">
                    {formatZoneDate(zone.start)} - {formatZoneDate(zone.end)}
                  </div>
                  {zone.magnify && (
                    <div className="text-blue-300 text-[10px] mt-1">
                      {zone.magnify}x magnification
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Edge */}
        <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 ${className}`}>
          <div className="flex flex-col gap-2">
            {zones.slice(Math.ceil(zones.length / 2)).map((zone, index) => {
              const actualIndex = index + Math.ceil(zones.length / 2);
              return (
                <button
                  key={actualIndex}
                  onClick={() => handleZoneClick(zone)}
                  onMouseEnter={() => handleZoneHover(actualIndex, zone)}
                  onMouseLeave={handleZoneHoverEnd}
                  className={`
                    group relative
                    w-3 h-12 rounded-l-full
                    bg-purple-500 hover:bg-purple-600
                    transition-all duration-200
                    ${hoveredZone === actualIndex ? 'w-5 shadow-lg' : 'hover:w-4'}
                  `}
                  title={`${formatZoneDate(zone.start)} - ${formatZoneDate(zone.end)}`}
                >
                  {/* Tooltip */}
                  <div
                    className={`
                      absolute right-full mr-2 top-1/2 -translate-y-1/2
                      bg-gray-900 text-white text-xs px-3 py-2 rounded
                      whitespace-nowrap pointer-events-none
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200
                    `}
                  >
                    <div className="font-semibold">{zone.label || 'Hot Zone'}</div>
                    <div className="text-gray-300 text-[10px]">
                      {formatZoneDate(zone.start)} - {formatZoneDate(zone.end)}
                    </div>
                    {zone.magnify && (
                      <div className="text-purple-300 text-[10px] mt-1">
                        {zone.magnify}x magnification
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Top/Bottom position (horizontal bar)
  const positionClasses =
    position === 'top' ? 'top-20 left-1/2 -translate-x-1/2' : 'bottom-4 left-1/2 -translate-x-1/2';

  return (
    <div className={`fixed ${positionClasses} z-40 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-2">
        <div className="flex gap-2">
          {zones.map((zone, index) => (
            <button
              key={index}
              onClick={() => handleZoneClick(zone)}
              onMouseEnter={() => handleZoneHover(index, zone)}
              onMouseLeave={handleZoneHoverEnd}
              className={`
                group relative
                px-4 py-2 rounded-md
                bg-gradient-to-r from-blue-500 to-purple-500
                hover:from-blue-600 hover:to-purple-600
                text-white text-xs font-medium
                transition-all duration-200
                ${hoveredZone === index ? 'scale-110 shadow-lg' : 'hover:scale-105'}
              `}
            >
              {zone.label || `Zone ${index + 1}`}

              {/* Tooltip */}
              <div
                className={`
                  absolute ${position === 'top' ? 'top-full mt-2' : 'bottom-full mb-2'}
                  left-1/2 -translate-x-1/2
                  bg-gray-900 text-white text-xs px-3 py-2 rounded
                  whitespace-nowrap pointer-events-none
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                `}
              >
                <div className="text-gray-300 text-[10px]">
                  {formatZoneDate(zone.start)} - {formatZoneDate(zone.end)}
                </div>
                {zone.magnify && (
                  <div className="text-blue-300 text-[10px] mt-1">
                    {zone.magnify}x magnification
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact HotZone Indicator (minimal display)
 */
export interface HotZoneIndicatorProps {
  /**
   * Current active zones
   */
  activeZones: HotZone[];

  /**
   * Position
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Show/hide
   */
  visible?: boolean;
}

export function HotZoneIndicator({
  activeZones,
  position = 'top-left',
  visible = true,
}: HotZoneIndicatorProps): JSX.Element | null {
  if (!visible || activeZones.length === 0) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40
        bg-gradient-to-r from-blue-500 to-purple-500
        text-white px-3 py-1.5 rounded-full shadow-lg
        text-xs font-medium pointer-events-none select-none`}
    >
      🔥 {activeZones.length} Hot Zone{activeZones.length !== 1 ? 's' : ''}
    </div>
  );
}
