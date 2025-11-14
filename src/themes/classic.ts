/**
 * Classic Vintage Theme
 *
 * Vintage aged-paper aesthetic inspired by the original Simile Timeline.
 * Features warm sepia tones, serif typography, and subtle paper textures.
 *
 * Sprint 3: UI Themes, Demo Gallery & Migration Tools
 * Design Docs: CLASSIC_THEME_RESEARCH.md, CLASSIC_THEME_COLORS.md
 */

import type { TimelineTheme } from '../types/theme';

/**
 * Paper texture data URI (SVG fine grain pattern)
 * Subtle noise pattern for aged paper effect
 */
const PAPER_TEXTURE_FINE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Cfilter id="t"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4"/%3E%3CfeColorMatrix type="saturate" values="0.3"/%3E%3C/filter%3E%3Crect width="200" height="200" filter="url(%23t)" fill="%233d2817" opacity="0.05"/%3E%3C/svg%3E';

export const classicTheme: TimelineTheme = {
  name: 'Classic',
  id: 'classic',
  description: 'Vintage Simile Timeline with aged paper aesthetic',

  colors: {
    band: {
      background: '#f5f3e8', // Aged Cream
      backgroundAlt: '#e8e6d0', // Aged Parchment
      border: '#c8c2b0', // Light Sepia
    },

    event: {
      // Vintage sepia-toned colors
      tape: '#8b7355', // Sepia Brown
      tapeHover: '#a38669', // Lighter Sepia Brown
      tapeSelected: '#6d5c44', // Darker Sepia Brown
      point: '#a65a4a', // Terracotta
      pointHover: '#bf6d5d', // Light Terracotta
      pointSelected: '#8a4a3d', // Dark Terracotta
      label: '#3d2817', // Deep Brown
      labelBackground: '#faf9f0', // Light Parchment
      icon: '#5a4a3a', // Medium Brown
      iconBackground: '#f5f3e8', // Aged Cream
    },

    timescale: {
      background: '#e8e6d0', // Aged Parchment
      label: '#5a4a3a', // Medium Brown
      majorLine: '#a69d88', // Medium Sepia
      minorLine: '#c8c2b0', // Light Sepia
      highlight: '#f5edc8', // Pale Gold
    },

    decorator: {
      point: '#a65a4a', // Terracotta
      span: '#f5edc8', // Pale Gold
      label: '#5a4a3a', // Medium Brown
    },

    ui: {
      primary: '#8b7355', // Sepia Brown
      secondary: '#a69d88', // Medium Sepia
      accent: '#c9a961', // Antique Gold
      background: '#faf9f0', // Light Parchment
      surface: '#f5f3e8', // Aged Cream
      border: '#c8c2b0', // Light Sepia
      text: '#3d2817', // Deep Brown
      textSecondary: '#5a4a3a', // Medium Brown
      success: '#6b8e5f', // Sage Green
      warning: '#c9a961', // Antique Gold
      error: '#a65a4a', // Terracotta
      info: '#8b7355', // Sepia Brown
    },

    highlight: {
      hover: 'rgba(139, 115, 85, 0.1)', // Sepia Brown 10%
      active: 'rgba(139, 115, 85, 0.2)', // Sepia Brown 20%
      focus: 'rgba(201, 169, 97, 0.3)', // Antique Gold 30%
      selected: 'rgba(109, 92, 68, 0.15)', // Dark Sepia 15%
    },
  },

  typography: {
    fontFamily: 'Georgia, "Times New Roman", serif',
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
      // Warm brown shadows instead of black for vintage feel
      sm: '0 1px 2px rgba(61, 40, 23, 0.15)',
      md: '0 2px 4px rgba(61, 40, 23, 0.12)',
      lg: '0 4px 8px rgba(61, 40, 23, 0.1)',
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
    sm: 3, // Slightly rounded for vintage aesthetic
    md: 5,
    lg: 7,
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

  texture: {
    enabled: true,
    pattern: PAPER_TEXTURE_FINE,
    opacity: 0.05,
    blendMode: 'multiply',
    size: 200,
  },
};
