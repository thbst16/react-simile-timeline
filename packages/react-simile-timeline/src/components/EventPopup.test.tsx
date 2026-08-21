import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EventPopup } from './EventPopup';
import { TimelineProvider, useTimelineContext } from './TimelineProvider';
import type { TimelineEvent } from '../types';

const event: TimelineEvent = {
  start: '2023-01-15',
  title: 'Kickoff',
  description: 'The <em>opening</em> milestone',
  link: 'https://example.com/more',
  image: 'https://example.com/pic.png',
};

/**
 * Render the popup within a provider and expose a control that selects an
 * event, so tests can open the popup through the real action path.
 */
function renderPopup(evt: TimelineEvent = event) {
  function Opener() {
    const { actions } = useTimelineContext();
    return (
      <button onClick={() => actions.setSelectedEvent(evt, { x: 50, y: 50 })}>
        open
      </button>
    );
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TimelineProvider events={[evt]}>{children}</TimelineProvider>
  );
  const utils = render(
    <>
      <Opener />
      <EventPopup />
    </>,
    { wrapper }
  );
  fireEvent.click(screen.getByText('open'));
  return utils;
}

describe('EventPopup — rendering', () => {
  it('is absent until an event is selected', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TimelineProvider events={[event]}>{children}</TimelineProvider>
    );
    render(<EventPopup />, { wrapper });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a dialog with the title and formatted date', () => {
    renderPopup();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Kickoff')).toBeInTheDocument();
    expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument();
  });

  it('renders the description as HTML', () => {
    renderPopup();
    // The <em> in the description should become a real element.
    expect(screen.getByText('opening').tagName).toBe('EM');
  });

  it('renders the more-info link and image', () => {
    renderPopup();
    const link = screen.getByRole('link', { name: /More information/ });
    expect(link).toHaveAttribute('href', 'https://example.com/more');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('img', { name: 'Kickoff' })).toHaveAttribute(
      'src',
      'https://example.com/pic.png'
    );
  });

  it('shows the raw start string when the date cannot be formatted', () => {
    renderPopup({ start: 'garbage-date', title: 'Odd' });
    expect(screen.getByText('garbage-date')).toBeInTheDocument();
  });

  it('wraps the portal in a themed root so a theme resolves outside .timeline-root (#74)', () => {
    // The popup portals to document.body, escaping the timeline root. Without a
    // themed wrapper its CSS variables would fall back to the light defaults
    // even under the dark theme.
    function Opener() {
      const { actions } = useTimelineContext();
      return (
        <button onClick={() => actions.setSelectedEvent(event, { x: 50, y: 50 })}>
          open
        </button>
      );
    }
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TimelineProvider events={[event]}>{children}</TimelineProvider>
    );
    render(
      <>
        <Opener />
        <EventPopup themeAttr="dark" themeStyles={{ ['--popup-bg' as string]: '#123456' }} />
      </>,
      { wrapper }
    );
    fireEvent.click(screen.getByText('open'));

    const themedRoot = screen.getByRole('dialog').closest('.timeline-root');
    expect(themedRoot).not.toBeNull();
    expect(themedRoot).toHaveAttribute('data-theme', 'dark');
    // Custom-theme variables ride along on the same wrapper.
    expect((themedRoot as HTMLElement).style.getPropertyValue('--popup-bg')).toBe('#123456');
  });
});

describe('EventPopup — dismissal', () => {
  it('closes when the close button is clicked', () => {
    renderPopup();
    fireEvent.click(screen.getByRole('button', { name: /Close popup/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on the Escape key', () => {
    renderPopup();
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stays open on an unrelated key', () => {
    renderPopup();
    act(() => {
      fireEvent.keyDown(document, { key: 'a' });
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('EventPopup — focus management', () => {
  // Render the popup with a focusable opener, focus it, then open the popup.
  // Focus-in happens on a setTimeout(0), so callers advance fake timers.
  function openFromFocusedTrigger(evt: TimelineEvent = event): HTMLElement {
    function Opener() {
      const { actions } = useTimelineContext();
      return (
        <button onClick={() => actions.setSelectedEvent(evt, { x: 50, y: 50 })}>
          open
        </button>
      );
    }
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TimelineProvider events={[evt]}>{children}</TimelineProvider>
    );
    render(
      <>
        <Opener />
        <EventPopup />
      </>,
      { wrapper }
    );
    const opener = screen.getByText('open');
    opener.focus();
    fireEvent.click(opener);
    return opener;
  }

  it('moves focus into the dialog when it opens', () => {
    vi.useFakeTimers();
    try {
      openFromFocusedTrigger();
      act(() => {
        vi.runAllTimers();
      });
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores focus to the opener when it closes', () => {
    vi.useFakeTimers();
    try {
      const opener = openFromFocusedTrigger();
      act(() => {
        vi.runAllTimers();
      });
      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(opener);
    } finally {
      vi.useRealTimers();
    }
  });

  it('wraps Tab and Shift+Tab within the dialog', () => {
    vi.useFakeTimers();
    try {
      openFromFocusedTrigger();
      act(() => {
        vi.runAllTimers();
      });
      const dialog = screen.getByRole('dialog');
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      expect(focusable.length).toBeGreaterThan(1);

      // Tab from the last element wraps to the first.
      last.focus();
      act(() => {
        fireEvent.keyDown(document, { key: 'Tab' });
      });
      expect(document.activeElement).toBe(first);

      // Shift+Tab from the first element wraps to the last.
      first.focus();
      act(() => {
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      });
      expect(document.activeElement).toBe(last);
    } finally {
      vi.useRealTimers();
    }
  });
});
