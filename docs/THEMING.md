# Theming Guide - React Simile Timeline

**Version**: v1.0.0
**Last Updated**: 2025-11-16
**Status**: API Frozen (no breaking changes until v2.0)

---

## Overview

React Simile Timeline includes a comprehensive theming system that allows you to customize every visual aspect of your timeline. The theme API is **frozen in v1.0** and will remain stable until v2.0.

**Features**:
- ✅ 2 built-in themes (Classic Vintage, Dark Mode)
- ✅ Auto theme (system preference detection)
- ✅ Theme persistence (localStorage)
- ✅ Full TypeScript support
- ✅ Custom theme creation
- ✅ Runtime theme switching
- ✅ Theme provider context

---

## Quick Start

### 1. Using Built-in Themes

```tsx
import { Timeline, ThemeProvider, ThemeSwitcher } from 'react-simile-timeline';

function App() {
  return (
    <ThemeProvider>
      {/* Theme switcher UI */}
      <ThemeSwitcher />

      {/* Your timeline */}
      <Timeline data={events} bands={bands} />
    </ThemeProvider>
  );
}
```

### 2. Programmatic Theme Control

```tsx
import { useTheme } from 'react-simile-timeline';

function MyComponent() {
  const { theme, mode, setMode } = useTheme();

  return (
    <div>
      <p>Current theme: {theme.name}</p>
      <p>Current mode: {mode}</p>

      <button onClick={() => setMode('light')}>Classic</button>
      <button onClick={() => setMode('dark')}>Dark</button>
      <button onClick={() => setMode('auto')}>Auto</button>
    </div>
  );
}
```

---

## Built-in Themes

### Classic Vintage Theme

Vintage aged-paper aesthetic inspired by the original Simile Timeline.

**Characteristics**:
- Warm sepia tones
- Serif typography (Georgia)
- Subtle paper texture
- Aged parchment background
- Terracotta and gold accents

**Usage**:
```tsx
import { ThemeProvider } from 'react-simile-timeline';

<ThemeProvider defaultMode="light">
  <Timeline {...props} />
</ThemeProvider>
```

**Colors**:
```typescript
{
  event: {
    tape: '#8b7355',        // Sepia Brown
    point: '#a65a4a',       // Terracotta
    label: '#3d2817',       // Deep Brown
  },
  ui: {
    background: '#faf9f0',  // Light Parchment
    primary: '#8b7355',     // Sepia Brown
    accent: '#c9a961',      // Antique Gold
  }
}
```

### Dark Mode Theme

Modern dark theme for reduced eye strain.

**Characteristics**:
- Deep charcoal background
- Sans-serif typography
- High contrast labels
- Blue accents
- Reduced glare

**Usage**:
```tsx
import { ThemeProvider } from 'react-simile-timeline';

<ThemeProvider defaultMode="dark">
  <Timeline {...props} />
</ThemeProvider>
```

**Colors**:
```typescript
{
  event: {
    tape: '#3b82f6',        // Blue
    point: '#ef4444',       // Red
    label: '#f3f4f6',       // Light Gray
  },
  ui: {
    background: '#0f172a',  // Dark Slate
    primary: '#3b82f6',     // Blue
    accent: '#8b5cf6',      // Purple
  }
}
```

### Auto Theme (System Preference)

Automatically switches based on user's system preference.

**Usage**:
```tsx
<ThemeProvider defaultMode="auto">
  <Timeline {...props} />
</ThemeProvider>
```

**Behavior**:
- Uses `prefers-color-scheme` media query
- Automatically updates when system preference changes
- Falls back to Classic theme if preference unavailable

---

## Theme API Reference

### TimelineTheme Interface

Complete type definition (frozen in v1.0):

