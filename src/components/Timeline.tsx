/**
 * Timeline - Sprint 0 Prototype
 *
 * Simple horizontal timeline with basic panning.
 * This is a proof-of-concept, not production code.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { EventSource } from '../core/EventSource';
import type { TimelineEvent } from '../types/events';

export interface TimelineProps {
  dataUrl?: string;
  width?: string | number;
  height?: number;
  className?: string;
}

export function Timeline(props: TimelineProps): JSX.Element {
  const { width = '100%', height = 400, className = '', dataUrl } = props;

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [renderTime, setRenderTime] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef(new EventSource());

  // Load data
  useEffect(() => {
    if (!dataUrl) return;

    const loadData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        await eventSourceRef.current.loadFromUrl(dataUrl);
        const loadedEvents = eventSourceRef.current.getEvents();
        setEvents(loadedEvents);
        const endTime = performance.now();
        setRenderTime(endTime - startTime);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [dataUrl]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent): void => {
    setIsDragging(true);
    setDragStart(e.clientX);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      if (!isDragging) return;
      const delta = e.clientX - dragStart;
      setPanOffset((prev) => prev + delta);
      setDragStart(e.clientX);
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsDragging(false);
  }, []);

  // Calculate event positions (simple linear scale)
  const getEventPosition = (event: TimelineEvent): number => {
    if (events.length === 0) return 0;

    const date = new Date(event.start);
    const timestamp = date.getTime();
    // Scale: 1 day = 100 pixels
    const msPerDay = 24 * 60 * 60 * 1000;
    const firstEvent = events[0];
    if (!firstEvent) return 0;

    const baseDate = new Date(firstEvent.start).getTime();
    return ((timestamp - baseDate) / msPerDay) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-600">Loading timeline data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`timeline-container relative overflow-hidden bg-gray-50 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Performance indicator */}
      {renderTime !== null && (
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow text-sm">
          {events.length} events • {renderTime.toFixed(2)}ms
        </div>
      )}

      {/* Timeline track */}
      <div
        className="absolute inset-0 flex items-center"
        style={{
          transform: `translateX(${panOffset}px)`,
          willChange: 'transform',
        }}
      >
        {/* Events */}
        {events.map((event) => {
          const x = getEventPosition(event);
          const isDuration = event.isDuration && event.end;

          return (
            <div
              key={event.id}
              className="absolute"
              style={{
                left: `${x}px`,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {/* Event marker */}
              <div
                className="flex flex-col items-center"
                style={{ minWidth: isDuration ? '200px' : '120px' }}
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{
                    backgroundColor: event.color || '#2196F3',
                  }}
                />
                <div className="mt-2 p-2 bg-white rounded shadow-sm text-xs max-w-[120px]">
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-gray-500 text-[10px]">
                    {new Date(event.start).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No data message */}
      {events.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No events to display</p>
        </div>
      )}
    </div>
  );
}
