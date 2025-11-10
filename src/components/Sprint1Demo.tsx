/**
 * Sprint 1 Demo Component
 *
 * Demonstrates:
 * - Multi-format date parsing
 * - Data validation
 * - EventSource CRUD operations
 * - Zustand state management
 */

import { useState } from 'react';
import { EventSource } from '../core/EventSource';
import { parseDate, formatDate, isBCEDate } from '../core/DateTime';
import { useTimelineStore } from '../store/timelineStore';
import type { TimelineEvent } from '../types/events';

export function Sprint1Demo(): JSX.Element {
  const [eventSource] = useState(() => new EventSource());
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [validationInfo, setValidationInfo] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Zustand store
  const { centerDate, zoom, setCenterDate, setZoom } = useTimelineStore();

  const loadData = async (url: string): Promise<void> => {
    try {
      await eventSource.loadFromUrl(url);
      const loadedEvents = eventSource.getEvents();
      setEvents(loadedEvents);

      // Auto-center on first event's date
      if (loadedEvents.length > 0) {
        try {
          const firstEvent = loadedEvents[0];
          if (firstEvent) {
            const firstDate = parseDate(firstEvent.start);
            setCenterDate(firstDate);
          }
        } catch (error) {
          console.warn('Could not auto-center on first event:', error);
        }
      }

      const validation = eventSource.getValidationResult();
      if (validation) {
        const validText = `Loaded: ${validation.validEvents} valid, ${validation.invalidEvents} invalid events`;
        const dateText =
          loadedEvents.length > 0 ? ` • Auto-centered on: ${loadedEvents[0]?.start}` : '';
        setValidationInfo(validText + dateText);
      }
    } catch (error) {
      setValidationInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testDateParsing = (): void => {
    const testDates = ['2006-06-28T00:00:00Z', 'June 28, 2006', '-500', '500 BC', '776 BCE'];

    // eslint-disable-next-line no-console
    console.log('=== Date Parsing Tests ===');
    testDates.forEach((dateStr) => {
      try {
        const parsed = parseDate(dateStr);
        const formatted = formatDate(parsed);
        const isBCE = isBCEDate(dateStr);
        // eslint-disable-next-line no-console
        console.log(`"${dateStr}" → ${parsed.toISOString()} → ${formatted} (BCE: ${isBCE})`);
      } catch (error) {
        console.error(`Failed to parse "${dateStr}":`, error);
      }
    });
  };

  const testCRUDOperations = (): void => {
    // eslint-disable-next-line no-console
    console.log('=== CRUD Operations Test ===');

    // Add
    const newEvent: TimelineEvent = {
      start: '2006-07-15T00:00:00Z',
      title: 'New Test Event',
      description: 'Added via CRUD test',
      color: '#00FF00',
    };

    eventSource.addEvent(newEvent);
    // eslint-disable-next-line no-console
    console.log('Added event:', newEvent);
    // eslint-disable-next-line no-console
    console.log('Total events:', eventSource.getCount());

    // Search
    const searchResults = eventSource.searchEvents('Test');
    // eslint-disable-next-line no-console
    console.log('Search "Test":', searchResults.length, 'results');

    // Update
    if (newEvent.id) {
      eventSource.updateEvent(newEvent.id, { description: 'Updated description' });
      // eslint-disable-next-line no-console
      console.log('Updated event:', eventSource.getEventById(newEvent.id));
    }

    // Refresh display
    setEvents(eventSource.getEvents());
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sprint 1: Foundation & Data Layer Demo
          </h1>
          <p className="text-gray-600">Testing date parsing, validation, and EventSource API</p>
        </div>

        {/* Data Loading Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Load Test Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => void loadData('/data/sample-small.json')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Original Sample
            </button>
            <button
              onClick={() => void loadData('/data/test-date-formats.json')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Date Formats Test
            </button>
            <button
              onClick={() => void loadData('/data/test-bce-dates.json')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              BCE Dates Test
            </button>
            <button
              onClick={() => void loadData('/data/test-invalid-data.json')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Invalid Data Test
            </button>
            <button
              onClick={testDateParsing}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Test Date Parsing
            </button>
            <button
              onClick={testCRUDOperations}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Test CRUD Ops
            </button>
          </div>

          {validationInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>Validation:</strong> {validationInfo}
            </div>
          )}
        </div>

        {/* Zustand Store State */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Zustand Store State</h2>
          <p className="text-sm text-gray-600 mb-4">
            Global state that will control timeline view in Sprint 2. Auto-updates when loading
            data.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Center Date:</label>
              <input
                type="datetime-local"
                value={centerDate.toISOString().slice(0, 16)}
                onChange={(e) => setCenterDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
              <div className="mt-2 text-xs text-gray-500">
                <strong>Current:</strong> {formatDate(centerDate, 'PPP p')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zoom: {zoom.toFixed(2)}x</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-xs text-gray-500">
                <strong>Effect:</strong>{' '}
                {zoom < 1 ? 'Zoomed out' : zoom > 1 ? 'Zoomed in' : 'Normal'}
                {' • '}
                Will control timeline scale in Sprint 2
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            <strong>Watch this change:</strong> Load different datasets and see the center date
            automatically update to the first event&apos;s date!
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Loaded Events ({events.length})</h2>

          {events.length === 0 ? (
            <p className="text-gray-500">
              No events loaded. Click a button above to load test data.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((event, index) => {
                let parsedDate: Date | null = null;
                let formattedDate = '';
                let isBCE = false;

                try {
                  parsedDate = parseDate(event.start);
                  formattedDate = formatDate(parsedDate);
                  isBCE = isBCEDate(event.start);
                } catch (error) {
                  formattedDate = `Parse error: ${event.start}`;
                }

                return (
                  <div
                    key={event.id || index}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-4 border rounded cursor-pointer transition ${
                      selectedEvent?.id === event.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: event.color || '#2196F3' }}
                          />
                          <h3 className="font-semibold">{event.title}</h3>
                          {isBCE && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              BCE
                            </span>
                          )}
                          {event.isDuration && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Duration
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>
                            <strong>Raw:</strong> {event.start}
                            {event.end && ` → ${event.end}`}
                          </div>
                          <div>
                            <strong>Parsed:</strong> {formattedDate}
                          </div>
                          {event.id && (
                            <div>
                              <strong>ID:</strong> {event.id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click &quot;Date Formats Test&quot; - Shows various date format parsing</li>
            <li>Click &quot;BCE Dates Test&quot; - Tests ancient date handling (500 BC, etc.)</li>
            <li>Click &quot;Invalid Data Test&quot; - Shows validation error handling</li>
            <li>Click &quot;Test Date Parsing&quot; - Logs detailed parsing info to console</li>
            <li>Click &quot;Test CRUD Ops&quot; - Tests add/update/search operations</li>
            <li>Check browser console (F12) for detailed test output</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