```typescript
interface TimelineTheme {
  // Metadata
  name: string;
  id: string;
  description?: string;

  // Color system
  colors: {
    band: {
      background: string;
      backgroundAlt: string;
      border: string;
    };

    event: {
      tape: string;
      tapeHover: string;
      tapeSelected: string;
      point: string;
      pointHover: string;
      pointSelected: string;
      label: string;
      labelBackground: string;
      icon: string;
      iconBackground: string;
    };

    timescale: {
      background: string;
      label: string;
      majorLine: string;
      minorLine: string;
      highlight: string;
    };

    decorator: {
      point: string;
      span: string;
      label: string;
    };

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

    highlight: {
      hover: string;
      active: string;
      focus: string;
      selected: string;
    };
  };

  // Typography
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

  // Spacing scale
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };

  // Event sizing
  event: {
    tapeHeight: number;
    pointSize: number;
    iconSize: number;
    labelPadding: number;
    labelGap: number;
  };

  // Band configuration
  band: {
    height: number;
    padding: number;
    gap: number;
  };

  // Timescale settings
  timescale: {
    height: number;
    labelPadding: number;
    majorLineWidth: number;
    minorLineWidth: number;
  };

  // Visual effects
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
      inactive: number;
    };
  };

  // Animations
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

  // Border radii
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };

  // Z-index layering
  zIndex: {
    base: number;
    band: number;
    event: number;
    bubble: number;
    overlay: number;
  };

  // Optional texture (for vintage themes)
  texture?: {
    paper: string;      // Data URI or URL
    opacity: number;    // 0-1
  };
}
```

---

## Creating Custom Themes

### Basic Custom Theme

```typescript
import type { TimelineTheme } from 'react-simile-timeline';

export const myCustomTheme: TimelineTheme = {
  name: 'My Custom Theme',
  id: 'custom',
  description: 'A beautiful custom theme',

  colors: {
    band: {
      background: '#ffffff',
      backgroundAlt: '#f5f5f5',
      border: '#e0e0e0',
    },

    event: {
      tape: '#2196f3',
      tapeHover: '#42a5f5',
      tapeSelected: '#1976d2',
      point: '#f44336',
      pointHover: '#ef5350',
      pointSelected: '#d32f2f',
      label: '#212121',
      labelBackground: '#ffffff',
      icon: '#757575',
      iconBackground: '#f5f5f5',
    },

    timescale: {
      background: '#fafafa',
      label: '#616161',
      majorLine: '#9e9e9e',
      minorLine: '#e0e0e0',
      highlight: '#fff9c4',
    },

    decorator: {
      point: '#ff9800',
      span: '#fff9c4',
      label: '#616161',
    },

    ui: {
      primary: '#2196f3',
      secondary: '#757575',
      accent: '#ff9800',
      background: '#ffffff',
      surface: '#f5f5f5',
      border: '#e0e0e0',
      text: '#212121',
      textSecondary: '#757575',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },

    highlight: {
      hover: 'rgba(33, 150, 243, 0.08)',
      active: 'rgba(33, 150, 243, 0.16)',
      focus: 'rgba(255, 152, 0, 0.24)',
      selected: 'rgba(33, 150, 243, 0.12)',
    },
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '10px',
      sm: '11px',
      base: '13px',
      lg: '15px',
      xl: '18px',
      '2xl': '22px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },

  event: {
    tapeHeight: 20,
    pointSize: 12,
    iconSize: 24,
    labelPadding: 8,
    labelGap: 6,
  },

  band: {
    height: 120,
    padding: 16,
    gap: 8,
  },

  timescale: {
    height: 32,
    labelPadding: 8,
    majorLineWidth: 2,
    minorLineWidth: 1,
  },

  effects: {
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.15)',
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
    },
    opacity: {
      disabled: 0.4,
      inactive: 0.6,
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
    sm: '2px',
    md: '4px',
    lg: '8px',
    full: '9999px',
  },

  zIndex: {
    base: 0,
    band: 10,
    event: 20,
    bubble: 30,
    overlay: 40,
  },
};
```

### Using Custom Theme

```tsx
import { ThemeProvider } from 'react-simile-timeline';
import { myCustomTheme } from './themes';

<ThemeProvider defaultTheme={myCustomTheme}>
  <Timeline {...props} />
</ThemeProvider>
```

---

## Theme Utilities

### useTheme Hook

Access and control theme from any component:

```tsx
import { useTheme } from 'react-simile-timeline';

function MyComponent() {
  const {
    theme,      // Current TimelineTheme object
    mode,       // 'light' | 'dark' | 'auto'
    setMode,    // Function to change mode
    setTheme,   // Function to set custom theme
  } = useTheme();

  return (
    <div style={{ color: theme.colors.ui.text }}>
      <h1>Current Theme: {theme.name}</h1>

      <button onClick={() => setMode('light')}>Light</button>
      <button onClick={() => setMode('dark')}>Dark</button>
      <button onClick={() => setMode('auto')}>Auto</button>
    </div>
  );
}
```

