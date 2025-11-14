/**
 * Theme Switcher Component
 *
 * Compact theme selector for switching between Classic, Dark, and Auto modes.
 * Sprint 3, Day 5 - Classic Vintage Theme Integration
 */

import type React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeSwitcher: React.FC = () => {
  const { mode, setMode, theme } = useTheme();

  const buttons = [
    {
      mode: 'light' as const,
      icon: '🎨',
      label: 'Classic Vintage',
      ariaLabel: 'Switch to classic vintage theme',
    },
    {
      mode: 'dark' as const,
      icon: '🌙',
      label: 'Dark Mode',
      ariaLabel: 'Switch to dark theme',
    },
    {
      mode: 'auto' as const,
      icon: '✨',
      label: 'Auto',
      ariaLabel: 'Use system theme preference',
    },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg p-1.5"
      style={{
        backgroundColor: mode === 'light' ? '#f8f6f0' : theme.colors.ui.surface,
        border: `2px solid ${mode === 'light' ? '#8b7355' : theme.colors.ui.border}`,
        boxShadow: theme.effects.shadow.md,
      }}
      role="group"
      aria-label="Theme selector"
    >
      {buttons.map((btn) => {
        const isActive = mode === btn.mode;

        return (
          <button
            key={btn.mode}
            onClick={() => setMode(btn.mode)}
            aria-label={btn.ariaLabel}
            aria-pressed={isActive}
            title={btn.label}
            className="relative px-3 py-2 rounded-md transition-all duration-200"
            style={{
              backgroundColor: isActive
                ? mode === 'light'
                  ? '#6b5444'
                  : theme.colors.ui.primary
                : mode === 'light'
                  ? '#a89274'
                  : 'transparent',
              color: isActive ? '#fff' : mode === 'light' ? '#fff' : theme.colors.ui.text,
              border: `1px solid ${mode === 'light' ? '#6b5444' : theme.colors.ui.border}`,
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              fontWeight: isActive ? 600 : 500,
              opacity: isActive ? 1 : 0.75,
            }}
          >
            <span role="img" aria-hidden="true">
              {btn.icon}
            </span>
            <span className="sr-only">{btn.label}</span>

            {/* Active indicator */}
            {isActive && (
              <span
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: mode === 'light' ? '#c9a961' : theme.colors.ui.accent,
                }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
