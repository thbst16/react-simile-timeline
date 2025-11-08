/**
 * Ether - Time-to-pixel coordinate conversion
 *
 * The "ether" is the continuous time dimension that bands scroll through.
 * This module provides classes that convert between dates and pixel positions.
 *
 * Sprint 2: Core Rendering
 */

import type { IntervalUnit } from '../types/bands';

/**
 * Base interface for all Ether implementations
 */
export interface Ether {
  /**
   * Convert a date to pixel offset from origin
   * @param date - The date to convert
   * @param origin - The origin date (center of viewport)
   * @returns Pixel offset (positive = right/future, negative = left/past)
   */
  dateToPixel(date: Date, origin: Date): number;

  /**
   * Convert a pixel offset to a date
   * @param pixel - Pixel offset from origin
   * @param origin - The origin date (center of viewport)
   * @returns The date at that pixel position
   */
  pixelToDate(pixel: number, origin: Date): Date;

  /**
   * Get the width in pixels for a given time interval
   * @param startDate - Start of interval
   * @param endDate - End of interval
   * @returns Width in pixels
   */
  getPixelWidth(startDate: Date, endDate: Date): number;

  /**
   * Get the interval unit and pixels for this ether
   */
  getIntervalUnit(): IntervalUnit;
  getIntervalPixels(): number;
}

/**
 * LinearEther - Standard linear time scale
 *
 * Maps time linearly to pixels. For example, if intervalUnit is 'DAY'
 * and intervalPixels is 100, then each day occupies 100 pixels.
 */
export class LinearEther implements Ether {
  private intervalUnit: IntervalUnit;
  private intervalPixels: number;

  constructor(intervalUnit: IntervalUnit, intervalPixels: number) {
    if (intervalPixels <= 0) {
      throw new Error('intervalPixels must be positive');
    }
    this.intervalUnit = intervalUnit;
    this.intervalPixels = intervalPixels;
  }

  public dateToPixel(date: Date, origin: Date): number {
    const msPerInterval = this.getMillisecondsPerInterval();
    const msDiff = date.getTime() - origin.getTime();
    return (msDiff / msPerInterval) * this.intervalPixels;
  }

  public pixelToDate(pixel: number, origin: Date): Date {
    const msPerInterval = this.getMillisecondsPerInterval();
    const ms = (pixel / this.intervalPixels) * msPerInterval;
    return new Date(origin.getTime() + ms);
  }

  public getPixelWidth(startDate: Date, endDate: Date): number {
    const msPerInterval = this.getMillisecondsPerInterval();
    const msDiff = endDate.getTime() - startDate.getTime();
    return (msDiff / msPerInterval) * this.intervalPixels;
  }

  public getIntervalUnit(): IntervalUnit {
    return this.intervalUnit;
  }

  public getIntervalPixels(): number {
    return this.intervalPixels;
  }

  /**
   * Get milliseconds per interval unit
   * Uses accurate calculations for all units
   */
  private getMillisecondsPerInterval(): number {
    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = MS_PER_SECOND * 60;
    const MS_PER_HOUR = MS_PER_MINUTE * 60;
    const MS_PER_DAY = MS_PER_HOUR * 24;
    const MS_PER_WEEK = MS_PER_DAY * 7;

    // Approximate values for month and larger units
    // Note: These are approximations. For exact calculations,
    // we'd need to consider actual month lengths and leap years
    const MS_PER_MONTH = MS_PER_DAY * 30.436875; // Average month length
    const MS_PER_YEAR = MS_PER_DAY * 365.25; // Account for leap years
    const MS_PER_DECADE = MS_PER_YEAR * 10;
    const MS_PER_CENTURY = MS_PER_YEAR * 100;
    const MS_PER_MILLENNIUM = MS_PER_YEAR * 1000;

    switch (this.intervalUnit) {
      case 'MILLISECOND':
        return 1;
      case 'SECOND':
        return MS_PER_SECOND;
      case 'MINUTE':
        return MS_PER_MINUTE;
      case 'HOUR':
        return MS_PER_HOUR;
      case 'DAY':
        return MS_PER_DAY;
      case 'WEEK':
        return MS_PER_WEEK;
      case 'MONTH':
        return MS_PER_MONTH;
      case 'YEAR':
        return MS_PER_YEAR;
      case 'DECADE':
        return MS_PER_DECADE;
      case 'CENTURY':
        return MS_PER_CENTURY;
      case 'MILLENNIUM':
        return MS_PER_MILLENNIUM;
      default: {
        const exhaustiveCheck: never = this.intervalUnit;
        throw new Error(`Unknown interval unit: ${String(exhaustiveCheck)}`);
      }
    }
  }
}

/**
 * LogarithmicEther - Logarithmic time scale
 *
 * Maps time logarithmically to pixels. Useful for timelines spanning
 * vast time periods (e.g., geological time, evolutionary history).
 *
 * Recent events get more space, distant events get compressed.
 */
