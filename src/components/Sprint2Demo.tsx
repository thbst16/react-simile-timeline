/**
 * Sprint 2 Demo Component
 *
 * Demonstrates:
 * - Ether system (time-to-pixel conversion)
 * - Band component with viewport
 * - Time scale rendering
 * - Event rendering (points & duration tapes)
 * - Pan/drag functionality
 */

import { useState, useEffect } from 'react';
import { Band } from './Band';
import { LinearEther, LogarithmicEther, HotZoneEther } from '../core/Ether';
import type { HotZone } from '../core/Ether';
import { EventSource } from '../core/EventSource';
import { useTimelineStore } from '../store/timelineStore';
import type { TimelineEvent } from '../types/events';
import type { IntervalUnit } from '../types/bands';

export function Sprint2Demo(): JSX.Element {
  const [eventSource] = useState(() => new EventSource());
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loadingInfo, setLoadingInfo] = useState<string>('');
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('MONTH');
  const [intervalPixels, setIntervalPixels] = useState<number>(100);
  const [etherType, setEtherType] = useState<'linear' | 'logarithmic' | 'hotzone'>('linear');
  const [renderTime, setRenderTime] = useState<number>(0);

  const { centerDate, setCenterDate, zoom, setZoom } = useTimelineStore();

  const loadData = async (url: string): Promise<void> => {
    const startTime = performance.now();
    try {
      await eventSource.loadFromUrl(url);
      const loadedEvents = eventSource.getEvents();
      setEvents(loadedEvents);

      // Auto-center on first event
      if (loadedEvents.length > 0 && loadedEvents[0]) {
        const firstDate = new Date(loadedEvents[0].start);
        setCenterDate(firstDate);
      }

      const endTime = performance.now();
      setRenderTime(endTime - startTime);

      const validation = eventSource.getValidationResult();
      if (validation) {
        setLoadingInfo(
          `Loaded: ${validation.validEvents} valid, ${validation.invalidEvents} invalid events (${Math.round(renderTime)}ms)`
        );
      }
    } catch (error) {
      setLoadingInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Load JFK timeline on mount
  useEffect(() => {
    void loadData('/data/jfk-timeline.json');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create ether based on type
  const createEther = (): LinearEther | LogarithmicEther | HotZoneEther => {
    const adjustedPixels = intervalPixels * zoom;

    switch (etherType) {
      case 'logarithmic':
        return new LogarithmicEther(intervalUnit, adjustedPixels);

      case 'hotzone': {
        // Create hot zone around 1960-1963 (JFK presidency)
        const hotZones: HotZone[] = [
          {
            startDate: new Date('1960-01-01'),
            endDate: new Date('1964-01-01'),
            magnify: 2,
          },
        ];
        return new HotZoneEther(intervalUnit, adjustedPixels, hotZones);
      }

      case 'linear':
      default:
        return new LinearEther(intervalUnit, adjustedPixels);
    }
  };

  const ether = createEther();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sprint 2: Core Rendering Demo</h1>
        <p className="text-gray-600">Single band timeline with time scale and event rendering</p>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Data Source */}
            <div>
              <label className="block text-sm font-medium mb-2">Data Source</label>
              <div className="space-y-2">
                <button
                  onClick={() => void loadData('/data/jfk-timeline.json')}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  JFK Timeline (20 events)
                </button>
                <button
                  onClick={() => void loadData('/data/sample-small.json')}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Sample Data (10 events)
                </button>
                <button
                  onClick={() => void loadData('/data/test-date-formats.json')}
                  className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                  Date Formats Test
                </button>
                <button
                  onClick={() => void loadData('/data/performance-200.json')}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Performance: 200 Events
                </button>
              </div>
            </div>

            {/* Interval Unit */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Interval Unit: {intervalUnit}
              </label>
              <select
                value={intervalUnit}
                onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="DAY">Day</option>
                <option value="WEEK">Week</option>
                <option value="MONTH">Month</option>
                <option value="YEAR">Year</option>
                <option value="DECADE">Decade</option>
              </select>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={intervalPixels}
                onChange={(e) => setIntervalPixels(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                Pixels per interval: {intervalPixels}
              </div>
            </div>

            {/* Ether Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Ether Type: {etherType}</label>
              <div className="space-y-2">
                <button
                  onClick={() => setEtherType('linear')}
                  className={`w-full px-3 py-1 rounded text-sm ${
                    etherType === 'linear' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Linear
                </button>
                <button
                  onClick={() => setEtherType('logarithmic')}
                  className={`w-full px-3 py-1 rounded text-sm ${
                    etherType === 'logarithmic'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Logarithmic
                </button>
                <button
                  onClick={() => setEtherType('hotzone')}
                  className={`w-full px-3 py-1 rounded text-sm ${
                    etherType === 'hotzone' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Hot Zone (1960-63)
                </button>
              </div>
            </div>

            {/* Zoom Control */}
            <div>
              <label className="block text-sm font-medium mb-2">Zoom: {zoom.toFixed(2)}x</label>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                Effective pixels: {Math.round(intervalPixels * zoom)}
              </div>
              <button
                onClick={() => setZoom(1)}
                className="w-full mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Reset Zoom
              </button>
            </div>
          </div>

          {/* Loading Info */}
          {loadingInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>Status:</strong> {loadingInfo}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Band */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Band
              id="main-band"
              height={200}
              ether={ether}
              events={events}
              showTimescale={true}
              onScroll={() => {
                // Optional: track scroll events
              }}
            />
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-3">Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Load Time</div>
              <div className="text-2xl font-bold">{Math.round(renderTime)}ms</div>
              <div className="text-xs text-gray-500">Target: &lt;50ms for 200 events</div>
            </div>
            <div>
              <div className="text-gray-600">Total Events</div>
              <div className="text-2xl font-bold">{events.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Interval Unit</div>
              <div className="text-2xl font-bold">{intervalUnit}</div>
            </div>
            <div>
              <div className="text-gray-600">Center Date</div>
              <div className="text-lg font-bold">{centerDate.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">Sprint 2 Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ Time-to-pixel conversion (Ether system)</li>
            <li>✅ Linear, Logarithmic, and Hot Zone ethers</li>
            <li>✅ Band component with viewport management</li>
            <li>✅ Time scale rendering with adaptive labels</li>
            <li>✅ Event rendering (points and duration tapes)</li>
            <li>✅ Drag-to-pan interaction</li>
            <li>✅ Zoom control</li>
            <li>✅ Dynamic interval unit selection</li>
          </ul>
          <div className="mt-3 text-sm">
            <strong>Try it:</strong> Drag the timeline to pan, adjust zoom, change interval units,
            and switch between different ether types!
          </div>
        </div>
      </div>
    </div>
  );
}
