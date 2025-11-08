/**
 * usePanZoom
 *
 * Custom hook for handling pan and zoom interactions on timeline bands.
 * Supports mouse wheel, pinch gestures, and keyboard shortcuts.
 *
 * Sprint 4: Interactions
 */

import { useCallback, useState, useEffect, useRef } from 'react';

export interface UsePanZoomOptions {
  /** Initial zoom level (1 = normal, 2 = 2x zoom) */
  initialZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Zoom step for discrete zoom (e.g., +/- keys) */
  zoomStep?: number;
  /** Enable mouse wheel zoom */
  enableWheelZoom?: boolean;
  /** Enable pinch-to-zoom on touch devices */
  enablePinchZoom?: boolean;
  /** Callback when zoom level changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when pan occurs */
  onPan?: (deltaX: number, deltaY: number) => void;
}

export interface UsePanZoomResult {
  /** Current zoom level */
  zoom: number;
  /** Increase zoom level */
  zoomIn: () => void;
  /** Decrease zoom level */
  zoomOut: () => void;
  /** Set specific zoom level */
  setZoom: (level: number) => void;
  /** Reset to initial zoom */
  resetZoom: () => void;
  /** Pan by delta pixels */
  pan: (deltaX: number, deltaY: number) => void;
  /** Whether currently zooming */
  isZooming: boolean;
}

/**
 * Hook for managing pan and zoom interactions
 *
 * @example
 * const { zoom, zoomIn, zoomOut, pan } = usePanZoom({
 *   initialZoom: 1,
 *   minZoom: 0.5,
 *   maxZoom: 10,
 *   onZoomChange: (level) => console.log('Zoom:', level)
 * });
 */
export function usePanZoom(
  options: UsePanZoomOptions = {}
): UsePanZoomResult {
  const {
    initialZoom = 1,
    minZoom = 0.1,
    maxZoom = 10,
    zoomStep = 0.2,
    enableWheelZoom = true,
    enablePinchZoom = true,
    onZoomChange,
    onPan,
  } = options;

  const [zoom, setZoomState] = useState(initialZoom);
  const [isZooming, setIsZooming] = useState(false);

  const setZoom = useCallback((level: number) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, level));
    setZoomState(clampedZoom);
    onZoomChange?.(clampedZoom);
    // TODO: Implement smooth zoom animation
  }, [minZoom, maxZoom, onZoomChange]);

  const zoomIn = useCallback(() => {
    setZoom(zoom + zoomStep);
  }, [zoom, zoomStep, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(zoom - zoomStep);
  }, [zoom, zoomStep, setZoom]);

  const resetZoom = useCallback(() => {
    setZoom(initialZoom);
  }, [initialZoom, setZoom]);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    // Apply zoom factor to pan delta
    const adjustedX = deltaX / zoom;
    const adjustedY = deltaY / zoom;
    onPan?.(adjustedX, adjustedY);
  }, [onPan, zoom]);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enableWheelZoom) return;

    event.preventDefault();
    setIsZooming(true);

    // Determine zoom direction based on wheel delta
    const delta = -Math.sign(event.deltaY);
    const zoomChange = delta * zoomStep;

    setZoom(zoom + zoomChange);

    // Reset zooming state after a short delay
    setTimeout(() => setIsZooming(false), 100);
  }, [enableWheelZoom, zoom, zoomStep, setZoom]);

  // Pinch zoom handler (touch)
  const lastPinchDistance = useRef<number>(0);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enablePinchZoom || event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (!touch1 || !touch2) return;

    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    lastPinchDistance.current = distance;
    setIsZooming(true);
  }, [enablePinchZoom]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enablePinchZoom || event.touches.length !== 2) return;

    event.preventDefault();

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    if (!touch1 || !touch2) return;

    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    if (lastPinchDistance.current > 0) {
      const scale = distance / lastPinchDistance.current;
      const newZoom = zoom * scale;
      setZoom(newZoom);
    }

    lastPinchDistance.current = distance;
  }, [enablePinchZoom, zoom, setZoom]);

  const handleTouchEnd = useCallback(() => {
    if (!enablePinchZoom) return;

    lastPinchDistance.current = 0;
    setIsZooming(false);
  }, [enablePinchZoom]);

  // Attach wheel event listener
  useEffect(() => {
    if (!enableWheelZoom) return;

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [enableWheelZoom, handleWheel]);

  // Attach touch event listeners
  useEffect(() => {
    if (!enablePinchZoom) return;

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePinchZoom, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    zoom,
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
    pan,
    isZooming,
  };
}
