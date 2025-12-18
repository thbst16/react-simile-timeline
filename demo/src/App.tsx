import { Timeline } from 'react-simile-timeline';
import type { TimelineData, TimelineEvent, HotZone, BandConfig } from 'react-simile-timeline';

// Sample data for demonstration
const sampleData: TimelineData = {
  dateTimeFormat: 'iso8601',
  events: [
    {
      start: '1917-05-29',
      title: 'Birth of John F. Kennedy',
      description: 'John Fitzgerald Kennedy born in Brookline, Massachusetts.',
      color: '#8b7355',
    },
    {
      start: '1960-11-08',
      title: 'JFK Elected President',
      description: 'Kennedy defeats Richard Nixon in the presidential election.',
      color: '#4a90d9',
    },
    {
      start: '1961-01-20',
      end: '1963-11-22',
      title: 'Kennedy Presidency',
      description: 'John F. Kennedy serves as 35th President of the United States.',
      isDuration: true,
      color: '#6b8e5f',
    },
    {
      start: '1963-11-22',
      title: 'JFK Assassination',
      description: 'President Kennedy assassinated in Dallas, Texas.',
      color: '#c41e3a',
    },
  ],
};

// Hot zones to highlight key periods
const sampleHotZones: HotZone[] = [
  {
    start: '1961-01-20',
    end: '1963-11-22',
    color: 'rgba(107, 142, 95, 0.15)',
    annotation: 'Kennedy Presidency',
  },
  {
    start: '1962-10-16',
    end: '1962-10-28',
    color: 'rgba(255, 100, 100, 0.25)',
    annotation: 'Cuban Missile Crisis',
  },
];

// Three-band configuration for World Wars timeline
const threeBandConfig: BandConfig[] = [
  {
    id: 'decade-overview',
    height: '15%',
    timeUnit: 'decade',
    intervalPixels: 80,
    overview: true,
    syncWith: 'main',
    showEventLabels: false,
  },
  {
    id: 'main',
    height: '60%',
    timeUnit: 'year',
    intervalPixels: 60,
    overview: false,
    showEventLabels: true,
    trackHeight: 22,
    trackGap: 3,
  },
  {
    id: 'month-detail',
    height: '25%',
    timeUnit: 'month',
    intervalPixels: 30,
    overview: true,
    syncWith: 'main',
    showEventLabels: false,
  },
];

// Hot zones for World Wars timeline
const worldWarsHotZones: HotZone[] = [
  {
    start: '1914-07-28',
    end: '1918-11-11',
    color: 'rgba(139, 0, 0, 0.12)',
    annotation: 'World War I',
  },
  {
    start: '1929-10-29',
    end: '1939-09-01',
    color: 'rgba(74, 74, 74, 0.12)',
    annotation: 'Great Depression',
  },
  {
    start: '1939-09-01',
    end: '1945-09-02',
    color: 'rgba(0, 0, 128, 0.12)',
    annotation: 'World War II',
  },
];

function App() {
  const handleEventClick = (event: TimelineEvent) => {
    console.log('Event clicked:', event);
    // Note: The timeline's built-in popup shows event details
    // This callback can be used for additional custom behavior
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            React Simile Timeline
          </h1>
          <p className="mt-2 text-gray-600">
            A modern React implementation of the MIT SIMILE Timeline visualization
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            JFK Timeline Demo
          </h2>
          <p className="text-gray-600 mb-6">
            This demo showcases the Timeline component with sample data from the
            life of John F. Kennedy. Drag to pan, click events for details.
          </p>

          {/* Timeline component from the library */}
          <Timeline
            data={sampleData}
            hotZones={sampleHotZones}
            height={300}
            centerDate="1960-11-08"
            onEventClick={handleEventClick}
          />
        </section>

        {/* URL Data Source Demo */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            URL Data Source Demo
          </h2>
          <p className="text-gray-600 mb-6">
            This demo loads timeline data from a JSON file URL.
          </p>

          <Timeline
            dataUrl="/data/jfk-timeline.json"
            height={350}
            centerDate="1962-10-22"
            onEventClick={handleEventClick}
          />
        </section>

        {/* Three-Band World Wars Demo */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Three-Band Timeline: World Wars Era (1914-1945)
          </h2>
          <p className="text-gray-600 mb-6">
            A comprehensive timeline featuring 153 events across World War I, the Great Depression,
            and World War II. Uses three synchronized bands: decade overview (top),
            year-scale detail (middle), and month-scale detail (bottom). Scroll to zoom, drag to pan.
          </p>

          <Timeline
            dataUrl="/data/world-wars-timeline.json"
            bands={threeBandConfig}
            hotZones={worldWarsHotZones}
            height={500}
            centerDate="1939-09-01"
            onEventClick={handleEventClick}
          />
        </section>

        {/* Info section */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            About This Project
          </h3>
          <p className="text-blue-700 mb-4">
            React Simile Timeline features:
          </p>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Multi-band synchronized timeline (2, 3, or more bands)</li>
            <li>Horizontal pan with drag interaction</li>
            <li>Mouse wheel zoom with dynamic scale adjustment</li>
            <li>Point events (dots) and duration events (tapes)</li>
            <li>Hot zones with highlighted regions and annotations</li>
            <li>Smart label layout to prevent overlap</li>
            <li>Event click popups with details</li>
            <li>Keyboard navigation (arrows to pan, +/- to zoom)</li>
            <li>100% Simile JSON compatibility</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            React Simile Timeline - Open Source MIT License
          </p>
          <p className="text-gray-500 text-sm mt-2">
            <a
              href="https://github.com/thbst16/react-simile-timeline"
              className="hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {' | '}
            <a
              href="https://www.npmjs.com/package/react-simile-timeline"
              className="hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              NPM
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
