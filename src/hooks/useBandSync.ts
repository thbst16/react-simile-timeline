/**
 * useBandSync
 *
 * Custom hook for synchronizing multiple timeline bands.
 * When one band scrolls, synchronized bands follow proportionally.
 *
 * Sprint 4: Interactions
 */

import { useCallback, useRef, useEffect } from 'react';

export interface BandSyncConfig {
  /** Unique band identifier */
  bandId: string;
  /** Sync ratio relative to master band (1 = same speed, 0.5 = half speed) */
  syncRatio?: number;
  /** Whether this band is the master (user-controlled) */
  isMaster?: boolean;
}

export interface UseBandSyncOptions {
  /** Array of band configurations to sync */
  bands: BandSyncConfig[];
  /** Callback when any band scrolls */
  onBandScroll?: (bandId: string, position: number) => void;
}

export interface UseBandSyncResult {
  /** Notify that a band has scrolled */
  notifyScroll: (bandId: string, deltaPixels: number) => void;
  /** Get the scroll delta for a specific band based on master scroll */
  getSyncedDelta: (bandId: string, masterDelta: number) => number;
  /** Register a band for synchronization */
  registerBand: (config: BandSyncConfig) => void;
  /** Unregister a band from synchronization */
  unregisterBand: (bandId: string) => void;
}

/**
 * Hook for synchronizing multiple timeline bands
 *
 * @example
 * const { notifyScroll, getSyncedDelta } = useBandSync({
 *   bands: [
 *     { bandId: 'detail', isMaster: true, syncRatio: 1 },
 *     { bandId: 'overview', syncRatio: 0.1 }
 *   ]
 * });
 */
export function useBandSync(options: UseBandSyncOptions): UseBandSyncResult {
  const { bands, onBandScroll } = options;
  const bandsRef = useRef<Map<string, BandSyncConfig>>(new Map());
  const scrollingBandRef = useRef<string | null>(null);
  const syncCallbacksRef = useRef<Map<string, (delta: number) => void>>(new Map());

  // Initialize bands map when bands prop changes
  useEffect(() => {
    bandsRef.current.clear();
    bands.forEach((band) => {
      bandsRef.current.set(band.bandId, band);
    });
  }, [bands]);

  const notifyScroll = useCallback(
    (bandId: string, deltaPixels: number) => {
      const sourceBand = bandsRef.current.get(bandId);
      if (!sourceBand) return;

      // Prevent circular updates
      if (scrollingBandRef.current === bandId) return;

      scrollingBandRef.current = bandId;

      try {
        // Propagate scroll to other bands based on sync ratios
        bandsRef.current.forEach((targetBand, targetId) => {
          if (targetId === bandId) return; // Skip source band

          // Calculate synced delta based on ratio
          const sourceSyncRatio = sourceBand.syncRatio ?? 1;
          const targetSyncRatio = targetBand.syncRatio ?? 1;

          // Relative sync ratio: how much target should move relative to source
          const relativeSyncRatio = targetSyncRatio / sourceSyncRatio;
          const syncedDelta = deltaPixels * relativeSyncRatio;

          // Call the sync callback if registered
          const syncCallback = syncCallbacksRef.current.get(targetId);
          if (syncCallback) {
            syncCallback(syncedDelta);
          }

          // Notify parent of band scroll
          onBandScroll?.(targetId, syncedDelta);
        });

        // Notify parent of source band scroll
        onBandScroll?.(bandId, deltaPixels);
      } finally {
        // Clear scrolling flag after a short delay to allow propagation
        setTimeout(() => {
          if (scrollingBandRef.current === bandId) {
            scrollingBandRef.current = null;
          }
        }, 0);
      }
    },
    [onBandScroll]
  );

  const getSyncedDelta = useCallback((bandId: string, masterDelta: number): number => {
    const band = bandsRef.current.get(bandId);
    if (!band) return 0;

    const syncRatio = band.syncRatio ?? 1;
    return masterDelta * syncRatio;
  }, []);

  const registerBand = useCallback(
    (config: BandSyncConfig, syncCallback?: (delta: number) => void) => {
      bandsRef.current.set(config.bandId, config);

      if (syncCallback) {
        syncCallbacksRef.current.set(config.bandId, syncCallback);
      }
    },
    []
  );

  const unregisterBand = useCallback((bandId: string) => {
    bandsRef.current.delete(bandId);
    syncCallbacksRef.current.delete(bandId);
  }, []);

  return {
    notifyScroll,
    getSyncedDelta,
    registerBand,
    unregisterBand,
  };
}
