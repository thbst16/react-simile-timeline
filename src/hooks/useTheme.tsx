/**
 * useTheme Hook
 *
 * Hook for accessing and managing timeline themes.
 * Provides theme switching, mode detection, and theme customization.
 *
 * Sprint 5: Polish & Performance
 */

import { useContext, createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { TimelineTheme, ThemeMode, ThemeContextValue } from '../types/theme';
import { classicTheme, darkTheme, themeList } from '../themes';

// Create theme context
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider Props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: TimelineTheme;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

/**
 * Theme Provider Component
 *
 * Wraps the timeline to provide theme context.
 *
 * @example
 * <ThemeProvider defaultMode="dark">
 *   <Timeline />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = classicTheme,
  defaultMode = 'light',
  storageKey = 'timeline-theme-mode',
}: ThemeProviderProps): JSX.Element {
  // Load saved theme mode from localStorage
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultMode;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        return saved;
      }
    } catch (error) {
      console.warn('Failed to load theme mode from localStorage:', error);
    }

    return defaultMode;
  });

  const [customTheme, setCustomTheme] = useState<TimelineTheme>(defaultTheme);

  // Detect system preference for auto mode
  const systemPrefersDark = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (): void => {
      // Force re-render when system preference changes
      setModeState('auto');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  // Apply dark class to document for Tailwind dark mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isDark = mode === 'dark' || (mode === 'auto' && systemPrefersDark);

    // Force remove and re-add to ensure it updates
    document.documentElement.classList.remove('dark');

    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, [mode, systemPrefersDark]);

  // Determine effective theme based on mode
  const effectiveTheme = useMemo((): TimelineTheme => {
    if (mode === 'dark') {
      return darkTheme;
    }

    if (mode === 'auto') {
      return systemPrefersDark ? darkTheme : classicTheme;
    }

    return customTheme || classicTheme;
  }, [mode, customTheme, systemPrefersDark]);

  // Save mode to localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);

    try {
      localStorage.setItem(storageKey, newMode);
    } catch (error) {
      console.warn('Failed to save theme mode to localStorage:', error);
    }
  }, [storageKey]);

  // Set custom theme
  const setTheme = useCallback((theme: TimelineTheme) => {
    setCustomTheme(theme);
  }, []);

  const value: ThemeContextValue = {
    theme: effectiveTheme,
    mode,
    setMode,
    setTheme,
    availableThemes: themeList,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * @example
 * const { theme, mode, setMode } = useTheme();
 *
 * // Access theme colors
 * const bgColor = theme.colors.band.background;
 *
 * // Switch to dark mode
 * setMode('dark');
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to get only theme colors (convenience hook)
 *
 * @example
 * const colors = useThemeColors();
 * const bandBg = colors.band.background;
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook to get only theme typography (convenience hook)
 *
 * @example
 * const typography = useThemeTypography();
 * const fontSize = typography.fontSize.base;
 */
export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

/**
 * Hook to toggle between light and dark modes
 *
 * @example
 * const { isDark, toggle } = useThemeToggle();
 */
export function useThemeToggle() {
  const { mode, setMode } = useTheme();

  const isDark = mode === 'dark' || (mode === 'auto' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const toggle = useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

  return { isDark, toggle };
}
