import { useMemo } from 'react';
import type { HotZone } from '../types';
import { parseDate, dateToPixel } from '../utils/dateUtils';

export interface HotZonesProps {
  /** Array of hot zone configurations */
  hotZones: HotZone[];
  /** Visible date range */
  visibleRange: { start: Date; end: Date };
  /** Pixels per millisecond */
  pixelsPerMs: number;
  /** Viewport width in pixels */
  viewportWidth: number;
  /** Center date of the viewport */
  centerDate: Date;
}

/** Default hot zone color */
const DEFAULT_HOT_ZONE_COLOR = 'rgba(255, 220, 100, 0.3)';

/**
 * HotZones component - renders highlighted background regions on the timeline
 */
export function HotZones({
  hotZones,
  visibleRange,
  pixelsPerMs,
  viewportWidth,
  centerDate,
}: HotZonesProps) {
  // Calculate viewport left edge in time
  const viewportLeftMs = centerDate.getTime() - (viewportWidth / 2) / pixelsPerMs;
  const viewportLeftDate = new Date(viewportLeftMs);

  // Filter and calculate positions for visible hot zones
  const visibleHotZones = useMemo(() => {
    return hotZones
      .map(zone => {
        try {
          const startDate = parseDate(zone.start);
          const endDate = parseDate(zone.end);
          const startTime = startDate.getTime();
          const endTime = endDate.getTime();

          // Check if zone overlaps with visible range
          if (endTime < visibleRange.start.getTime() || startTime > visibleRange.end.getTime()) {
            return null;
          }

          // Calculate pixel positions
          const x = dateToPixel(startDate, viewportLeftDate, pixelsPerMs);
          const endX = dateToPixel(endDate, viewportLeftDate, pixelsPerMs);
          const width = endX - x;

          return {
            zone,
            x,
            width,
            color: zone.color || DEFAULT_HOT_ZONE_COLOR,
            annotation: zone.annotation,
          };
        } catch {
          // Skip zones with invalid dates
          return null;
        }
      })
      .filter((z): z is NonNullable<typeof z> => z !== null);
  }, [hotZones, visibleRange, viewportLeftDate, pixelsPerMs]);

  if (visibleHotZones.length === 0) {
    return null;
  }

  return (
    <div
      className="timeline-hot-zones"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {visibleHotZones.map((hz, index) => (
        <div
          key={`hotzone-${index}-${hz.zone.start}`}
          className="timeline-hot-zone"
          style={{
            position: 'absolute',
            left: hz.x,
            top: 0,
            width: hz.width,
            height: '100%',
            backgroundColor: hz.color,
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Annotation text - positioned at bottom to avoid overlap with events */}
          {hz.annotation && (
            <div
              className="timeline-hot-zone__annotation"
              style={{
                position: 'absolute',
                bottom: 28, // Above the 24px time scale
                left: 4,
                right: 4,
                fontSize: '10px',
                fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
                color: 'var(--hot-zone-text-color, #888)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 500,
                fontStyle: 'italic',
                opacity: 0.8,
              }}
            >
              {hz.annotation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
