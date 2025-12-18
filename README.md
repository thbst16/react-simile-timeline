# React Simile Timeline

[![CI](https://github.com/thbst16/react-simile-timeline/actions/workflows/ci.yml/badge.svg)](https://github.com/thbst16/react-simile-timeline/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/react-simile-timeline.svg)](https://www.npmjs.com/package/react-simile-timeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern React implementation of the [MIT SIMILE Timeline](https://www.simile-widgets.org/timeline/) visualization component.

## Features

- 🎯 **100% Simile JSON Compatible** - Works with existing Simile Timeline data
- ⚡ **High Performance** - 60 FPS smooth scrolling and interactions
- 📱 **Modern React** - Built with React 18, TypeScript, and hooks
- 🎨 **Themeable** - Classic and dark themes, plus custom theme support
- ♿ **Accessible** - WCAG 2.1 compliant with keyboard navigation
- 📦 **Lightweight** - Tree-shakeable, minimal bundle size

## Installation

```bash
npm install react-simile-timeline
# or
pnpm add react-simile-timeline
# or
yarn add react-simile-timeline
```

## Quick Start

```tsx
import { Timeline } from 'react-simile-timeline';

function App() {
  return (
    <Timeline
      dataUrl="/api/events.json"
      height={400}
      onEventClick={(event) => console.log(event)}
    />
  );
}
```

Or with inline data:

```tsx
import { Timeline } from 'react-simile-timeline';

const data = {
  dateTimeFormat: 'iso8601',
  events: [
    {
      start: '2023-01-15',
      title: 'Project Started',
      description: 'Initial project kickoff',
      color: '#4a90d9',
    },
    {
      start: '2023-03-01',
      end: '2023-06-30',
      title: 'Development Phase',
      isDuration: true,
      color: '#6b8e5f',
    },
  ],
};

function App() {
  return <Timeline data={data} height={400} />;
}
```

## Documentation

- [API Reference](./docs/API.md)
- [Sprint Plan](./docs/SPRINT_PLAN.md)
- [Project Background](./project-background/project-background.md)

## Development

This project uses a pnpm monorepo structure:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build library
pnpm build:lib

# Run tests
pnpm test        # Unit tests (Vitest)
pnpm test:e2e    # E2E tests (Playwright)

# Code quality
pnpm lint
pnpm format
pnpm typecheck
```

## Project Structure

```
├── packages/
│   └── react-simile-timeline/   # NPM library
├── demo/                        # Demo application
├── docs/                        # Documentation
└── project-background/          # PRD and specifications
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

This project is a modern reimplementation of the original [MIT SIMILE Timeline](https://www.simile-widgets.org/timeline/) project.