export class LogarithmicEther implements Ether {
  private intervalUnit: IntervalUnit;
  private intervalPixels: number;
  private base: number; // Logarithmic base (default: 10)

  constructor(intervalUnit: IntervalUnit, intervalPixels: number, base: number = 10) {
    if (intervalPixels <= 0) {
      throw new Error('intervalPixels must be positive');
    }
    if (base <= 1) {
      throw new Error('Logarithmic base must be greater than 1');
    }
    this.intervalUnit = intervalUnit;
    this.intervalPixels = intervalPixels;
    this.base = base;
  }

  public dateToPixel(date: Date, origin: Date): number {
    const msDiff = date.getTime() - origin.getTime();

    if (msDiff === 0) {
      return 0;
    }

    // Use logarithmic scale
    // Sign preserving logarithm: log(|x|) * sign(x)
    const sign = msDiff > 0 ? 1 : -1;
    const logValue = Math.log(Math.abs(msDiff) + 1) / Math.log(this.base);

    return logValue * this.intervalPixels * sign;
  }

  public pixelToDate(pixel: number, origin: Date): Date {
    if (pixel === 0) {
      return origin;
    }

    // Reverse logarithmic transformation
    const sign = pixel > 0 ? 1 : -1;
    const ms = (Math.pow(this.base, Math.abs(pixel) / this.intervalPixels) - 1) * sign;

    return new Date(origin.getTime() + ms);
  }

  public getPixelWidth(startDate: Date, endDate: Date): number {
    // For logarithmic scale, width depends on origin position
    // Use midpoint as approximate origin
    const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);
    const startPixel = this.dateToPixel(startDate, midPoint);
    const endPixel = this.dateToPixel(endDate, midPoint);
    return Math.abs(endPixel - startPixel);
  }

  public getIntervalUnit(): IntervalUnit {
    return this.intervalUnit;
  }

  public getIntervalPixels(): number {
    return this.intervalPixels;
  }
}

/**
 * HotZone configuration
 * Defines a region of time that should have different pixel density
 */
export interface HotZone {
  startDate: Date;
  endDate: Date;
  magnify: number; // Magnification factor (e.g., 2 = twice as many pixels per unit time)
}

/**
 * HotZoneEther - Mixed scale with focus zones
 *
 * Combines linear scale with "hot zones" - regions of time that get
 * more pixel space. Useful for timelines where you want to highlight
 * specific time periods while showing broader context.
 */
export class HotZoneEther implements Ether {
  private baseEther: LinearEther;
  private hotZones: HotZone[];

  constructor(intervalUnit: IntervalUnit, intervalPixels: number, hotZones: HotZone[] = []) {
    this.baseEther = new LinearEther(intervalUnit, intervalPixels);
    this.hotZones = hotZones.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  public dateToPixel(date: Date, origin: Date): number {
    // Start with base linear calculation
    let pixel = this.baseEther.dateToPixel(date, origin);

    // Adjust for hot zones
    for (const zone of this.hotZones) {
      const zoneStart = zone.startDate.getTime();
      const zoneEnd = zone.endDate.getTime();
      const dateTime = date.getTime();
      const originTime = origin.getTime();

      // If date is in hot zone, apply magnification
      if (dateTime >= zoneStart && dateTime <= zoneEnd) {
        const basePixel = this.baseEther.dateToPixel(zone.startDate, origin);
        const offsetInZone = dateTime - zoneStart;
        const zoneWidth = zoneEnd - zoneStart;
        const normalizedOffset = offsetInZone / zoneWidth;

        const zonePixelWidth = this.baseEther.getPixelWidth(zone.startDate, zone.endDate);
        const magnifiedWidth = zonePixelWidth * zone.magnify;

        pixel = basePixel + (magnifiedWidth * normalizedOffset);
        break;
      }

      // If date is after zone, adjust for zone's expansion
      if (dateTime > zoneEnd && originTime < zoneEnd) {
        const zonePixelWidth = this.baseEther.getPixelWidth(zone.startDate, zone.endDate);
        const expansion = zonePixelWidth * (zone.magnify - 1);
        pixel += expansion;
      }
    }

    return pixel;
  }

  public pixelToDate(pixel: number, origin: Date): Date {
    // This is complex with hot zones, use iterative approximation
    // For Sprint 2, we'll use simplified version
    return this.baseEther.pixelToDate(pixel, origin);
  }

  public getPixelWidth(startDate: Date, endDate: Date): number {
    const startPixel = this.dateToPixel(startDate, startDate);
    const endPixel = this.dateToPixel(endDate, startDate);
    return Math.abs(endPixel - startPixel);
  }

  public getIntervalUnit(): IntervalUnit {
    return this.baseEther.getIntervalUnit();
  }

  public getIntervalPixels(): number {
    return this.baseEther.getIntervalPixels();
  }

  public getHotZones(): HotZone[] {
    return [...this.hotZones];
  }
}
