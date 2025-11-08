/**
 * DecoratorLayer - Renders point and span decorators
 *
 * Decorators provide visual markers and highlights without being events:
 * - Point decorators: Vertical lines at specific dates
 * - Span decorators: Shaded backgrounds for time ranges
 *
 * Sprint 3: Advanced Rendering
 */

import type { Ether } from '../core/Ether';
import type {
  Decorator,
  PointDecorator,
  SpanDecorator,
} from '../types/decorators';
import {
  DEFAULT_POINT_DECORATOR_STYLE,
  DEFAULT_SPAN_DECORATOR_STYLE,
} from '../types/decorators';

export interface DecoratorLayerProps {
  /** Decorators to render */
  decorators: Decorator[];

  /** Ether for time-to-pixel conversion */
  ether: Ether;

  /** Viewport information */
  viewport: {
    centerDate: Date;
    width: number;
    height: number;
    minVisibleDate: Date;
    maxVisibleDate: Date;
  };
}

/**
 * DecoratorLayer Component
 *
 * Renders decorators behind events (lower z-index)
 */
export function DecoratorLayer({
  decorators,
  ether,
  viewport,
}: DecoratorLayerProps): JSX.Element {
  // Filter visible decorators
  const visibleDecorators = decorators.filter((decorator) => {
    try {
      if (decorator.type === 'point') {
        const date = new Date(decorator.date);
        return date >= viewport.minVisibleDate && date <= viewport.maxVisibleDate;
      } else {
        const startDate = new Date(decorator.startDate);
        const endDate = new Date(decorator.endDate);
        return (
          startDate <= viewport.maxVisibleDate && endDate >= viewport.minVisibleDate
        );
      }
    } catch {
      return false;
    }
  });

  // Separate by type for proper rendering order
  const spanDecorators = visibleDecorators.filter((d): d is SpanDecorator => d.type === 'span');
  const pointDecorators = visibleDecorators.filter((d): d is PointDecorator => d.type === 'point');

  return (
    <svg
      width={viewport.width}
      height={viewport.height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        {/* Pattern for subtle texture on spans (optional) */}
        <pattern id="decorator-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.5" fill="currentColor" opacity="0.1" />
        </pattern>
      </defs>

      {/* Render span decorators first (behind everything) */}
      <g className="span-decorators">
        {spanDecorators.map((decorator, index) => (
          <SpanDecoratorElement
            key={`span-${index}`}
            decorator={decorator}
            ether={ether}
            viewport={viewport}
          />
        ))}
      </g>

      {/* Render point decorators (on top of spans, behind events) */}
      <g className="point-decorators">
        {pointDecorators.map((decorator, index) => (
          <PointDecoratorElement
            key={`point-${index}`}
            decorator={decorator}
            ether={ether}
            viewport={viewport}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * PointDecoratorElement - Renders a single point decorator
 */
interface PointDecoratorElementProps {
  decorator: PointDecorator;
  ether: Ether;
  viewport: {
    centerDate: Date;
    width: number;
    height: number;
  };
}

function PointDecoratorElement({
  decorator,
  ether,
  viewport,
}: PointDecoratorElementProps): JSX.Element | null {
  try {
    const date = new Date(decorator.date);
    const pixelPos = ether.dateToPixel(date, viewport.centerDate);
    const x = viewport.width / 2 + pixelPos;

    const color = decorator.color || DEFAULT_POINT_DECORATOR_STYLE.color;
    const opacity = decorator.opacity ?? DEFAULT_POINT_DECORATOR_STYLE.opacity;
    const width = decorator.width ?? DEFAULT_POINT_DECORATOR_STYLE.width;

    return (
      <g className={decorator.className || 'point-decorator'}>
        {/* Vertical line */}
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={viewport.height}
          stroke={color}
          strokeWidth={width}
          opacity={opacity}
          strokeDasharray={decorator.label ? '5,3' : undefined} // Dashed if has label
        />

        {/* Label (if provided) */}
        {decorator.label && (
          <>
            {/* Label background */}
            <rect
              x={x - 40}
              y={10}
              width={80}
              height={20}
              fill={color}
              opacity={opacity * 1.5}
              rx={3}
            />
            {/* Label text */}
            <text
              x={x}
              y={23}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill="white"
              style={{ userSelect: 'none' }}
            >
              {decorator.label}
            </text>
          </>
        )}

        {/* Accessibility */}
        <title>{decorator.label || `Marker at ${date.toLocaleDateString()}`}</title>
      </g>
    );
  } catch {
    return null;
  }
}

/**
 * SpanDecoratorElement - Renders a single span decorator
 */
interface SpanDecoratorElementProps {
  decorator: SpanDecorator;
  ether: Ether;
  viewport: {
    centerDate: Date;
    width: number;
    height: number;
  };
}

function SpanDecoratorElement({
  decorator,
  ether,
  viewport,
}: SpanDecoratorElementProps): JSX.Element | null {
  try {
    const startDate = new Date(decorator.startDate);
    const endDate = new Date(decorator.endDate);

    const startPixel = ether.dateToPixel(startDate, viewport.centerDate);
    const endPixel = ether.dateToPixel(endDate, viewport.centerDate);

    const x = viewport.width / 2 + startPixel;
    const width = Math.abs(endPixel - startPixel);

    const color = decorator.color || DEFAULT_SPAN_DECORATOR_STYLE.color;
    const opacity = decorator.opacity ?? DEFAULT_SPAN_DECORATOR_STYLE.opacity;

    return (
      <g className={decorator.className || 'span-decorator'}>
        {/* Background rectangle */}
        <rect
          x={x}
          y={0}
          width={width}
          height={viewport.height}
          fill={color}
          opacity={opacity}
        />

        {/* Label (if provided) - centered in span */}
        {decorator.label && width > 100 && (
          <>
            {/* Label background */}
            <rect
              x={x + width / 2 - 60}
              y={viewport.height / 2 - 12}
              width={120}
              height={24}
              fill={color}
              opacity={opacity * 3}
              rx={4}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={opacity * 2}
            />
            {/* Label text */}
            <text
              x={x + width / 2}
              y={viewport.height / 2 + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight="600"
              fill="#374151"
              style={{ userSelect: 'none' }}
            >
              {decorator.label}
            </text>
          </>
        )}

        {/* Accessibility */}
        <title>
          {decorator.label ||
            `Highlighted period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
        </title>
      </g>
    );
  } catch {
    return null;
  }
}

/**
 * Helper: Import default styles for re-export
 */
const defaults = { DEFAULT_POINT_DECORATOR_STYLE, DEFAULT_SPAN_DECORATOR_STYLE };
export { defaults as DecoratorDefaults };
