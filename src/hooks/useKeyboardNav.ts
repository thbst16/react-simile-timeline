/**
 * useKeyboardNav
 *
 * Custom hook for keyboard navigation and shortcuts in the timeline.
 * Handles arrow keys for panning, +/- for zoom, ESC for closing, etc.
 *
 * Sprint 4: Interactions
 */

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  handler: (event: KeyboardEvent) => void;
}

export interface UseKeyboardNavOptions {
  /** Enable keyboard navigation */
  enabled?: boolean;
  /** Custom keyboard shortcuts to register */
  shortcuts?: KeyboardShortcut[];
  /** Callback for arrow key navigation (left/right pan) */
  onPan?: (direction: 'left' | 'right' | 'up' | 'down', amount: number) => void;
  /** Callback for +/- zoom */
  onZoom?: (direction: 'in' | 'out') => void;
  /** Callback for ESC key */
  onEscape?: () => void;
  /** Callback for Home/End keys */
  onNavigate?: (position: 'start' | 'end') => void;
  /** Pan amount per arrow key press (pixels) */
  panStep?: number;
}

export interface UseKeyboardNavResult {
  /** Whether keyboard navigation is currently active */
  isActive: boolean;
  /** Register additional keyboard shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Unregister keyboard shortcut */
  unregisterShortcut: (key: string) => void;
  /** Get list of all registered shortcuts */
  getShortcuts: () => KeyboardShortcut[];
}

/**
 * Hook for keyboard navigation and shortcuts
 *
 * @example
 * const { isActive, registerShortcut } = useKeyboardNav({
 *   enabled: true,
 *   onPan: (dir, amt) => console.log('Pan', dir, amt),
 *   onZoom: (dir) => console.log('Zoom', dir),
 *   panStep: 50
 * });
 */
export function useKeyboardNav(
  options: UseKeyboardNavOptions = {}
): UseKeyboardNavResult {
  const {
    enabled = true,
    shortcuts = [],
    onPan,
    onZoom,
    onEscape,
    onNavigate,
    panStep = 50,
  } = options;

  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());

  // Initialize default shortcuts
  useEffect(() => {
    if (!enabled) return;

    const defaultShortcuts: KeyboardShortcut[] = [
      {
        key: 'ArrowLeft',
        description: 'Pan left',
        handler: (e) => {
          e.preventDefault();
          onPan?.('left', panStep);
        },
      },
      {
        key: 'ArrowRight',
        description: 'Pan right',
        handler: (e) => {
          e.preventDefault();
          onPan?.('right', panStep);
        },
      },
      {
        key: 'ArrowUp',
        description: 'Pan up',
        handler: (e) => {
          e.preventDefault();
          onPan?.('up', panStep);
        },
      },
      {
        key: 'ArrowDown',
        description: 'Pan down',
        handler: (e) => {
          e.preventDefault();
          onPan?.('down', panStep);
        },
      },
      {
        key: '+',
        description: 'Zoom in',
        handler: (e) => {
          e.preventDefault();
          onZoom?.('in');
        },
      },
      {
        key: '=',
        description: 'Zoom in (alternative)',
        handler: (e) => {
          e.preventDefault();
          onZoom?.('in');
        },
      },
      {
        key: '-',
        description: 'Zoom out',
        handler: (e) => {
          e.preventDefault();
          onZoom?.('out');
        },
      },
      {
        key: 'Escape',
        description: 'Close popup/cancel',
        handler: (e) => {
          e.preventDefault();
          onEscape?.();
        },
      },
      {
        key: 'Home',
        description: 'Navigate to start',
        handler: (e) => {
          e.preventDefault();
          onNavigate?.('start');
        },
      },
      {
        key: 'End',
        description: 'Navigate to end',
        handler: (e) => {
          e.preventDefault();
          onNavigate?.('end');
        },
      },
      ...shortcuts,
    ];

    // Register all shortcuts
    defaultShortcuts.forEach(shortcut => {
      const key = createShortcutKey(shortcut);
      shortcutsRef.current.set(key, shortcut);
    });
  }, [enabled, shortcuts, onPan, onZoom, onEscape, onNavigate, panStep]);

  // Global keyboard event handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Don't capture if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const shortcutKey = createShortcutKeyFromEvent(event);
      const shortcut = shortcutsRef.current.get(shortcutKey);

      if (shortcut) {
        shortcut.handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = createShortcutKey(shortcut);
    shortcutsRef.current.set(key, shortcut);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key);
  }, []);

  const getShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  return {
    isActive: enabled,
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
  };
}

// Helper functions
function createShortcutKey(shortcut: KeyboardShortcut): string {
  const parts = [
    shortcut.ctrlKey ? 'Ctrl' : '',
    shortcut.shiftKey ? 'Shift' : '',
    shortcut.altKey ? 'Alt' : '',
    shortcut.metaKey ? 'Meta' : '',
    shortcut.key,
  ].filter(Boolean);
  return parts.join('+');
}

function createShortcutKeyFromEvent(event: KeyboardEvent): string {
  const parts = [
    event.ctrlKey ? 'Ctrl' : '',
    event.shiftKey ? 'Shift' : '',
    event.altKey ? 'Alt' : '',
    event.metaKey ? 'Meta' : '',
    event.key,
  ].filter(Boolean);
  return parts.join('+');
}
