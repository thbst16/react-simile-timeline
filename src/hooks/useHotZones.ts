/**
 * useHotZones Hook
 *
 * Hook for managing hot zones with variable time resolution.
 * Hot zones allow different parts of the timeline to show different levels of detail.
 *
 * Sprint 5: Polish & Performance
 */

import { useState, useCallback } from 'react';
import type { HotZone, HotZoneState, HotZoneCalculation } from '../types/hotzone';
import type { IntervalUnit } from '../types/bands';
import {
  isDateInZone,
  findZonesInRange,
  getActiveZoneAtDate,
  calculateAtDate,
  validateHotZone,
} from '../utils/hotZones';

/**
 * Hook Options
 */
export interface UseHotZonesOptions {
  /**
   * Initial hot zones
   */
  initialZones?: HotZone[];

  /**
   * Base magnification when not in a hot zone
   * @default 1
   */
  baseMagnification?: number;

  /**
   * Callback when hot zones change
   */
  onZonesChange?: (zones: HotZone[]) => void;

  /**
   * Callback when active zones change
   */
  onActiveZonesChange?: (activeZones: HotZone[]) => void;
}

/**
 * Hook Return Value
 */
export interface UseHotZonesResult extends HotZoneState {
  /**
   * Calculate parameters at a specific date
   */
  calculateAt: (date: Date) => HotZoneCalculation;

  /**
   * Check if a date is in any hot zone
   */
  isInHotZone: (date: Date) => boolean;

  /**
   * Find all zones in a date range
   */
  findZonesInRange: (start: Date, end: Date) => HotZone[];

  /**
   * Validate a hot zone before adding
   */
  validateZone: (zone: HotZone) => { valid: boolean; errors: string[] };
}

/**
 * Hook for managing hot zones
 *
 * @example
 * const hotZones = useHotZones({
 *   initialZones: [
 *     { start: '2020-01-01', end: '2020-12-31', magnify: 2 }
 *   ]
 * });
 *
 * // Add a new hot zone
 * hotZones.addZone({
 *   start: '2021-06-01',
 *   end: '2021-08-31',
 *   magnify: 3,
 *   unit: 'DAY'
 * });
 *
 * // Check magnification at a date
 * const calc = hotZones.calculateAt(new Date('2020-06-15'));
 * console.log(calc.magnification); // 2
 */
export function useHotZones(options: UseHotZonesOptions = {}): UseHotZonesResult {
  const { initialZones = [], baseMagnification = 1, onZonesChange, onActiveZonesChange } = options;

  const [zones, setZones] = useState<HotZone[]>(initialZones);
  const [activeZones, setActiveZones] = useState<HotZone[]>([]);

  /**
   * Add a hot zone
   */
  const addZone = useCallback(
    (zone: HotZone) => {
      const validation = validateHotZone(zone);
      if (!validation.valid) {
        console.warn('Invalid hot zone:', validation.errors);
        return;
      }

      const newZones = [...zones, zone];
      setZones(newZones);
      onZonesChange?.(newZones);
    },
    [zones, onZonesChange]
  );

  /**
   * Remove a hot zone by index
   */
  const removeZone = useCallback(
    (index: number) => {
      if (index < 0 || index >= zones.length) {
        console.warn('Invalid zone index:', index);
        return;
      }

      const newZones = zones.filter((_, i) => i !== index);
      setZones(newZones);
      onZonesChange?.(newZones);
    },
    [zones, onZonesChange]
  );

  /**
   * Clear all hot zones
   */
  const clearZones = useCallback(() => {
    setZones([]);
    setActiveZones([]);
    onZonesChange?.([]);
    onActiveZonesChange?.([]);
  }, [onZonesChange, onActiveZonesChange]);

  /**
   * Update active zones based on viewport
   */
  const updateActiveZones = useCallback(
    (viewportStart: Date, viewportEnd: Date) => {
      const visible = findZonesInRange(viewportStart, viewportEnd, zones);
      setActiveZones(visible);
      onActiveZonesChange?.(visible);
    },
    [zones, onActiveZonesChange]
  );

  /**
   * Get magnification at a specific date
   */
  const getMagnificationAt = useCallback(
    (date: Date): number => {
      const zone = getActiveZoneAtDate(date, zones);
      return zone?.magnify ?? baseMagnification;
    },
    [zones, baseMagnification]
  );

  /**
   * Get unit at a specific date
   */
  const getUnitAt = useCallback(
    (date: Date): IntervalUnit | undefined => {
      const zone = getActiveZoneAtDate(date, zones);
      return zone?.unit;
    },
    [zones]
  );

  /**
   * Get pixels per interval at a specific date
   */
  const getPixelsPerIntervalAt = useCallback(
    (date: Date): number | undefined => {
      const zone = getActiveZoneAtDate(date, zones);
      return zone?.pixelsPerInterval;
    },
    [zones]
  );

  /**
   * Calculate parameters at a specific date
   */
  const calculateAt = useCallback(
    (date: Date): HotZoneCalculation => {
      return calculateAtDate(date, zones, baseMagnification);
    },
    [zones, baseMagnification]
  );

  /**
   * Check if a date is in any hot zone
   */
  const isInHotZoneCallback = useCallback(
    (date: Date): boolean => {
      return zones.some((zone) => isDateInZone(date, zone));
    },
    [zones]
  );

  /**
   * Find zones in range
   */
  const findZonesInRangeCallback = useCallback(
    (start: Date, end: Date): HotZone[] => {
      return findZonesInRange(start, end, zones);
    },
    [zones]
  );

  /**
   * Validate a zone
   */
  const validateZone = useCallback((zone: HotZone) => {
    return validateHotZone(zone);
  }, []);

  return {
    zones,
    activeZones,
    addZone,
    removeZone,
    clearZones,
    updateActiveZones,
    getMagnificationAt,
    getUnitAt,
    getPixelsPerIntervalAt,
    calculateAt,
    isInHotZone: isInHotZoneCallback,
    findZonesInRange: findZonesInRangeCallback,
    validateZone,
  };
}
