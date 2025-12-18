import React, { useEffect, useState, useRef } from 'react';
import type { TimelineProps, TimelineData, BrandingConfig } from '../types';
import { TimelineProvider, useTimelineContext } from './TimelineProvider';
import { Band } from './Band';
import { EventPopup } from './EventPopup';
import '../styles/timeline.css';

/**
 * Inner component that renders bands from context
 */
function TimelineBands() {
  const { bands } = useTimelineContext();

  return (
    <div
      className="timeline-bands"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {bands.map((bandConfig, index) => (
        <Band
          key={bandConfig.id || `band-${index}`}
          config={bandConfig}
          isPrimary={index === 0 || !bandConfig.syncWith}
        />
      ))}
    </div>
  );
}

/**
 * Timeline component - A modern React implementation of MIT SIMILE Timeline
 *
 * @example
 * ```tsx
 * // With inline data
 * <Timeline data={{ events: [...] }} />
 *
 * // With URL data source
 * <Timeline dataUrl="/api/events.json" />
 *
 * // With custom bands
 * <Timeline
 *   data={data}
 *   bands={[
 *     { id: 'main', height: '80%', timeUnit: 'day' },
 *     { id: 'overview', height: '20%', timeUnit: 'year', overview: true, syncWith: 'main' }
 *   ]}
 * />
 * ```
 */
/**
 * Branding watermark component
 * Styled after the original SIMILE Timeline branding (vertical text, bottom-left)
 */
function TimelineBranding({ config }: { config: BrandingConfig }) {
  const { text, link, position = 'bottom-left', showPoweredBy = false } = config;
  const displayText = text || 'React Simile Timeline';
  const fullText = showPoweredBy ? `Powered by ${displayText}` : displayText;

  // SIMILE-style: vertical text in bottom-left, overlaying timeline
  const containerStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 100,
    ...(position.includes('bottom') ? { bottom: 8 } : { top: 8 }),
    ...(position.includes('right') ? { right: 8 } : { left: 4 }),
  };

  const textStyles: React.CSSProperties = {
    fontSize: '11px',
    fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
    color: 'var(--scale-text-color, #888)',
    opacity: 0.5,
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
  };

  const content = (
    <span className="timeline-branding" style={textStyles}>
      {fullText}
    </span>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...containerStyles,
          textDecoration: 'none',
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <span style={containerStyles}>
      {content}
    </span>
  );
}

export function Timeline({
  data,
  dataUrl,
  dataUrls,
  bands,
  hotZones,
  theme = 'classic',
  centerDate,
  width = '100%',
  height = 400,
  onEventClick,
  onEventHover,
  onScroll,
  onZoom: _onZoom, // Reserved for Sprint 2
  className,
  style,
  branding,
}: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(data || null);
  const [loading, setLoading] = useState(!!dataUrl || (dataUrls && dataUrls.length > 0));
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch data from single URL if provided
  useEffect(() => {
    if (dataUrl) {
      setLoading(true);
      setError(null);

      fetch(dataUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch timeline data: ${response.statusText}`);
          }
          return response.json();
        })
        .then((json: TimelineData) => {
          setTimelineData(json);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [dataUrl]);

  // Fetch and merge data from multiple URLs if provided
  useEffect(() => {
    if (dataUrls && dataUrls.length > 0) {
      setLoading(true);
      setError(null);

      Promise.all(
        dataUrls.map(url =>
          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
              }
              return response.json() as Promise<TimelineData>;
            })
        )
      )
        .then((results) => {
          // Merge all events from multiple sources
          const mergedEvents = results.flatMap(result => result.events || []);
          // Use the first result's metadata as base
          const mergedData: TimelineData = {
            ...results[0],
            events: mergedEvents,
          };
          setTimelineData(mergedData);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [dataUrls]);

  // Update data when prop changes
  useEffect(() => {
    if (data) {
      setTimelineData(data);
    }
  }, [data]);

  // Determine theme data attribute
  const themeAttr = typeof theme === 'string' ? theme : theme?.name || 'classic';

  // Build CSS custom properties from Theme object if provided
  const themeStyles: Record<string, string> = {};
  if (typeof theme === 'object' && theme !== null) {
    if (theme.backgroundColor) themeStyles['--timeline-bg'] = theme.backgroundColor;
    if (theme.eventColor) themeStyles['--event-default-color'] = theme.eventColor;
    if (theme.eventTextColor) themeStyles['--event-text-color'] = theme.eventTextColor;
    if (theme.tapeColor) themeStyles['--tape-default-color'] = theme.tapeColor;
    if (theme.fontFamily) themeStyles['--timeline-font-family'] = theme.fontFamily;
    if (theme.fontSize) themeStyles['--event-font-size'] = theme.fontSize;
    if (theme.scaleColor) themeStyles['--scale-text-color'] = theme.scaleColor;
    if (theme.gridColor) themeStyles['--scale-line-color'] = theme.gridColor;
    if (theme.hotZoneColor) themeStyles['--hot-zone-default-color'] = theme.hotZoneColor;
  }

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    overflow: 'hidden',
    ...(themeStyles as React.CSSProperties),
    ...style,
  };

  if (loading) {
    return (
      <div
        className={`timeline-root ${className || ''}`}
        style={containerStyle}
        data-theme={themeAttr}
        data-testid="timeline-container"
      >
        <div className="timeline-loading">
          Loading timeline...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`timeline-root ${className || ''}`}
        style={containerStyle}
        data-theme={themeAttr}
        data-testid="timeline-container"
      >
        <div className="timeline-error">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!timelineData || !timelineData.events || timelineData.events.length === 0) {
    return (
      <div
        className={`timeline-root ${className || ''}`}
        style={containerStyle}
        data-theme={themeAttr}
        data-testid="timeline-container"
      >
        <div className="timeline-empty">
          No timeline data available
        </div>
      </div>
    );
  }

  // Pass bands to provider - if undefined, provider will auto-generate based on data
  const bandConfigs = bands && bands.length > 0 ? bands : undefined;

  // Parse initial center date
  const initialCenterDate = centerDate
    ? (centerDate instanceof Date ? centerDate : new Date(centerDate))
    : undefined;

  // Resolve branding config
  const brandingConfig: BrandingConfig | null = branding === true
    ? {} // Default branding
    : branding === false || branding === undefined
    ? null
    : branding;

  return (
    <div
      ref={containerRef}
      className={`timeline-root ${className || ''}`}
      style={containerStyle}
      data-theme={themeAttr}
      data-testid="timeline-container"
      role="region"
      aria-label="Timeline visualization"
      aria-roledescription="interactive timeline"
    >
      <TimelineProvider
        events={timelineData.events}
        bands={bandConfigs}
        hotZones={hotZones}
        initialCenterDate={initialCenterDate}
        onScroll={onScroll}
        onEventClick={onEventClick}
        onEventHover={onEventHover}
      >
        <TimelineBands />
        <EventPopup containerRef={containerRef} />
      </TimelineProvider>
      {brandingConfig && <TimelineBranding config={brandingConfig} />}
    </div>
  );
}
