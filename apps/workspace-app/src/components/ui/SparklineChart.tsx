/**
 * SparklineChart — lightweight inline SVG sparkline.
 * No external dependencies. Renders a line chart for trend data.
 */
import type { CSSProperties } from 'react';

interface SparklineProps {
  /** Data points (values). At least 2 required. */
  data: number[];
  /** Width in pixels (default: 120) */
  width?: number;
  /** Height in pixels (default: 40) */
  height?: number;
  /** Line color (default: primary blue) */
  color?: string;
  /** Fill area under line (default: true) */
  fill?: boolean;
  /** Show a dot at the last point */
  showEndDot?: boolean;
  style?: CSSProperties;
}

export function SparklineChart({
  data,
  width = 120,
  height = 40,
  color = '#0F4C81',
  fill = true,
  showEndDot = true,
  style,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero
  const pad = 4;

  // Map data points to SVG coordinates
  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));

  // Build SVG polyline path
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Build fill polygon (line + baseline)
  const fillPath = [
    line,
    `L${points[points.length - 1].x.toFixed(1)},${height - pad}`,
    `L${points[0].x.toFixed(1)},${height - pad}`,
    'Z',
  ].join(' ');

  const lastPt = points[points.length - 1];
  const fillId = `sparkfill-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-hidden="true"
      role="img"
    >
      {fill && (
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && (
        <path d={fillPath} fill={`url(#${fillId})`} />
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && (
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={3}
          fill={color}
          stroke="#fff"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}
