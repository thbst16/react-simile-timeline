import { describe, it, expect } from 'vitest';
import { getScaleConfig, generateTicks } from './scaleUtils';
import { TIME_UNITS } from './dateUtils';

describe('getScaleConfig', () => {
  it('returns appropriate scale for yearly view', () => {
    // ~100px per year
    const pixelsPerMs = 100 / TIME_UNITS.year;
    const config = getScaleConfig(pixelsPerMs);
    expect(config.unit).toBe('year');
    expect(config.format).toBe('yyyy');
  });

  it('returns appropriate scale for monthly view', () => {
    // ~100px per month
    const pixelsPerMs = 100 / TIME_UNITS.month;
    const config = getScaleConfig(pixelsPerMs);
    expect(['month', 'week']).toContain(config.unit);
  });

  it('returns appropriate scale for daily view', () => {
    // ~100px per day
    const pixelsPerMs = 100 / TIME_UNITS.day;
    const config = getScaleConfig(pixelsPerMs);
    expect(['day', 'hour']).toContain(config.unit);
  });
});

describe('generateTicks - label spacing', () => {
  // Test that labels don't overlap at various zoom levels
  // Label widths are approximately:
  // - "yyyy" (e.g., "1960"): ~35px
  // - "MMM yyyy" (e.g., "Jan 1960"): ~65px
  // - "MMM d" (e.g., "Jan 15"): ~45px

  const LABEL_WIDTHS: Record<string, number> = {
    'yyyy': 35,
    'MMM yyyy': 65,
    'MMM d': 50,
    'MMM d HH:mm': 85,
    'HH:mm': 40,
  };

  function checkTickSpacing(ticks: ReturnType<typeof generateTicks>, format: string) {
    if (ticks.length < 2) return true;

    const labelWidth = LABEL_WIDTHS[format] || 60;
    const minSpacing = labelWidth; // Labels shouldn't overlap

    for (let i = 1; i < ticks.length; i++) {
      const spacing = ticks[i].x - ticks[i - 1].x;
      if (spacing < minSpacing) {
        return {
          valid: false,
          spacing,
          minSpacing,
          format,
          labels: [ticks[i-1].label, ticks[i].label]
        };
      }
    }
    return { valid: true };
  }

  it('should not have overlapping labels at zoom level showing months', () => {
    // Simulate a zoom level that shows monthly labels
    const pixelsPerMs = 150 / TIME_UNITS.month; // 150px per month
    const config = getScaleConfig(pixelsPerMs);

    const visibleRange = {
      start: new Date('1959-01-01'),
      end: new Date('1965-01-01'),
    };
    const centerDate = new Date('1962-01-01');
    const viewportWidth = 800;

    const ticks = generateTicks(visibleRange, config, pixelsPerMs, centerDate, viewportWidth);
    const result = checkTickSpacing(ticks, config.format);

    expect(result.valid).toBe(true);
  });

  it('should not have overlapping labels at zoom level showing years', () => {
    // Simulate a zoom level that shows yearly labels
    const pixelsPerMs = 80 / TIME_UNITS.year; // 80px per year
    const config = getScaleConfig(pixelsPerMs);

    const visibleRange = {
      start: new Date('1950-01-01'),
      end: new Date('1980-01-01'),
    };
    const centerDate = new Date('1965-01-01');
    const viewportWidth = 800;

    const ticks = generateTicks(visibleRange, config, pixelsPerMs, centerDate, viewportWidth);
    const result = checkTickSpacing(ticks, config.format);

    expect(result.valid).toBe(true);
  });

  it('should not have overlapping labels at intermediate zoom levels', () => {
    // Test several zoom levels that might cause overlap
    const testCases = [
      { pixelsPerUnit: 50, unit: TIME_UNITS.month },
      { pixelsPerUnit: 60, unit: TIME_UNITS.month },
      { pixelsPerUnit: 70, unit: TIME_UNITS.month },
      { pixelsPerUnit: 80, unit: TIME_UNITS.month },
      { pixelsPerUnit: 90, unit: TIME_UNITS.month },
      { pixelsPerUnit: 40, unit: TIME_UNITS.year },
      { pixelsPerUnit: 50, unit: TIME_UNITS.year },
      { pixelsPerUnit: 60, unit: TIME_UNITS.year },
    ];

    const visibleRange = {
      start: new Date('1955-01-01'),
      end: new Date('1970-01-01'),
    };
    const centerDate = new Date('1962-06-01');
    const viewportWidth = 800;

    for (const { pixelsPerUnit, unit } of testCases) {
      const pixelsPerMs = pixelsPerUnit / unit;
      const config = getScaleConfig(pixelsPerMs);
      const ticks = generateTicks(visibleRange, config, pixelsPerMs, centerDate, viewportWidth);
      const result = checkTickSpacing(ticks, config.format);

      expect(result.valid,
        `Labels overlapping at ${pixelsPerUnit}px/${unit === TIME_UNITS.month ? 'month' : 'year'}: ` +
        `spacing=${(result as {spacing?: number}).spacing?.toFixed(1)}px, ` +
        `minRequired=${(result as {minSpacing?: number}).minSpacing}px, ` +
        `format=${config.format}, ` +
        `labels=${JSON.stringify((result as {labels?: string[]}).labels)}`
      ).toBe(true);
    }
  });
});