### ThemeProvider Component

Wrap your app to provide theme context:

```tsx
import { ThemeProvider } from 'react-simile-timeline';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;        // 'light' | 'dark' | 'auto'
  defaultTheme?: TimelineTheme;   // Custom theme
  persist?: boolean;              // Save to localStorage (default: true)
}

// Example
<ThemeProvider
  defaultMode="auto"
  persist={true}
>
  <App />
</ThemeProvider>
```

### ThemeSwitcher Component

Pre-built theme switcher UI:

```tsx
import { ThemeSwitcher } from 'react-simile-timeline';

// Renders button group with icons:
// 🎨 Classic Vintage
// 🌙 Dark Mode
// ✨ Auto (System)

<ThemeSwitcher />
```

---

## Advanced Theming

### Theme with Texture

Add texture overlay (like aged paper):

```typescript
export const vintageTheme: TimelineTheme = {
  // ... other properties

  texture: {
    paper: 'data:image/svg+xml,%3Csvg...%3E', // SVG texture
    opacity: 0.05, // Subtle overlay
  },
};
```

### Dynamic Theme Generation

Create themes programmatically:

```typescript
function createTheme(primaryColor: string): TimelineTheme {
  return {
    name: `${primaryColor} Theme`,
    id: `theme-${primaryColor}`,
    colors: {
      ui: {
        primary: primaryColor,
        // ... generate other colors based on primary
      },
      // ... other colors
    },
    // ... other properties
  };
}

const blueTheme = createTheme('#2196f3');
const greenTheme = createTheme('#4caf50');
```

### Theme Variants

Create light/dark variants of custom theme:

```typescript
const baseTheme = { /* ... */ };

export const myThemeLight: TimelineTheme = {
  ...baseTheme,
  name: 'My Theme (Light)',
  id: 'mytheme-light',
  colors: {
    ...baseTheme.colors,
    ui: {
      ...baseTheme.colors.ui,
      background: '#ffffff',
      text: '#000000',
    },
  },
};

export const myThemeDark: TimelineTheme = {
  ...baseTheme,
  name: 'My Theme (Dark)',
  id: 'mytheme-dark',
  colors: {
    ...baseTheme.colors,
    ui: {
      ...baseTheme.colors.ui,
      background: '#000000',
      text: '#ffffff',
    },
  },
};
```

---

## Accessibility

### Color Contrast

Ensure WCAG 2.1 AA compliance:

```typescript
import { getContrastRatio, meetsWCAGAA } from 'react-simile-timeline';

const textColor = '#212121';
const bgColor = '#ffffff';

const ratio = getContrastRatio(textColor, bgColor);
// Returns: 16.1 (excellent!)

const isAccessible = meetsWCAGAA(ratio);
// Returns: true

// Minimum ratios:
// - Normal text: 4.5:1
// - Large text: 3:1
// - UI components: 3:1
```

### Testing Theme Accessibility

```tsx
import { useAccessibility } from 'react-simile-timeline';

function ThemeAccessibilityChecker() {
  const { theme } = useTheme();
  const { runAudit } = useAccessibility({ theme });

  const results = runAudit();

  return (
    <div>
      <h2>Accessibility: {results.complianceLevel}</h2>
      {results.contrast.map(check => (
        <div key={check.id}>
          {check.passed ? '✓' : '✗'} {check.description}
          <span>Ratio: {check.ratio.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 1. Color System

Use semantic color names:

```typescript
// ✅ GOOD: Semantic names
colors: {
  ui: {
    primary: '#2196f3',
    success: '#4caf50',
    error: '#f44336',
  }
}

// ❌ BAD: Generic names
colors: {
  ui: {
    blue: '#2196f3',
    green: '#4caf50',
    red: '#f44336',
  }
}
```

### 2. Spacing Scale

Use consistent spacing scale:

```typescript
// ✅ GOOD: Powers of 2 or Fibonacci
spacing: {
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 16,  // 16px
  lg: 24,  // 24px
  xl: 32,  // 32px
  '2xl': 48, // 48px
}

// ❌ BAD: Random values
spacing: {
  xs: 3,
  sm: 7,
  md: 15,
  lg: 23,
}
```

### 3. Typography

Limit font families:

```typescript
// ✅ GOOD: System font stack
fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

