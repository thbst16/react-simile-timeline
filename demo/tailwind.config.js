/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  // daisyUI drives the whole site's look. `corporate` is the active theme;
  // `dark` is kept as the prefers-dark fallback. Swapping the site's style later
  // is a one-line change here (and the data-theme on the app root).
  daisyui: {
    themes: ['corporate', 'dark'],
    logs: false,
  },
};
