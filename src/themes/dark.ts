/**
 * Dark Theme
 *
 * Modern dark mode theme with high contrast and eye-friendly colors.
 * Optimized for low-light environments.
 *
 * Sprint 5: Polish & Performance
 */

import type { TimelineTheme } from '../types/theme';

export const darkTheme: TimelineTheme = {
  name: 'Dark',
  id: 'dark',
  description: 'Dark mode theme for low-light environments',

  colors: {
    band: {
      background: '#1a1a1a',
      backgroundAlt: '#242424',
      border: '#404040',
    },

    event: {
      tape: '#6b9bd1',
      tapeHover: '#8bb4e6',
      tapeSelected: '#4a7ab8',
      point: '#ff6b6b',
      pointHover: '#ff8787',
      pointSelected: '#ee5555',
      label: '#e0e0e0',
      labelBackground: '#2a2a2a',
      icon: '#b0b0b0',
      iconBackground: '#2a2a2a',
    },

    timescale: {
      background: '#212121',
      label: '#b0b0b0',
      majorLine: '#505050',
      minorLine: '#353535',
      highlight: '#3a3a2a',
    },

    decorator: {
      point: '#ff6b6b',
      span: '#4a4a2a',
      label: '#b0b0b0',
    },

    ui: {
      primary: '#6b9bd1',
      secondary: '#808080',
      accent: '#ffa947',
      background: '#121212',
      surface: '#1e1e1e',
      border: '#404040',
      text: '#e0e0e0',
      textSecondary: '#9e9e9e',
      success: '#6fbf73',
      warning: '#ffb74d',
      error: '#f44336',
      info: '#64b5f6',
    },

    highlight: {
      hover: 'rgba(107, 155, 209, 0.15)',
      active: 'rgba(107, 155, 209, 0.25)',
      focus: 'rgba(107, 155, 209, 0.35)',
      selected: 'rgba(74, 122, 184, 0.3)',
    },
  },

  typography: {
    fontFamily: 'Trebuchet MS, Helvetica, Arial, sans-serif',
    fontSize: {
      xs: '10px',
      sm: '11px',
      base: '12px',
      lg: '14px',
      xl: '16px',
      '2xl': '20px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
  },

  event: {
    tapeHeight: 14,
    pointSize: 6,
    iconSize: 16,
    labelPadding: 4,
    minTapeWidth: 20,
  },

  band: {
    minHeight: 80,
    trackHeight: 20,
    trackGap: 2,
    padding: 8,
  },

  timescale: {
    height: 24,
    padding: 4,
    majorLineWidth: 1,
    minorLineWidth: 1,
  },

  effects: {
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 2px 4px rgba(0, 0, 0, 0.3)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
    blur: {
      sm: '2px',
      md: '4px',
      lg: '8px',
    },
    opacity: {
      disabled: 0.4,
      hover: 0.7,
      active: 0.85,
    },
  },

  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enter: 'cubic-bezier(0, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },

  borderRadius: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 6,
    full: 9999,
  },

  zIndex: {
    base: 1,
    event: 10,
    decorator: 5,
    timescale: 20,
    popup: 100,
    overlay: 200,
    modal: 300,
  },
};
