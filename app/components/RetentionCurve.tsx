'use client';

import type { VideoRetention } from '../lib/config';

interface RetentionCurveProps {
  retention: VideoRetention;
}

export default function RetentionCurve({ retention }: RetentionCurveProps) {
  const { plays, p25, p50, p75, p95, avgWatchSeconds } = retention;
  if (plays === 0) return null;

  const points = [
    { label: 'Start', pct: 100 },
    { label: '25%', pct: (p25 / plays) * 100 },
    { label: '50%', pct: (p50 / plays) * 100 },
    { label: '75%', pct: (p75 / plays) * 100 },
    { label: '95%', pct: (p95 / plays) * 100 },
  ];

  const width = 280;
  const height = 100;
  const padding = { top: 8, right: 12, bottom: 20, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const svgPoints = points.map((p, i) => ({
    x: padding.left + (i / (points.length - 1)) * chartW,
    y: padding.top + chartH - (p.pct / 100) * chartH,
    pct: p.pct,
    label: p.label,
  }));

  const areaPath = `M${svgPoints[0].x},${svgPoints[0].y} ` +
    svgPoints.slice(1).map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${svgPoints[svgPoints.length - 1].x},${padding.top + chartH} L${svgPoints[0].x},${padding.top + chartH} Z`;

  const linePath = svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Interpretive labels
  const hook = points[1].pct > 60 ? 'strong' : points[1].pct > 40 ? 'ok' : 'weak';
  const midDrop = points[1].pct - points[2].pct;
  const completion = points[4].pct;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Retencja</h4>
        <span className="text-xs text-gray-500">Avg: {avgWatchSeconds.toFixed(1)}s</span>
      </div>

      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
        {/* 50% reference line */}
        <line
          x1={padding.left} y1={padding.top + chartH * 0.5}
          x2={padding.left + chartW} y2={padding.top + chartH * 0.5}
          stroke="#4b5563" strokeWidth={1} strokeDasharray="4 4" opacity={0.5}
        />

        {/* Area fill */}
        <path d={areaPath} fill="url(#retGrad)" opacity={0.3} />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#818cf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + values */}
        {svgPoints.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill="#818cf8" />
            <text x={p.x} y={p.y - 6} textAnchor="middle" className="fill-gray-300 text-[9px]">
              {p.pct.toFixed(0)}%
            </text>
            <text x={p.x} y={padding.top + chartH + 14} textAnchor="middle" className="fill-gray-500 text-[8px]">
              {p.label}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      {/* Interpretive labels */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          hook === 'strong' ? 'bg-green-500/15 text-green-400' :
          hook === 'ok' ? 'bg-yellow-500/15 text-yellow-400' :
          'bg-red-500/15 text-red-400'
        }`}>
          {hook === 'strong' ? 'Silny hook' : hook === 'ok' ? 'OK hook' : 'Słaby hook'}
        </span>
        {midDrop > 25 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">
            Drop w środku
          </span>
        )}
        {completion > 30 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">
            Dobry finish ({completion.toFixed(0)}%)
          </span>
        )}
      </div>
    </div>
  );
}
