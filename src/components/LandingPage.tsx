/**
 * Landing Page Component - Hero Section for React Simile Timeline
 *
 * Features:
 * - Hero section with impressive timeline
 * - Key features grid
 * - Visual comparison table (Original SIMILE vs React)
 */

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BandV3 } from './BandV3';
import { EventBubble } from './EventBubble';
import { ThemeSwitcher } from './ThemeSwitcher';
import { TimelineControls } from './TimelineControls';
import { heroEvents } from '../data/worldHistoryData';
import { LinearEther } from '../core/Ether';
import { ThemeProvider } from '../hooks/useTheme';
import { useTimelineStore } from '../store/timelineStore';
import type { TimelineEvent } from '../types/events';
import packageJson from '../../package.json';

type DemoTimeline = 'world-history' | 'jfk' | 'world-cup-2006';

const LandingPageInner: React.FC = () => {
  // State for selected event (to show EventBubble)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<DemoTimeline>('world-history');
  const [demoEvents, setDemoEvents] = useState<TimelineEvent[]>(heroEvents);
  const [isLoading, setIsLoading] = useState(false);

  // Get timeline store for centering
  const { setCenterDate } = useTimelineStore();

  // Create ethers dynamically based on selected timeline
  // Different timelines need different zoom levels:
  // - World History: centuries span (YEAR/DECADE)
  // - JFK: decades span (MONTH/YEAR)
  // - World Cup 2006: one month span (DAY/WEEK)
  const detailEther = useMemo(() => {
    switch (selectedDemo) {
      case 'world-cup-2006':
        return new LinearEther('DAY', 80); // 80 pixels per day for 1-month span (31 days = 2480px)
      case 'jfk':
        return new LinearEther('MONTH', 30); // 30 pixels per month for 46-year span (552 months = 16,560px)
      case 'world-history':
      default:
        return new LinearEther('YEAR', 100); // 100 pixels per year for centuries
    }
  }, [selectedDemo]);

  const overviewEther = useMemo(() => {
    switch (selectedDemo) {
      case 'world-cup-2006':
        return new LinearEther('DAY', 20); // 20 pixels per day for overview (31 days = 620px)
      case 'jfk':
        return new LinearEther('YEAR', 20); // 20 pixels per year for overview (46 years = 920px)
      case 'world-history':
      default:
        return new LinearEther('DECADE', 10); // 10 pixels per decade for overview
    }
  }, [selectedDemo]);

  // Dynamic band height based on timeline density
  // World Cup: 6 events on July 9 finals → need 6 tracks × 35px = 210px + 50px timescale = 260px minimum
  // Provide extra space (600px) to show multiple tracks comfortably with labels
  const detailBandHeight = useMemo(() => {
    switch (selectedDemo) {
      case 'world-cup-2006':
        return 600; // Taller for dense finals events
      case 'jfk':
        return 450; // Medium height
      case 'world-history':
      default:
        return 400; // Standard height
    }
  }, [selectedDemo]);

  // Auto-center timeline on event date range when events change
  useEffect(() => {
    if (demoEvents.length === 0) return;

    // Calculate the middle date of the event range
    const dates = demoEvents
      .map(e => new Date(e.start).getTime())
      .filter(t => !isNaN(t));

    if (dates.length === 0) return;

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const centerTime = (minDate + maxDate) / 2;
    const centerDate = new Date(centerTime);

    setCenterDate(centerDate);
  }, [demoEvents, setCenterDate]);

  // Handle event click
  const handleEventClick = (event: TimelineEvent): void => {
    setSelectedEvent(event);
  };

  // Handle reset - re-center timeline on events
  const handleReset = useCallback((): void => {
    if (demoEvents.length === 0) return;

    const dates = demoEvents
      .map(e => new Date(e.start).getTime())
      .filter(t => !isNaN(t));

    if (dates.length === 0) return;

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const centerTime = (minDate + maxDate) / 2;
    const centerDate = new Date(centerTime);

    setCenterDate(centerDate);
  }, [demoEvents, setCenterDate]);

  // Handle demo timeline selection
  const handleDemoChange = async (demo: DemoTimeline): Promise<void> => {
    if (demo === selectedDemo) return;

    setSelectedDemo(demo);
    setIsLoading(true);

    try {
      if (demo === 'world-history') {
        setDemoEvents(heroEvents);
      } else {
        // Map demo IDs to actual JSON filenames
        const fileMap: Record<string, string> = {
          'jfk': 'jfk-timeline.json',
          'world-cup-2006': 'world-cup-2006.json'
        };
        const filename = fileMap[demo];
        const response = await fetch(`/demo-data/${filename}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data: { dateTimeFormat: string; events: TimelineEvent[] } = await response.json() as { dateTimeFormat: string; events: TimelineEvent[] };
        setDemoEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to load demo timeline:', error);
      setDemoEvents(heroEvents);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        {/* Theme Switcher - Floating top right */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeSwitcher />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              React Simile Timeline
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-2">
              Modern React port of MIT&apos;s classic SIMILE Timeline
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
              Production-ready, TypeScript-based timeline component with 100% compatibility
              for original Simile JSON format
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-green-500">⚡</span>
                <span className="text-slate-700 dark:text-slate-300">2000+ events</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">♿</span>
                <span className="text-slate-700 dark:text-slate-300">WCAG 2.1 AA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">📦</span>
                <span className="text-slate-700 dark:text-slate-300">~40KB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-pink-500">🎨</span>
                <span className="text-slate-700 dark:text-slate-300">Themeable</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="https://www.npmjs.com/package/react-simile-timeline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Install from npm
              </a>
              <a
                href="https://github.com/thbst16/react-simile-timeline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Hero Timeline */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-xl" />
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedDemo === 'jfk' && 'JFK Timeline (1917-1963)'}
                    {selectedDemo === 'world-cup-2006' && 'FIFA World Cup 2006'}
                    {selectedDemo === 'world-history' && 'World History Timeline'}
                  </h3>

                  {/* Demo Timeline Selector */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        void handleDemoChange('world-history');
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        selectedDemo === 'world-history'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      📚 World History (21 events)
                    </button>
                    <button
                      onClick={() => {
                        void handleDemoChange('jfk');
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        selectedDemo === 'jfk'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      🎖️ JFK (32 events)
                    </button>
                    <button
                      onClick={() => {
                        void handleDemoChange('world-cup-2006');
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        selectedDemo === 'world-cup-2006'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      ⚽ World Cup (36 events)
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedDemo === 'jfk' && `Life and presidency of John F. Kennedy - from birth to legacy (${demoEvents.length} events loaded)`}
                  {selectedDemo === 'world-cup-2006' && `Complete tournament coverage from Germany - Italy's historic victory (${demoEvents.length} events loaded)`}
                  {selectedDemo === 'world-history' && `From ancient civilizations to modern technology - interactive historical events (${demoEvents.length} events loaded)`}
                </p>
              </div>
              <div className="h-[480px] overflow-hidden relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10">
                    <div className="text-slate-600 dark:text-slate-300">Loading timeline...</div>
                  </div>
                )}
                {/* Overview Band - Provides context and navigation */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                  <BandV3
                    key={`overview-${selectedDemo}-${demoEvents.length}`}
                    id="overview"
                    height={80}
                    ether={overviewEther}
                    events={demoEvents}
                    decorators={[]}
                    painterType="overview"
                    showTimescale={true}
                    onEventClick={handleEventClick}
                  />
                </div>
                {/* Detail Band - Main timeline view */}
                <div>
                  <BandV3
                    key={`detail-${selectedDemo}-${demoEvents.length}`}
                    id="detail"
                    height={detailBandHeight}
                    ether={detailEther}
                    events={demoEvents}
                    decorators={[]}
                    painterType="original"
                    showTimescale={true}
                    onEventClick={handleEventClick}
                  />
                </div>

                {/* Timeline Controls */}
                <TimelineControls
                  events={demoEvents}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Modern Features, Classic Compatibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Compatible */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                100% Compatible
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Load original Simile JSON files without modification. Drop-in replacement for legacy timelines.
              </p>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Simile JSON format • BCE dates • All painters
              </div>
            </div>

            {/* Feature 2: Performance */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                High Performance
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                60fps scrolling with 1000+ events. Virtualization and adaptive rendering for large datasets.
              </p>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                60fps scroll • 2000+ events • Canvas fallback
              </div>
            </div>

            {/* Feature 3: Accessible */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="text-4xl mb-4">♿</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Fully Accessible
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                WCAG 2.1 AA compliant with keyboard navigation and screen reader support.
              </p>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                WCAG 2.1 AA • Keyboard nav • Screen readers
              </div>
            </div>

            {/* Feature 4: Touch */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Touch-Friendly
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Full mobile support with touch gestures for panning and pinch-to-zoom.
              </p>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Pan • Pinch zoom • Tap to select
              </div>
            </div>

            {/* Feature 5: Themeable */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Beautiful Themes
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Classic vintage, modern dark, or auto. Try the theme switcher above to see all options.
              </p>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Vintage • Dark • Auto • WCAG AA compliant
              </div>
            </div>

            {/* Feature 6: TypeScript */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                TypeScript-First
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Full TypeScript support with comprehensive type definitions for type-safe development.
              </p>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Strict mode • Full types • IntelliSense
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Why Choose React Simile Timeline?
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Built for modern React applications while maintaining 100% compatibility with original SIMILE format
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Original SIMILE
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      React Simile
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Framework
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      jQuery
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      React 18+ ✓
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      TypeScript
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      ❌
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      Full Support ✓
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Mobile/Touch
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      Limited
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      Full Support ✓
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Performance
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      ~500 events
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      2000+ events ✓
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Accessibility
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      Basic
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      WCAG 2.1 AA ✓
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Bundle Size
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      ~200KB
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      ~40KB ✓
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Maintained
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      Archived (2009)
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      Active ✓
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Dark Mode
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                      ❌
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-medium">
                      Built-in ✓
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      JSON Compatibility
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-600 dark:text-green-400 font-medium">
                      ✓
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-600 dark:text-green-400 font-medium">
                      100% ✓
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Install Instructions */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Get Started in 60 Seconds
            </h3>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 max-w-2xl mx-auto text-left">
              <code className="text-sm text-green-400 font-mono">
                <div>npm install react-simile-timeline</div>
                <div className="mt-2 text-slate-400"># or</div>
                <div>yarn add react-simile-timeline</div>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Timeline?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join developers building modern timelines with React Simile Timeline
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.npmjs.com/package/react-simile-timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-xl"
            >
              Get Started
            </a>
            <a
              href="https://github.com/thbst16/react-simile-timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border border-white/30 text-lg font-medium rounded-md text-white hover:bg-white/10 transition-colors"
            >
              View Documentation
            </a>
          </div>
          <p className="mt-8 text-sm text-blue-200">
            v{packageJson.version} • MIT License © 2024-2025 • Open Source
          </p>
        </div>
      </section>

      {/* Event Bubble Modal */}
      {selectedEvent && (
        <EventBubble
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

/**
 * Main Export with Theme Provider
 */
export const LandingPage: React.FC = () => {
  return (
    <ThemeProvider defaultMode="auto">
      <LandingPageInner />
    </ThemeProvider>
  );
};
