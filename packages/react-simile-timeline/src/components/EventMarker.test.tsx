import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventMarker } from './EventMarker';
import { TimelineProvider } from './TimelineProvider';
import type { TimelineEvent } from '../types';

const event: TimelineEvent = {
  start: '2023-01-15',
  title: 'Launch',
  description: 'Ship it',
};

/** Render a marker inside a provider so it can reach the timeline context. */
function renderMarker(
  props: Partial<React.ComponentProps<typeof EventMarker>> = {},
  onEventClick?: (e: TimelineEvent) => void
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TimelineProvider events={[event]} onEventClick={onEventClick}>
      {children}
    </TimelineProvider>
  );
  return render(<EventMarker event={event} x={10} y={20} {...props} />, {
    wrapper,
  });
}

describe('EventMarker — accessibility', () => {
  it('exposes a button role, label and pressed state', () => {
    renderMarker();
    const marker = screen.getByRole('button', { name: /Launch/ });
    expect(marker).toHaveAttribute('aria-pressed', 'false');
    expect(marker).toHaveAttribute('tabindex', '0');
  });

  it('folds the description into the accessible label', () => {
    renderMarker();
    expect(
      screen.getByRole('button', { name: 'Launch: Ship it' })
    ).toBeInTheDocument();
  });

  it('renders the title text', () => {
    renderMarker();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });
});

describe('EventMarker — interaction', () => {
  it('selects the event on click, firing the context callback', () => {
    const onEventClick = vi.fn();
    renderMarker({}, onEventClick);
    fireEvent.click(screen.getByRole('button', { name: /Launch/ }));
    expect(onEventClick).toHaveBeenCalledWith(event);
  });

  it('activates on Enter', () => {
    const onEventClick = vi.fn();
    renderMarker({}, onEventClick);
    fireEvent.keyDown(screen.getByRole('button', { name: /Launch/ }), {
      key: 'Enter',
    });
    expect(onEventClick).toHaveBeenCalledWith(event);
  });

  it('activates on Space', () => {
    const onEventClick = vi.fn();
    renderMarker({}, onEventClick);
    fireEvent.keyDown(screen.getByRole('button', { name: /Launch/ }), {
      key: ' ',
    });
    expect(onEventClick).toHaveBeenCalledWith(event);
  });

  it('does not activate on an unrelated key', () => {
    const onEventClick = vi.fn();
    renderMarker({}, onEventClick);
    fireEvent.keyDown(screen.getByRole('button', { name: /Launch/ }), {
      key: 'a',
    });
    expect(onEventClick).not.toHaveBeenCalled();
  });
});

describe('EventMarker — duration rendering', () => {
  it('renders a duration tape when given a width', () => {
    const durationEvent: TimelineEvent = {
      start: '2023-01-01',
      end: '2023-02-01',
      title: 'Sprint',
      isDuration: true,
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TimelineProvider events={[durationEvent]}>{children}</TimelineProvider>
    );
    const { container } = render(
      <EventMarker
        event={durationEvent}
        x={0}
        y={0}
        isDuration
        durationWidth={120}
      />,
      { wrapper }
    );
    expect(
      container.querySelector('.timeline-event--duration')
    ).toBeInTheDocument();
    expect(container.querySelector('.timeline-event__tape')).toBeInTheDocument();
  });
});
