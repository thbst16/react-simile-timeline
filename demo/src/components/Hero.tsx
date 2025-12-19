import { useState } from 'react';

export function Hero() {
  const [copied, setCopied] = useState(false);
  const installCommand = 'npm install react-simile-timeline';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            v1.0.1 Released
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            <span className="block">Beautiful Interactive</span>
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Timeline Visualizations
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            A modern React implementation of the MIT SIMILE Timeline. Create stunning,
            interactive timelines with multiple bands, event markers, hot zones, and rich customization.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demos"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-600/25"
            >
              View Demos
            </a>
            <a
              href="https://github.com/thbst16/react-simile-timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg border border-gray-200 shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Star on GitHub
            </a>
          </div>

          {/* Install Command */}
          <div className="mt-12 max-w-xl mx-auto">
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl p-4 shadow-2xl">
              <span className="text-gray-500 select-none">$</span>
              <code className="flex-1 text-gray-100 font-mono text-sm sm:text-base">{installCommand}</code>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                title="Copy to clipboard"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              'TypeScript',
              'React 18 & 19',
              'Multi-Band',
              'Hot Zones',
              'Themes',
              'Accessible',
            ].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
