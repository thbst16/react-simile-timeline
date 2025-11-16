/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Simile Timeline classic theme colors
        timeline: {
          bg: '#f0f0f0',
          border: '#aaa',
          text: '#222',
          event: {
            tape: '#58A0DC',
            label: '#fff',
            duration: {
              start: '#3366CC',
              end: '#6699FF',
            },
          },
          band: {
            bg: '#fff',
            highlight: '#ffc',
          },
          ether: {
            line: '#ddd',
            text: '#999',
          },
        },
      },
      fontFamily: {
        timeline: ['Trebuchet MS', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'timeline-xs': '0.625rem',   // 10px
        'timeline-sm': '0.6875rem',  // 11px
        'timeline-base': '0.75rem',  // 12px
        'timeline-lg': '0.875rem',   // 14px
      },
      spacing: {
        'timeline-gap': '2px',
        'timeline-padding': '4px',
      },
      zIndex: {
        'timeline-ether': '1',
        'timeline-events': '10',
        'timeline-highlight': '20',
        'timeline-bubble': '1000',
      },
    },
  },
  plugins: [],
}
