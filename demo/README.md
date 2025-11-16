# React Simile Timeline - Demo

This demo application shows how to use the `react-simile-timeline` npm package in your own React project.

## Key Points

- **Imports from npm**: This demo imports from `react-simile-timeline` package, not internal source files
- **Real-world example**: Shows exactly how developers will use the library
- **Production-ready**: Uses the published v1.0.0 package from npm

## Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Code Structure

```
demo/
├── src/
│   ├── components/
│   │   └── LandingPage.tsx    # Main demo component
│   ├── App.tsx                # App entry point
│   ├── main.tsx               # React DOM entry
│   └── index.css              # Styles
├── public/
│   └── demo-data/             # Timeline JSON files
├── package.json               # Dependencies (includes react-simile-timeline)
└── vite.config.ts             # Vite configuration
```

## Usage Example

```tsx
import { Timeline, ThemeProvider } from 'react-simile-timeline';

function MyTimeline() {
  const events = [
    {
      title: 'My Event',
      start: '2024-01-01',
      description: 'Event description'
    }
  ];

  const bands = [
    {
      width: '70%',
      intervalUnit: 'MONTH',
      intervalPixels: 100
    }
  ];

  return (
    <ThemeProvider>
      <Timeline
        data={events}
        bands={bands}
        width="100%"
        height={600}
      />
    </ThemeProvider>
  );
}
```

## Learn More

- **Documentation**: https://github.com/thbst16/react-simile-timeline/tree/main/docs
- **npm Package**: https://www.npmjs.com/package/react-simile-timeline
- **Live Demo**: https://react-simile-timeline.vercel.app
