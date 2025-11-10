/**
 * useHotZones Hook Tests
 *
 * Tests for hot zone management and calculations.
 * Sprint 5: Polish & Performance
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHotZones } from '../useHotZones';
import type { HotZone } from '../../types/hotzone';

describe('useHotZones', () => {
  it('initializes with empty zones', () => {
    const { result } = renderHook(() => useHotZones());

    expect(result.current.zones).toEqual([]);
    expect(result.current.activeZones).toEqual([]);
  });

  it('initializes with provided zones', () => {
    const initialZones: HotZone[] = [{ start: '2020-01-01', end: '2020-12-31', magnify: 2 }];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    expect(result.current.zones).toEqual(initialZones);
  });

  it('adds a valid hot zone', () => {
    const { result } = renderHook(() => useHotZones());

    act(() => {
      result.current.addZone({
        start: '2020-01-01',
        end: '2020-12-31',
        magnify: 2,
      });
    });

    expect(result.current.zones).toHaveLength(1);
    expect(result.current.zones[0].magnify).toBe(2);
  });

  it('removes a zone by index', () => {
    const initialZones: HotZone[] = [
      { start: '2020-01-01', end: '2020-06-30', magnify: 2 },
      { start: '2020-07-01', end: '2020-12-31', magnify: 3 },
    ];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    act(() => {
      result.current.removeZone(0);
    });

    expect(result.current.zones).toHaveLength(1);
    expect(result.current.zones[0].magnify).toBe(3);
  });

  it('clears all zones', () => {
    const initialZones: HotZone[] = [{ start: '2020-01-01', end: '2020-12-31', magnify: 2 }];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    act(() => {
      result.current.clearZones();
    });

    expect(result.current.zones).toEqual([]);
    expect(result.current.activeZones).toEqual([]);
  });

  it('calculates magnification at a date inside hot zone', () => {
    const initialZones: HotZone[] = [{ start: '2020-01-01', end: '2020-12-31', magnify: 2 }];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    const magnification = result.current.getMagnificationAt(new Date('2020-06-15'));
    expect(magnification).toBe(2);
  });

  it('returns base magnification for date outside hot zone', () => {
    const initialZones: HotZone[] = [{ start: '2020-01-01', end: '2020-12-31', magnify: 2 }];

    const { result } = renderHook(() => useHotZones({ initialZones, baseMagnification: 1 }));

    const magnification = result.current.getMagnificationAt(new Date('2021-06-15'));
    expect(magnification).toBe(1);
  });

  it('checks if date is in hot zone', () => {
    const initialZones: HotZone[] = [{ start: '2020-01-01', end: '2020-12-31', magnify: 2 }];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    expect(result.current.isInHotZone(new Date('2020-06-15'))).toBe(true);
    expect(result.current.isInHotZone(new Date('2021-06-15'))).toBe(false);
  });

  it('finds zones in a date range', () => {
    const initialZones: HotZone[] = [
      { start: '2020-01-01', end: '2020-06-30', magnify: 2 },
      { start: '2020-07-01', end: '2020-12-31', magnify: 3 },
      { start: '2021-01-01', end: '2021-12-31', magnify: 4 },
    ];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    const zones = result.current.findZonesInRange(new Date('2020-05-01'), new Date('2020-08-01'));

    expect(zones).toHaveLength(2);
    expect(zones[0].magnify).toBe(2);
    expect(zones[1].magnify).toBe(3);
  });

  it('updates active zones based on viewport', () => {
    const initialZones: HotZone[] = [
      { start: '2020-01-01', end: '2020-06-30', magnify: 2 },
      { start: '2020-07-01', end: '2020-12-31', magnify: 3 },
    ];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    act(() => {
      result.current.updateActiveZones(new Date('2020-01-01'), new Date('2020-03-31'));
    });

    expect(result.current.activeZones).toHaveLength(1);
    expect(result.current.activeZones[0].magnify).toBe(2);
  });

  it('gets unit override from hot zone', () => {
    const initialZones: HotZone[] = [
      { start: '2020-01-01', end: '2020-12-31', magnify: 2, unit: 'DAY' },
    ];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    const unit = result.current.getUnitAt(new Date('2020-06-15'));
    expect(unit).toBe('DAY');
  });

  it('calculates full parameters at a date', () => {
    const initialZones: HotZone[] = [
      {
        start: '2020-01-01',
        end: '2020-12-31',
        magnify: 2,
        unit: 'DAY',
        multiple: 7,
        pixelsPerInterval: 50,
      },
    ];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    const calc = result.current.calculateAt(new Date('2020-06-15'));

    expect(calc.isInHotZone).toBe(true);
    expect(calc.magnification).toBe(2);
    expect(calc.unit).toBe('DAY');
    expect(calc.multiple).toBe(7);
    expect(calc.pixelsPerInterval).toBe(50);
  });

  it('validates hot zones correctly', () => {
    const { result } = renderHook(() => useHotZones());

    // Valid zone
    const validZone: HotZone = {
      start: '2020-01-01',
      end: '2020-12-31',
      magnify: 2,
    };
    expect(result.current.validateZone(validZone).valid).toBe(true);

    // Invalid: start after end
    const invalidZone: HotZone = {
      start: '2020-12-31',
      end: '2020-01-01',
      magnify: 2,
    };
    expect(result.current.validateZone(invalidZone).valid).toBe(false);
  });

  it('handles overlapping zones (highest magnification wins)', () => {
    const initialZones: HotZone[] = [
      { start: '2020-01-01', end: '2020-12-31', magnify: 2 },
      { start: '2020-06-01', end: '2020-08-31', magnify: 3 },
    ];

    const { result } = renderHook(() => useHotZones({ initialZones }));

    // Date in overlapping region should get higher magnification
    const magnification = result.current.getMagnificationAt(new Date('2020-07-15'));
    expect(magnification).toBe(3);
  });
});
