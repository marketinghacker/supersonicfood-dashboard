'use client';

import type { WeeklyBucket } from '../lib/config';

interface SparklineChartProps {
  buckets: WeeklyBucket[];
  totalRoas: number;
  width?: number;
  height?: number;
}

export default function SparklineChart({ buckets, totalRoas, width = 240, height = 64 }: SparklineChartProps) {
  if (buckets.length < 2) {
    return <div className="text-sm text-gray-300 font-semibold italic">Za mało danych</div>;
  }

  // Filter out empty buckets (partial weeks with 0 spend)
  const validBuckets = buckets.filter(b => b.spend > 0);
  if (validBuckets.length < 2) {
    return (
      <div className="text-right">
        <div className="text-lg font-black text-white">{totalRoas.toFixed(1)}x</div>
        <div className="text-sm font-semibold text-gray-300">ROAS</div>
      </div>
    );
  }

  const roasValues = validBuckets.map(b => b.roas);
  const spendValues = validBuckets.map(b => b.spend);
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
  const barWidth = chartW / roasValues.length * 0.6;

  // Trend color based on overall direction
  const firstHalf = roasValues.slice(0, Math.ceil(roasValues.length / 2));
  const secondHalf = roasValues.slice(Math.ceil(roasValues.length / 2));
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trendColor = avgSecond >= avgFirst ? '#4ade80' : '#f87171';

  return (
    <div className="flex items-center gap-3">
      <svg width={width} height={height} className="flex-shrink-0">
        {spendValues.map((spend, i) => {
          const barH = (spend / maxSpend) * (chartH * 0.3);
          const x = padding + (i / (roasValues.length - 1)) * chartW - barWidth / 2;
          return (
            <rect key={i} x={x} y={height - padding - barH} width={barWidth} height={barH}
              fill="#3b82f6" opacity={0.2} rx={1} />
          );
        })}
        <path d={linePath} fill="none" stroke={trendColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={trendColor} />
      </svg>
      <div className="text-right">
        <div className="text-lg font-black text-white">{totalRoas.toFixed(1)}x</div>
        <div className="text-sm font-semibold text-gray-300">ROAS</div>
      </div>
    </div>
  );
}
