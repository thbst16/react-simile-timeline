/**
 * Theme Exports
 *
 * Central export point for all timeline themes.
 * Sprint 5: Polish & Performance
 */

export { classicTheme } from './classic';
export { darkTheme } from './dark';

export type { TimelineTheme, ThemeMode, ThemeContextValue } from '../types/theme';

// Default theme
export { classicTheme as defaultTheme } from './classic';

// Available themes
import { classicTheme } from './classic';
import { darkTheme } from './dark';

export const themes = {
  classic: classicTheme,
  dark: darkTheme,
};

export const themeList = [classicTheme, darkTheme];
