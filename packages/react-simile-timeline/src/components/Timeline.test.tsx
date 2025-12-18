import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from './Timeline';
import type { TimelineData } from '../types';

const sampleData: TimelineData = {
  dateTimeFormat: 'iso8601',
  events: [
    {
      start: '2023-01-01',
      title: 'Test Event 1',
      description: 'First test event',
    },
    {
      start: '2023-06-15',
      title: 'Test Event 2',
      description: 'Second test event',
    },
  ],
};

describe('Timeline', () => {
  it('renders without crashing', () => {
    render(<Timeline data={sampleData} />);
    expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
  });

  it('displays event count when data is provided', () => {
    render(<Timeline data={sampleData} />);
    expect(screen.getByText(/2 events loaded/i)).toBeInTheDocument();
  });

  it('shows loading state when dataUrl is provided', () => {
    // Mock fetch to not resolve immediately
    global.fetch = vi.fn(() => new Promise(() => {}));

    render(<Timeline dataUrl="/api/events.json" />);
    expect(screen.getByText(/loading timeline/i)).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    // Mock fetch to reject
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      } as Response)
    );

    render(<Timeline dataUrl="/api/events.json" />);

    // Wait for error state
    await screen.findByText(/error/i);
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<Timeline data={{ events: [] }} />);
    expect(screen.getByText(/no timeline data/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Timeline data={sampleData} className="custom-class" />);
    expect(screen.getByTestId('timeline-container')).toHaveClass('custom-class');
  });

  it('applies custom height', () => {
    render(<Timeline data={sampleData} height={500} />);
    const container = screen.getByTestId('timeline-container');
    expect(container).toHaveStyle({ height: '500px' });
  });

  it('applies custom width', () => {
    render(<Timeline data={sampleData} width={800} />);
    const container = screen.getByTestId('timeline-container');
    expect(container).toHaveStyle({ width: '800px' });
  });

  it('exports Timeline component', async () => {
    // Test that the component is properly exported from the package
    const { Timeline: ImportedTimeline } = await import('../index');
    expect(ImportedTimeline).toBeDefined();
    expect(typeof ImportedTimeline).toBe('function');
  });
});
