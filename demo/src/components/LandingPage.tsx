/**
 * Landing Page Component - Demo for React Simile Timeline
 *
 * This demo imports from the published npm package 'react-simile-timeline'
 * to show developers how to use the library in their own projects.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Timeline,
  ThemeProvider,
  useTheme,
} from 'react-simile-timeline';

// Simple theme switcher component for demo
function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <button
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {mode === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

type DemoTimeline = 'world-history' | 'jfk' | 'world-cup-2006';

// Simple world history events for demo
const heroEvents: TimelineEvent[] = [
  {
    title: 'Bronze Age',
    start: '-3000',
    description: 'Beginning of Bronze Age civilizations',
    isDuration: false,
  },
  {
    title: 'Iron Age',
    start: '-1200',
    description: 'Start of Iron Age',
    isDuration: false,
  },
  {
    title: 'Classical Greece',
    start: '-500',
    description: 'Golden Age of Athens',
    isDuration: false,
  },
  {
    title: 'Roman Empire',
    start: '-27',
    description: 'Augustus becomes first Roman Emperor',
    isDuration: false,
  },
  {
    title: 'Middle Ages',
    start: '500',
    description: 'Medieval period begins',
    isDuration: false,
  },
  {
    title: 'Renaissance',
    start: '1400',
    description: 'Cultural rebirth in Europe',
    isDuration: false,
  },
  {
    title: 'Industrial Revolution',
    start: '1760',
    description: 'Beginning of industrialization',
    isDuration: false,
  },
  {
    title: 'World War I',
    start: '1914',
    end: '1918',
    description: 'The Great War',
    isDuration: true,
  },
  {
    title: 'World War II',
    start: '1939',
    end: '1945',
    description: 'Global conflict',
    isDuration: true,
  },
  {
    title: 'Digital Age',
    start: '2000',
    description: 'Internet era begins',
    isDuration: false,
  },
];

const LandingPageInner: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<DemoTimeline>('jfk');
  const [dataUrl, setDataUrl] = useState<string>('/demo-data/jfk-timeline.json');

  // Update data URL when selection changes
  useEffect(() => {
    switch (selectedDemo) {
      case 'jfk':
        setDataUrl('/demo-data/jfk-timeline.json');
        break;
      case 'world-cup-2006':
        setDataUrl('/demo-data/world-cup-2006.json');
        break;
      case 'world-history':
      default:
        setDataUrl('/demo-data/jfk-timeline.json'); // Use JFK as default since we don't have world history JSON
        break;
    }
  }, [selectedDemo]);

  // Configure bands based on selected timeline
  const bands = useMemo(() => {
    switch (selectedDemo) {
      case 'world-cup-2006':
        return [
          {
            width: '70%',
            intervalUnit: 'DAY' as const,
            intervalPixels: 80,
          },
          {
            width: '30%',
            intervalUnit: 'WEEK' as const,
            intervalPixels: 100,
            syncWith: 0,
            highlight: true,
          },
        ];
      case 'jfk':
        return [
          {
            width: '70%',
            intervalUnit: 'MONTH' as const,
            intervalPixels: 30,
          },
          {
            width: '30%',
            intervalUnit: 'YEAR' as const,
            intervalPixels: 200,
            syncWith: 0,
            highlight: true,
          },
        ];
      case 'world-history':
      default:
        return [
          {
            width: '70%',
            intervalUnit: 'YEAR' as const,
            intervalPixels: 100,
          },
          {
            width: '30%',
            intervalUnit: 'DECADE' as const,
            intervalPixels: 100,
            syncWith: 0,
            highlight: true,
          },
        ];
    }
  }, [selectedDemo]);

  // Reset handler - simply reload by changing key
  const [resetKey, setResetKey] = useState(0);
  const handleReset = useCallback(() => {
    setResetKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                React Simile Timeline
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Modern React port of MIT's Simile Timeline • v1.0.0
              </p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Demo Selector */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Demo Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedDemo('world-history')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDemo === 'world-history'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                🌍 World History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                10 major events spanning 5,000 years
              </p>
            </button>
            <button
              onClick={() => setSelectedDemo('jfk')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDemo === 'jfk'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                🇺🇸 JFK Assassination
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                32 events from JFK's life and death
              </p>
            </button>
            <button
              onClick={() => setSelectedDemo('world-cup-2006')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDemo === 'world-cup-2006'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                ⚽ World Cup 2006
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                48 events from Germany tournament
              </p>
            </button>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <Timeline
            key={resetKey}
            dataUrl={dataUrl}
            width="100%"
            height={600}
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎯 100% JSON Compatible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Load original Simile timeline data without modification
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ⚡ High Performance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              60fps scrolling with 1000+ events using virtualization
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ♿ WCAG 2.1 AA
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Full keyboard navigation and screen reader support
            </p>
          </div>
        </div>
      </div>

      {/* Installation */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Installation
          </h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>npm install react-simile-timeline</code>
          </pre>
          <div className="mt-4 space-y-2">
            <a
              href="https://github.com/thbst16/react-simile-timeline"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              📖 Documentation
            </a>
            {' • '}
            <a
              href="https://www.npmjs.com/package/react-simile-timeline"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              📦 npm Package
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export function LandingPage(): JSX.Element {
  return (
    <ThemeProvider>
      <LandingPageInner />
    </ThemeProvider>
  );
}
