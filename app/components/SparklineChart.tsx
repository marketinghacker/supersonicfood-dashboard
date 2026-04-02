'use client';

import type { WeeklyBucket } from '../lib/config';

interface SparklineChartProps {
  buckets: WeeklyBucket[];
  width?: number;
  height?: number;
}

export default function SparklineChart({ buckets, width = 180, height = 48 }: SparklineChartProps) {
  if (buckets.length < 2) {
    return <div className="text-xs text-gray-600 italic">Za mało danych na trend</div>;
  }

  const roasValues = buckets.map(b => b.roas);
  const spendValues = buckets.map(b => b.spend);
  const maxRoas = Math.max(...roasValues, 1);
  const minRoas = Math.min(...roasValues, 0);
  const range = maxRoas - minRoas || 1;
  const maxSpend = Math.max(...spendValues, 1);

  const padding = 4;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = roasValues.map((roas, i) => {
    const x = padding + (i / (roasValues.length - 1)) * chartW;
    const y = padding + chartH - ((roas - minRoas) / range) * chartH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Spend area (bottom bars showing relative spend)
  const barWidth = chartW / roasValues.length * 0.6;

  // Trend color
  const lastRoas = roasValues[roasValues.length - 1];
  const prevRoas = roasValues[roasValues.length - 2];
  const trendColor = lastRoas >= prevRoas ? '#4ade80' : '#f87171';

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="flex-shrink-0">
        {/* Spend bars */}
        {spendValues.map((spend, i) => {
          const barH = (spend / maxSpend) * (chartH * 0.3);
          const x = padding + (i / (roasValues.length - 1)) * chartW - barWidth / 2;
          return (
            <rect
              key={i}
              x={x}
              y={height - padding - barH}
              width={barWidth}
              height={barH}
              fill="#3b82f6"
              opacity={0.15}
              rx={1}
            />
          );
        })}

        {/* ROAS line */}
        <path d={linePath} fill="none" stroke={trendColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Current value dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={trendColor} />
      </svg>

      <div className="text-right">
        <div className="text-sm font-bold text-white">{lastRoas.toFixed(1)}x</div>
        <div className="text-[10px] text-gray-500">ROAS</div>
      </div>
    </div>
  );
}
