/**
 * Sprint 5 Demo - Theming System
 *
 * Demonstrates:
 * - Theme switching (Classic, Dark, Auto)
 * - Theme customization
 * - Color scheme visualization
 * - Typography samples
 * - Component theming integration
 *
 * Sprint 5: Polish & Performance
 */

import { useState } from 'react';
import {
  ThemeProvider,
  useTheme,
  useThemeColors,
  useThemeTypography,
  useThemeToggle,
} from '../hooks';
import type { TimelineEvent } from '../types/events';

/**
 * Sample events for theme demo
 */
const sampleEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    title: 'World War II Begins',
    start: '1939-09-01',
    isDuration: true,
    end: '1945-09-02',
    description: 'Global conflict involving most of the world\'s nations',
    color: '#58a',
  },
  {
    id: 'evt-2',
    title: 'D-Day Landing',
    start: '1944-06-06',
    description: 'Allied invasion of Normandy',
    color: '#f00',
  },
  {
    id: 'evt-3',
    title: 'VE Day',
    start: '1945-05-08',
    description: 'Victory in Europe Day',
    color: '#5a5',
  },
  {
    id: 'evt-4',
    title: 'Moon Landing',
    start: '1969-07-20',
    description: 'First humans land on the Moon',
    color: '#f90',
  },
];

/**
 * Theme Controls Component
 */