// ❌ BAD: Too many fonts
fontFamily: '"Custom Font", "Backup Font", "Another Font", ...'
```

### 4. Animation

Keep animations subtle:

```typescript
// ✅ GOOD: Fast, smooth animations
animation: {
  duration: {
    fast: 150,    // Hover states
    normal: 300,  // Transitions
    slow: 500,    // Complex animations
  }
}

// ❌ BAD: Too slow
animation: {
  duration: {
    fast: 500,
    normal: 1000,
    slow: 2000,
  }
}
```

---

## Theme Examples

### Minimal Modern Theme

```typescript
export const minimalTheme: TimelineTheme = {
  name: 'Minimal',
  id: 'minimal',

  colors: {
    event: {
      tape: '#000000',
      point: '#000000',
      label: '#000000',
    },
    ui: {
      background: '#ffffff',
      primary: '#000000',
      border: '#e0e0e0',
    },
  },

  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
  },

  borderRadius: {
    sm: '0px',
    md: '0px',
    lg: '0px',
  },
};
```

### High Contrast Theme

```typescript
export const highContrastTheme: TimelineTheme = {
  name: 'High Contrast',
  id: 'high-contrast',

  colors: {
    event: {
      tape: '#000000',
      point: '#ffffff',
      label: '#ffffff',
      labelBackground: '#000000',
    },
    ui: {
      background: '#000000',
      text: '#ffffff',
      border: '#ffffff',
      primary: '#ffff00', // High contrast yellow
    },
  },
};
```

### Pastel Theme

```typescript
export const pastelTheme: TimelineTheme = {
  name: 'Pastel',
  id: 'pastel',

  colors: {
    event: {
      tape: '#a8dadc',      // Pastel Blue
      point: '#f1faee',     // Pastel White
      label: '#1d3557',     // Dark Blue
    },
    ui: {
      background: '#f1faee', // Off-white
      primary: '#457b9d',    // Medium Blue
      accent: '#e63946',     // Coral
      success: '#06d6a0',    // Mint
    },
  },
};
```

---

## Troubleshooting

### Theme Not Applying

**Problem**: Custom theme not visible

**Solution**: Ensure ThemeProvider wraps Timeline:

```tsx
// ✅ CORRECT
<ThemeProvider>
  <Timeline {...props} />
</ThemeProvider>

// ❌ WRONG
<Timeline {...props} />
<ThemeProvider /> // Too late!
```

### Theme Persistence Not Working

**Problem**: Theme resets on page reload

**Solution**: Enable persistence:

```tsx
<ThemeProvider persist={true}>
  <Timeline {...props} />
</ThemeProvider>
```

### Type Errors with Custom Theme

**Problem**: TypeScript errors with custom theme

**Solution**: Import and use `TimelineTheme` type:

```typescript
import type { TimelineTheme } from 'react-simile-timeline';

const myTheme: TimelineTheme = { /* ... */ };
```

---

## Migration from Beta

### Beta → V1.0

No breaking changes in theme API!

```tsx
// Beta theme code works unchanged in v1.0 ✓
const myTheme = { /* ... */ };

<ThemeProvider defaultTheme={myTheme}>
  <Timeline {...props} />
</ThemeProvider>
```

---

## FAQ

**Q: Can I add my own theme properties?**
A: No, the interface is frozen in v1.0. Use `data-` attributes or CSS variables as workaround.

**Q: How many themes can I have?**
A: Unlimited. Create as many custom themes as you need.

**Q: Can I override theme per band/event?**
A: Not directly. You can use custom painters with inline styles.

**Q: Does theme affect performance?**
A: No, themes are static objects with minimal runtime overhead.

**Q: Can I animate theme transitions?**
A: Not built-in, but you can use CSS transitions on themed elements.

---

## Additional Resources

- **API Reference**: [API.md](../project/API.md)
- **Migration Guide**: [MIGRATION.md](./MIGRATION.md)
- **Examples**: [Demo Site](https://react-simile-timeline.vercel.app)
- **Color Tools**: [Coolors.co](https://coolors.co), [Adobe Color](https://color.adobe.com)
- **Accessibility**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated**: 2025-11-16
**Version**: 1.0 (API Frozen)
**Maintained By**: React Simile Timeline Team
