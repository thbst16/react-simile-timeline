import { useState } from 'react';
import { Timeline } from 'react-simile-timeline';
import type { TimelineData, BandConfig, Theme, HotZone } from 'react-simile-timeline';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { DemoSection } from './components/DemoSection';
import { CodeBlock } from './components/CodeBlock';

// ============================================================================
// Sample Data
// ============================================================================

const basicData: TimelineData = {
  dateTimeFormat: 'iso8601',
  events: [
    {
      start: '2024-01-15',
      title: 'Project Kickoff',
      description: 'Initial planning and team assembly.',
      color: '#3b82f6',
    },
    {
      start: '2024-02-01',
      end: '2024-03-15',
      title: 'Development Phase',
      description: 'Core feature implementation.',
      isDuration: true,
      color: '#10b981',
    },
    {
      start: '2024-03-20',
      title: 'Beta Release',
      description: 'Public beta launch.',
      color: '#f59e0b',
    },
    {
      start: '2024-04-01',
      title: 'Production Launch',
      description: 'Full production release.',
      color: '#ef4444',
    },
  ],
};

const hotZonesData: HotZone[] = [
  {
    start: '2024-02-01',
    end: '2024-03-15',
    color: 'rgba(16, 185, 129, 0.15)',
    annotation: 'Development Sprint',
  },
];

const customTheme: Theme = {
  name: 'ocean',
  backgroundColor: '#0f172a',
  eventColor: '#38bdf8',
  eventTextColor: '#e2e8f0',
  scaleColor: '#94a3b8',
  gridColor: '#334155',
  hotZoneColor: 'rgba(56, 189, 248, 0.1)',
};

const threeBandConfig: BandConfig[] = [
  { id: 'overview', height: '20%', timeUnit: 'year', intervalPixels: 100, overview: true, syncWith: 'main' },
  { id: 'main', height: '60%', timeUnit: 'month', intervalPixels: 80, overview: false },
  { id: 'detail', height: '20%', timeUnit: 'week', intervalPixels: 60, overview: true, syncWith: 'main' },
];

// ============================================================================
// Code Examples
// ============================================================================

const basicUsageCode = `import { Timeline } from 'react-simile-timeline';

const data = {
  dateTimeFormat: 'iso8601',
  events: [
    { start: '2024-01-15', title: 'Project Kickoff', color: '#3b82f6' },
    { start: '2024-02-01', end: '2024-03-15', title: 'Development', isDuration: true, color: '#10b981' },
    { start: '2024-03-20', title: 'Beta Release', color: '#f59e0b' },
    { start: '2024-04-01', title: 'Launch', color: '#ef4444' },
  ],
};

function App() {
  return <Timeline data={data} height={300} />;
}`;

const themingCode = `import { Timeline } from 'react-simile-timeline';
import type { Theme } from 'react-simile-timeline';

// Use built-in themes
<Timeline data={data} theme="dark" />
<Timeline data={data} theme="classic" />

// Or create a custom theme
const oceanTheme: Theme = {
  name: 'ocean',
  backgroundColor: '#0f172a',
  eventColor: '#38bdf8',
  eventTextColor: '#e2e8f0',
  scaleColor: '#94a3b8',
  gridColor: '#334155',
  hotZoneColor: 'rgba(56, 189, 248, 0.1)',
};

<Timeline data={data} theme={oceanTheme} />`;

const hotZonesCode = `import { Timeline } from 'react-simile-timeline';
import type { HotZone } from 'react-simile-timeline';

const hotZones: HotZone[] = [
  {
    start: '2024-02-01',
    end: '2024-03-15',
    color: 'rgba(16, 185, 129, 0.15)',
    annotation: 'Development Sprint',
  },
];

<Timeline
  data={data}
  hotZones={hotZones}
  height={300}
/>`;

