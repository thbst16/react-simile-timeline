import { useEffect, useState } from 'react';
import type { TimelineProps, TimelineData } from '../types';

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
 * ```
 */
export function Timeline({
  data,
  dataUrl,
  bands: _bands,
  hotZones: _hotZones,
  theme: _theme = 'classic',
  centerDate: _centerDate,
  width = '100%',
  height = 400,
  onEventClick: _onEventClick,
  onEventHover: _onEventHover,
  onScroll: _onScroll,
  onZoom: _onZoom,
  className,
  style,
}: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(data || null);
  const [loading, setLoading] = useState(!!dataUrl);
  const [error, setError] = useState<string | null>(null);

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

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    ...style,
  };

  if (loading) {
    return (
      <div className={className} style={containerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666',
        }}>
          Loading timeline...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={containerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#c00',
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!timelineData || !timelineData.events || timelineData.events.length === 0) {
    return (
      <div className={className} style={containerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666',
        }}>
          No timeline data available
        </div>
      </div>
    );
  }

  // Sprint 0: Basic scaffold - full implementation in Sprint 1
  return (
    <div
      className={className}
      style={containerStyle}
      data-testid="timeline-container"
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
          React Simile Timeline
        </h3>
        <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
          {timelineData.events.length} events loaded
        </p>
        <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
          Full implementation coming in Sprint 1
        </p>
      </div>
    </div>
  );
}
