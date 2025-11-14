/**
 * Theme Type Definitions
 *
 * Defines the complete theming system for the timeline.
 * Sprint 5: Polish & Performance
 */

export interface TimelineTheme {
  /** Theme metadata */
  name: string;
  id: string;
  description?: string;

  /** Color palette */
  colors: {
    /** Band background colors */
    band: {
      background: string;
      backgroundAlt: string; // For alternating bands
      border: string;
    };

    /** Event colors */
    event: {
      tape: string; // Default duration event color
      tapeHover: string;
      tapeSelected: string;
      point: string; // Default instant event color
      pointHover: string;
      pointSelected: string;
      label: string;
      labelBackground: string;
      icon: string;
      iconBackground: string;
    };

    /** Time scale colors */
    timescale: {
      background: string;
      label: string;
      majorLine: string;
      minorLine: string;
      highlight: string;
    };

    /** Decorator colors */
    decorator: {
      point: string;
      span: string;
      label: string;
    };

    /** UI element colors */
    ui: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      border: string;
      text: string;
      textSecondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };

    /** Highlight colors for interactions */
    highlight: {
      hover: string;
      active: string;
      focus: string;
      selected: string;
    };
  };

  /** Typography */
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  /** Spacing scale */
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };

  /** Event sizing */
  event: {
    tapeHeight: number;
    pointSize: number;
    iconSize: number;
    labelPadding: number;
    minTapeWidth: number;
  };

  /** Band configuration */
  band: {
    minHeight: number;
    trackHeight: number;
    trackGap: number;
    padding: number;
  };

  /** Timescale configuration */
  timescale: {
    height: number;
    padding: number;
    majorLineWidth: number;
    minorLineWidth: number;
  };

  /** Shadows and effects */
  effects: {
    shadow: {
      sm: string;
      md: string;
      lg: string;
    };
    blur: {
      sm: string;
      md: string;
      lg: string;
    };
    opacity: {
      disabled: number;
      hover: number;
      active: number;
    };
  };

  /** Animation settings */
  animation: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      default: string;
      enter: string;
      exit: string;
    };
  };

  /** Border radius */
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };

  /** Z-index layers */
  zIndex: {
    base: number;
    event: number;
    decorator: number;
    timescale: number;
    popup: number;
    overlay: number;
    modal: number;
  };

  /** Texture configuration (optional for vintage themes) */
  texture?: {
    enabled: boolean;
    pattern: string; // data URI
    opacity: number;
    blendMode: 'multiply' | 'overlay' | 'soft-light';
    size: number; // pattern size in px
  };
}

/**
 * Theme configuration for a specific component
 */
export interface ComponentTheme {
  colors?: Partial<TimelineTheme['colors']>;
  spacing?: Partial<TimelineTheme['spacing']>;
  typography?: Partial<TimelineTheme['typography']>;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme */
  theme: TimelineTheme;
  /** Current mode */
  mode: ThemeMode;
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Switch to specific theme */
  setTheme: (theme: TimelineTheme) => void;
  /** Available themes */
  availableThemes: TimelineTheme[];
}

/**
 * Custom theme override
 */
export type ThemeOverride = Partial<TimelineTheme>;

/**
 * Helper type for theme colors only
 */
export type ThemeColors = TimelineTheme['colors'];

/**
 * Helper type for theme typography only
 */
export type ThemeTypography = TimelineTheme['typography'];