const multiBandCode = `import { Timeline } from 'react-simile-timeline';
import type { BandConfig } from 'react-simile-timeline';

const bands: BandConfig[] = [
  { id: 'overview', height: '20%', timeUnit: 'year', intervalPixels: 100, overview: true, syncWith: 'main' },
  { id: 'main', height: '60%', timeUnit: 'month', intervalPixels: 80, overview: false },
  { id: 'detail', height: '20%', timeUnit: 'week', intervalPixels: 60, overview: true, syncWith: 'main' },
];

<Timeline
  dataUrl="/data/events.json"
  bands={bands}
  height={400}
/>`;

const installationCode = `# Using npm
npm install react-simile-timeline

# Using yarn
yarn add react-simile-timeline

# Using pnpm
pnpm add react-simile-timeline`;

const quickStartCode = `import { Timeline } from 'react-simile-timeline';
import 'react-simile-timeline/style.css';

function App() {
  const data = {
    dateTimeFormat: 'iso8601',
    events: [
      { start: '2024-01-01', title: 'New Year' },
      { start: '2024-07-04', title: 'Independence Day' },
      { start: '2024-12-25', title: 'Christmas' },
    ],
  };

  return (
    <Timeline
      data={data}
      height={300}
      theme="classic"
      onEventClick={(event) => console.log(event)}
    />
  );
}`;

// ============================================================================
// App Component
// ============================================================================

function App() {
  const [theme, setTheme] = useState<'classic' | 'dark' | Theme>('classic');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />

      {/* Demos Section */}
      <section id="demos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Interactive Demos</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the Timeline component with these live examples. Drag to pan, scroll to zoom, and click events for details.
            </p>
          </div>

          <div className="space-y-12">
            {/* Basic Usage */}
            <DemoSection
              title="Basic Usage"
              description="A simple timeline with point events and duration events. Drag to pan, scroll to zoom."
              code={basicUsageCode}
            >
              <Timeline data={basicData} height={280} />
            </DemoSection>

            {/* Theming */}
            <DemoSection
              title="Theming"
              description="Switch between built-in themes or create your own custom theme with full control over colors."
              code={themingCode}
            >
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setTheme('classic')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'classic' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme(customTheme)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    typeof theme === 'object' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Ocean (Custom)
                </button>
              </div>
              <Timeline data={basicData} height={280} theme={theme} />
            </DemoSection>

            {/* Hot Zones */}
            <DemoSection
              title="Hot Zones"
              description="Highlight important periods with colored background zones and annotations."
              code={hotZonesCode}
            >
              <Timeline data={basicData} hotZones={hotZonesData} height={280} />
            </DemoSection>

            {/* Multi-Band */}
            <DemoSection
              title="Multi-Band Timeline"
              description="Configure multiple synchronized bands with different time scales for overview and detail views."
              code={multiBandCode}
            >
              <Timeline
                dataUrl="/data/world-wars-timeline.json"
                bands={threeBandConfig}
                height={400}
                centerDate="1939-09-01"
              />
            </DemoSection>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get Started</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Install the package and start building beautiful timelines in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Install the package</h3>
              <CodeBlock code={installationCode} language="bash" title="Installation Commands" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Import and use</h3>
              <CodeBlock code={quickStartCode} language="tsx" title="Quick Start Example" />
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">API Reference</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Full TypeScript support with comprehensive prop types.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Prop</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">data</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">TimelineData</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Inline timeline data object</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">dataUrl</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">string</td>
                    <td className="px-6 py-4 text-sm text-gray-600">URL to fetch timeline JSON data</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">height</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">number</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Timeline height in pixels</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">bands</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">BandConfig[]</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Custom band configuration</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">theme</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">'classic' | 'dark' | Theme</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Built-in or custom theme</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">hotZones</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">HotZone[]</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Highlighted time periods</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">centerDate</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">string</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Date to center the view on</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">onEventClick</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">(event) =&gt; void</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Event click callback</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">branding</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">boolean | BrandingConfig</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Show branding watermark</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <a
                href="https://github.com/thbst16/react-simile-timeline#api-reference"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                View full API documentation on GitHub
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to build amazing timelines?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Get started with React Simile Timeline today. It's free, open source, and ready for production.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/thbst16/react-simile-timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              View on GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/react-simile-timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors font-semibold text-lg border border-blue-500"
            >
              npm install react-simile-timeline
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
