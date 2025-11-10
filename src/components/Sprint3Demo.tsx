/**
 * Sprint 3 Demo - Advanced Rendering
 *
 * Demonstrates:
 * - Multiple synchronized bands
 * - Three painter types (Original, Compact, Overview)
 * - LayoutEngine with automatic track assignment
 * - Event click handling (bubbles coming next)
 *
 * Sprint 3: Advanced Rendering
 */

import { useState, useEffect, useMemo } from 'react';
import { BandV3 } from './BandV3';
import { EventBubble } from './EventBubble';
import { LinearEther } from '../core/Ether';
import { EventSource } from '../core/EventSource';
import type { TimelineEvent } from '../types/events';
import type { Decorator } from '../types/decorators';

export function Sprint3Demo(): JSX.Element {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Load JFK assassination timeline data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const eventSource = new EventSource();
        await eventSource.loadFromUrl('/data/jfk-timeline.json');
        const loadedEvents = eventSource.getEvents();
        setEvents(loadedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // Create ethers for different bands
  const overviewEther = new LinearEther('YEAR', 200); // Wide view: 1 year = 200px
  const detailEther = new LinearEther('MONTH', 150); // Detail: 1 month = 150px
  const contextEther = new LinearEther('DECADE', 100); // Context: 1 decade = 100px

  // Create example decorators (JFK assassination: November 22, 1963)
  const decorators = useMemo((): Decorator[] => {
    return [
      // Span decorator: Highlight the assassination day
      {
        type: 'span',
        startDate: '1963-11-22T00:00:00',
        endDate: '1963-11-23T00:00:00',
        label: 'Assassination Day',
        color: '#ef4444',
        opacity: 0.2,
      },
      // Point decorator: Mark the exact moment (12:30 PM)
      {
        type: 'point',
        date: '1963-11-22T12:30:00',
        label: '12:30 PM',
        color: '#dc2626',
        opacity: 0.8,
        width: 3,
      },
      // Span decorator: Highlight the investigation period
      {
        type: 'span',
        startDate: '1963-11-22T00:00:00',
        endDate: '1964-09-27T00:00:00',
        label: 'Warren Commission Investigation',
        color: '#3b82f6',
        opacity: 0.1,
      },
    ];
  }, []);

  // Handle event click
  const handleEventClick = (event: TimelineEvent): void => {
    setSelectedEvent(event);
    // Event clicked - can be logged to analytics if needed
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Sprint 3 Demo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Sprint 3 Demo - Advanced Rendering</h1>
        <p className="text-sm text-gray-600 mt-1">
          Multiple synchronized bands with different painter types
        </p>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-blue-900">Overview Band:</span>
            <span className="text-blue-700 ml-2">
              Overview Painter (minimal style, 1 year/200px)
            </span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">Detail Band:</span>
            <span className="text-blue-700 ml-2">
              Original Painter (classic style, 1 month/150px)
            </span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">Context Band:</span>
            <span className="text-blue-700 ml-2">
              Compact Painter (dense style, 1 decade/100px)
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Overview Band - OverviewPainter */}
        <div className="border-b border-gray-300">
          <BandV3
            id="overview"
            height={80}
            ether={overviewEther}
            events={events}
            decorators={decorators}
            painterType="overview"
            showTimescale={true}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Detail Band - OriginalPainter */}
        <div className="border-b border-gray-300">
          <BandV3
            id="detail"
            height={400}
            ether={detailEther}
            events={events}
            decorators={decorators}
            painterType="original"
            showTimescale={true}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Context Band - CompactPainter */}
        <div className="border-b border-gray-300">
          <BandV3
            id="context"
            height={120}
            ether={contextEther}
            events={events}
            decorators={decorators}
            painterType="compact"
            showTimescale={true}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Event Bubble Modal */}
      {selectedEvent && (
        <EventBubble event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* Stats Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-6 py-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <div>Total Events: {events.length}</div>
          <div>
            Features: LayoutEngine ✓ | 3 Painters ✓ | Multi-Band Sync ✓ | Decorators ✓ | Event
            Bubbles ✓
          </div>
          <div>Click any event to see details</div>
        </div>
      </div>
    </div>
  );
}
