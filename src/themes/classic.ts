/**
 * Classic Theme
 *
 * Pixel-perfect recreation of the original Simile Timeline theme.
 * Colors, fonts, and spacing match the original implementation.
 *
 * Sprint 5: Polish & Performance
 */

import type { TimelineTheme } from '../types/theme';

export const classicTheme: TimelineTheme = {
  name: 'Classic',
  id: 'classic',
  description: 'Original Simile Timeline theme',

  colors: {
    band: {
      background: '#f5f5f5',
      backgroundAlt: '#ffffff',
      border: '#aaa',
    },

    event: {
      // Original Simile colors
      tape: '#58a',
      tapeHover: '#7ac',
      tapeSelected: '#369',
      point: '#f00',
      pointHover: '#f33',
      pointSelected: '#c00',
      label: '#000',
      labelBackground: '#fff',
      icon: '#333',
      iconBackground: '#fff',
    },

    timescale: {
      background: '#f0f0f0',
      label: '#333',
      majorLine: '#aaa',
      minorLine: '#ddd',
      highlight: '#ffc',
    },

    decorator: {
      point: '#f00',
      span: '#ff9',
      label: '#333',
    },

    ui: {
      primary: '#58a',
      secondary: '#999',
      accent: '#f90',
      background: '#fff',
      surface: '#f5f5f5',
      border: '#ccc',
      text: '#000',
      textSecondary: '#666',
      success: '#5a5',
      warning: '#fa0',
      error: '#c33',
      info: '#58a',
    },

    highlight: {
      hover: 'rgba(88, 136, 170, 0.1)',
      active: 'rgba(88, 136, 170, 0.2)',
      focus: 'rgba(88, 136, 170, 0.3)',
      selected: 'rgba(51, 102, 153, 0.2)',
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
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      md: '0 2px 4px rgba(0, 0, 0, 0.1)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    blur: {
      sm: '2px',
      md: '4px',
      lg: '8px',
    },
    opacity: {
      disabled: 0.5,
      hover: 0.8,
      active: 0.9,
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
