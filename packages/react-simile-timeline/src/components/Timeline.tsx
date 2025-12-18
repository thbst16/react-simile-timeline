import React, { useEffect, useState, useRef } from 'react';
import type { TimelineProps, TimelineData } from '../types';
import { TimelineProvider, useTimelineContext } from './TimelineProvider';
import { Band } from './Band';
import { EventPopup } from './EventPopup';
import '../styles/timeline.css';

/**
 * Inner component that renders bands from context
 */
function TimelineBands() {
  const { bands } = useTimelineContext();

  return (
    <div
      className="timeline-bands"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {bands.map((bandConfig, index) => (
        <Band
          key={bandConfig.id || `band-${index}`}
          config={bandConfig}
          isPrimary={index === 0 || !bandConfig.syncWith}
        />
      ))}
    </div>
  );
}

/**
 * Timeline component - A modern React implementation of MIT SIMILE Timeline
 *
 * @example
 * ```tsx
 * // With inline data
 * <Timeline data={{ events: [...] }} />
 *
 * // With URL data source
 * <Timeline dataUrl="/api/events.json" />
 *
 * // With custom bands
 * <Timeline
 *   data={data}
 *   bands={[
 *     { id: 'main', height: '80%', timeUnit: 'day' },
 *     { id: 'overview', height: '20%', timeUnit: 'year', overview: true, syncWith: 'main' }
 *   ]}
 * />
 * ```
 */
export function Timeline({
  data,
  dataUrl,
  bands,
  hotZones,
  theme = 'classic',
  centerDate,
  width = '100%',
  height = 400,
  onEventClick,
  onEventHover,
  onScroll,
  onZoom: _onZoom, // Reserved for Sprint 2
  className,
  style,
}: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(data || null);
  const [loading, setLoading] = useState(!!dataUrl);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch data from URL if provided
  useEffect(() => {
    if (dataUrl) {
      setLoading(true);
      setError(null);

      fetch(dataUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch timeline data: ${response.statusText}`);
          }
          return response.json();
        })
        .then((json: TimelineData) => {
          setTimelineData(json);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [dataUrl]);

  // Update data when prop changes
  useEffect(() => {
    if (data) {
      setTimelineData(data);
    }
  }, [data]);

  // Determine theme data attribute
  const themeAttr = typeof theme === 'string' ? theme : theme?.name || 'classic';

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  if (loading) {
    return (
      <div
        className={`timeline-root ${className || ''}`}
        style={containerStyle}
        data-theme={themeAttr}
        data-testid="timeline-container"
      >
        <div className="timeline-loading">
          Loading timeline...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`timeline-root ${className || ''}`}
        style={containerStyle}
        data-theme={themeAttr}
        data-testid="timeline-container"
      >
        <div className="timeline-error">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!timelineData || !timelineData.events || timelineData.events.length === 0) {
    return (
      <div
        className={`timeline-root ${className || ''}`}
        style={containerStyle}
        data-theme={themeAttr}
        data-testid="timeline-container"
      >
        <div className="timeline-empty">
          No timeline data available
        </div>
      </div>
    );
  }

  // Pass bands to provider - if undefined, provider will auto-generate based on data
  const bandConfigs = bands && bands.length > 0 ? bands : undefined;

  // Parse initial center date
  const initialCenterDate = centerDate
    ? (centerDate instanceof Date ? centerDate : new Date(centerDate))
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`timeline-root ${className || ''}`}
      style={containerStyle}
      data-theme={themeAttr}
      data-testid="timeline-container"
    >
      <TimelineProvider
        events={timelineData.events}
        bands={bandConfigs}
        hotZones={hotZones}
        initialCenterDate={initialCenterDate}
        onScroll={onScroll}
        onEventClick={onEventClick}
        onEventHover={onEventHover}
      >
        <TimelineBands />
        <EventPopup containerRef={containerRef} />
      </TimelineProvider>
    </div>
  );
}