function ThemeControls(): JSX.Element {
  const { mode, setMode, availableThemes } = useTheme();
  const { isDark, toggle } = useThemeToggle();

  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Theme Controls</h3>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label htmlFor="theme-mode" style={{ marginRight: '0.5rem' }}>
            Mode:
          </label>
          <select
            id="theme-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'auto')}
            style={{ padding: '0.25rem 0.5rem' }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <button
          onClick={toggle}
          style={{
            padding: '0.25rem 0.75rem',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Toggle {isDark ? 'Light' : 'Dark'}
        </button>

        <div style={{ marginLeft: 'auto' }}>
          <span>Available Themes: {availableThemes.length}</span>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Current: {isDark ? 'Dark' : 'Light'} Mode
        {mode === 'auto' && ' (following system preference)'}
      </div>
    </div>
  );
}

/**
 * Color Palette Component
 */
function ColorPalette(): JSX.Element {
  const colors = useThemeColors();

  const ColorSwatch = ({ label, color }: { label: string; color: string }): JSX.Element => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <div
        style={{
          width: '2rem',
          height: '2rem',
          backgroundColor: color,
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          {color}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Color Palette</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Band Colors
          </h4>
          <ColorSwatch label="Background" color={colors.band.background} />
          <ColorSwatch label="Background Alt" color={colors.band.backgroundAlt} />
          <ColorSwatch label="Border" color={colors.band.border} />
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Event Colors
          </h4>
          <ColorSwatch label="Tape" color={colors.event.tape} />
          <ColorSwatch label="Tape Hover" color={colors.event.tapeHover} />
          <ColorSwatch label="Point" color={colors.event.point} />
          <ColorSwatch label="Point Hover" color={colors.event.pointHover} />
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            UI Colors
          </h4>
          <ColorSwatch label="Primary" color={colors.ui.primary} />
          <ColorSwatch label="Secondary" color={colors.ui.secondary} />
          <ColorSwatch label="Accent" color={colors.ui.accent} />
          <ColorSwatch label="Success" color={colors.ui.success} />
          <ColorSwatch label="Warning" color={colors.ui.warning} />
          <ColorSwatch label="Error" color={colors.ui.error} />
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Timescale Colors
          </h4>
          <ColorSwatch label="Background" color={colors.timescale.background} />
          <ColorSwatch label="Label" color={colors.timescale.label} />
          <ColorSwatch label="Major Line" color={colors.timescale.majorLine} />
          <ColorSwatch label="Minor Line" color={colors.timescale.minorLine} />
        </div>
      </div>
    </div>
  );
}

/**
 * Typography Samples Component
 */
function TypographySamples(): JSX.Element {
  const typography = useThemeTypography();

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Typography</h3>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Font Family
        </div>
        <div style={{ fontFamily: typography.fontFamily, fontSize: '1rem' }}>
          {typography.fontFamily}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Font Sizes
          </h4>
          <div style={{ fontSize: typography.fontSize.xs }}>Extra Small (xs): {typography.fontSize.xs}</div>
          <div style={{ fontSize: typography.fontSize.sm }}>Small (sm): {typography.fontSize.sm}</div>
          <div style={{ fontSize: typography.fontSize.base }}>Base: {typography.fontSize.base}</div>
          <div style={{ fontSize: typography.fontSize.lg }}>Large (lg): {typography.fontSize.lg}</div>
          <div style={{ fontSize: typography.fontSize.xl }}>Extra Large (xl): {typography.fontSize.xl}</div>
          <div style={{ fontSize: typography.fontSize['2xl'] }}>2XL: {typography.fontSize['2xl']}</div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Font Weights
          </h4>
          <div style={{ fontWeight: typography.fontWeight.normal }}>Normal: {typography.fontWeight.normal}</div>
          <div style={{ fontWeight: typography.fontWeight.medium }}>Medium: {typography.fontWeight.medium}</div>
          <div style={{ fontWeight: typography.fontWeight.semibold }}>Semibold: {typography.fontWeight.semibold}</div>
          <div style={{ fontWeight: typography.fontWeight.bold }}>Bold: {typography.fontWeight.bold}</div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Line Heights
          </h4>
          <div style={{ lineHeight: typography.lineHeight.tight, border: '1px solid var(--border)', padding: '0.25rem', marginBottom: '0.25rem' }}>
            Tight: {typography.lineHeight.tight}<br />Second line to show spacing
          </div>
          <div style={{ lineHeight: typography.lineHeight.normal, border: '1px solid var(--border)', padding: '0.25rem', marginBottom: '0.25rem' }}>
            Normal: {typography.lineHeight.normal}<br />Second line to show spacing
          </div>
          <div style={{ lineHeight: typography.lineHeight.relaxed, border: '1px solid var(--border)', padding: '0.25rem' }}>
            Relaxed: {typography.lineHeight.relaxed}<br />Second line to show spacing
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Event Rendering Preview
 */
function EventPreview(): JSX.Element {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Event Rendering Preview</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sampleEvents.map((event) => {
          const isHovered = hoveredEvent === event.id;
          const isTape = event.isDuration;

          return (
            <div
              key={event.id}
              style={{
                padding: '1rem',
                border: `1px solid ${colors.band.border}`,
                borderRadius: '4px',
                backgroundColor: colors.band.backgroundAlt,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
              }}
              onMouseEnter={() => setHoveredEvent(event.id || null)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: isTape ? '60px' : '12px',
                    height: isTape ? '14px' : '12px',
                    backgroundColor: isTape
                      ? (isHovered ? colors.event.tapeHover : colors.event.tape)
                      : (isHovered ? colors.event.pointHover : colors.event.point),
                    borderRadius: isTape ? '2px' : '50%',
                    transition: 'background-color 150ms ease',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.event.label,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {event.title}
                  </div>
                  <div
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: typography.fontSize.sm,
                      color: colors.ui.textSecondary,
                    }}
                  >
                    {event.start}{event.isDuration && ` → ${event.end}`}
                  </div>
                  {event.description && (
                    <div
                      style={{
                        fontFamily: typography.fontFamily,
                        fontSize: typography.fontSize.sm,
                        color: colors.ui.textSecondary,
                        marginTop: '0.25rem',
                      }}
                    >
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Demo Content (without provider)
 */
function DemoContent(): JSX.Element {
  const { theme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.ui.background,
        color: theme.colors.ui.text,
        fontFamily: theme.typography.fontFamily,
        '--primary': theme.colors.ui.primary,
        '--secondary': theme.colors.ui.secondary,
        '--accent': theme.colors.ui.accent,
        '--background': theme.colors.ui.background,
        '--surface': theme.colors.ui.surface,
        '--border': theme.colors.ui.border,
        '--text': theme.colors.ui.text,
        '--text-secondary': theme.colors.ui.textSecondary,
      } as React.CSSProperties}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ padding: '2rem 1rem', borderBottom: `1px solid ${theme.colors.ui.border}` }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold }}>
            Sprint 5 Theme Demo
          </h1>
          <p style={{ margin: 0, color: theme.colors.ui.textSecondary, fontSize: theme.typography.fontSize.base }}>
            Showcase of the theming system with Classic and Dark themes
          </p>
        </header>

        <ThemeControls />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', padding: '2rem 1rem' }}>
          <ColorPalette />
          <TypographySamples />
          <EventPreview />
        </div>

        <footer style={{ padding: '2rem 1rem', borderTop: `1px solid ${theme.colors.ui.border}`, textAlign: 'center', color: theme.colors.ui.textSecondary, fontSize: theme.typography.fontSize.sm }}>
          Sprint 5: Polish & Performance - Theming System
        </footer>
      </div>
    </div>
  );
}

/**
 * Main Sprint 5 Demo Component
 */
export default function Sprint5Demo(): JSX.Element {
  return (
    <ThemeProvider defaultMode="light">
      <DemoContent />
    </ThemeProvider>
  );
}
