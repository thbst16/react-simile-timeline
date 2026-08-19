import { describe, it, expect } from 'vitest';
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
