'use client';

import { useState } from 'react';
import type { Creative, WeeklyBucket } from '../lib/config';

interface ChartProps {
  creative: Creative;
  medianRoas?: number;
}

// ─── Shared SVG helpers ───

function Tooltip({ x, y, lines, visible }: { x: number; y: number; lines: string[]; visible: boolean }) {
  if (!visible) return null;
  const w = 180, h = lines.length * 16 + 12;
  const tx = x + w > 480 ? x - w - 10 : x + 10;
  const ty = Math.max(5, Math.min(y - h / 2, 170));
  return (
    <g>
      <rect x={tx} y={ty} width={w} height={h} rx={4} fill="#1f2937" stroke="#4b5563" strokeWidth={1} opacity={0.95} />
      {lines.map((line, i) => (
        <text key={i} x={tx + 8} y={ty + 16 + i * 16} fill="white" fontSize="11" fontWeight="600">{line}</text>
      ))}
    </g>
  );
}

// ─── Chart 1: ROAS vs Spend ───

function RoasSpendChart({ creative, medianRoas = 0 }: ChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const buckets = creative.weeklyBuckets.filter(b => b.spend > 0);
  if (buckets.length < 2) return <div className="text-sm text-gray-400 p-4">Za mało danych na wykres</div>;

  const W = 480, H = 200, pad = { top: 15, right: 55, bottom: 30, left: 45 };
  const iW = W - pad.left - pad.right, iH = H - pad.top - pad.bottom;
  const maxR = Math.max(...buckets.map(b => b.roas), medianRoas, 1);
  const maxS = Math.max(...buckets.map(b => b.spend), 1);
  const barW = iW / buckets.length * 0.6;

  const pts = buckets.map((b, i) => ({
    x: pad.left + (i / (buckets.length - 1)) * iW,
    y: pad.top + iH - (b.roas / maxR) * iH,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const medY = pad.top + iH - (medianRoas / maxR) * iH;

  return (
    <div>
      <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-2">ROAS vs Spend w czasie</h4>
      <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHover(null)}>
        {/* Median line */}
        {medianRoas > 0 && (
          <g>
            <line x1={pad.left} y1={medY} x2={pad.left + iW} y2={medY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="6 3" opacity={0.6} />
            <text x={pad.left + iW + 4} y={medY + 4} fill="#f59e0b" fontSize="10" fontWeight="600">Med {medianRoas.toFixed(1)}x</text>
          </g>
        )}
        {/* Spend bars */}
        {buckets.map((b, i) => {
          const x = pad.left + (i / (buckets.length - 1)) * iW;
          const h = (b.spend / maxS) * (iH * 0.5);
          return (
            <rect key={`s${i}`} x={x - barW / 2} y={H - pad.bottom - h} width={barW} height={h}
              fill="#3b82f6" opacity={hover === i ? 0.4 : 0.2} rx={2}
              onMouseEnter={() => setHover(i)} />
          );
        })}
        {/* ROAS line */}
        <path d={path} fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {pts.map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r={hover === i ? 6 : 4} fill="#4ade80"
            onMouseEnter={() => setHover(i)} className="cursor-pointer" />
        ))}
        {/* Labels */}
        {buckets.map((b, i) => {
          const x = pad.left + (i / (buckets.length - 1)) * iW;
          return <text key={`l${i}`} x={x} y={H - 8} textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="600">
            {new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
          </text>;
        })}
        {/* Axis labels */}
        <text x={pad.left - 8} y={pad.top + 4} textAnchor="end" fill="#9ca3af" fontSize="9">ROAS</text>
        <text x={W - 4} y={H - pad.bottom + 4} textAnchor="end" fill="#60a5fa" fontSize="9">Spend</text>
        {/* Tooltip */}
        {hover !== null && (
          <Tooltip x={pts[hover].x} y={pts[hover].y} visible={true} lines={[
            `ROAS: ${buckets[hover].roas.toFixed(1)}x`,
            `Spend: ${buckets[hover].spend.toFixed(0)} PLN`,
            `Revenue: ${buckets[hover].revenue.toFixed(0)} PLN`,
            `Konw: ${buckets[hover].conversions}`,
            `Freq: ${buckets[hover].frequency.toFixed(1)}`,
          ]} />
        )}
      </svg>
      <div className="flex gap-4 mt-1 text-sm font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" /><span className="text-gray-300">ROAS</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/40" /><span className="text-gray-300">Spend</span></span>
        {medianRoas > 0 && <span className="flex items-center gap-1.5"><span className="w-6 h-0 border-t-2 border-dashed border-amber-400" /><span className="text-gray-300">Mediana</span></span>}
      </div>
    </div>
  );
}

// ─── Chart 2: Frequency vs ROAS ───

function FrequencyRoasChart({ creative, medianRoas = 0 }: ChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const buckets = creative.weeklyBuckets.filter(b => b.spend > 0 && b.frequency > 0);
  if (buckets.length < 2) return null;

  const W = 480, H = 200, pad = { top: 15, right: 20, bottom: 30, left: 45 };
  const iW = W - pad.left - pad.right, iH = H - pad.top - pad.bottom;

  const freqs = buckets.map(b => b.frequency);
  const roass = buckets.map(b => b.roas);
  const imps = buckets.map(b => b.impressions);
  const maxF = Math.max(...freqs, 1);
  const maxR = Math.max(...roass, medianRoas, 1);
  const maxI = Math.max(...imps, 1);

  const pts = buckets.map((b, i) => ({
    x: pad.left + (b.frequency / maxF) * iW,
    y: pad.top + iH - (b.roas / maxR) * iH,
    r: 6 + (b.impressions / maxI) * 18,
  }));

  const medY = medianRoas > 0 ? pad.top + iH - (medianRoas / maxR) * iH : 0;

  return (
    <div>
      <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-2">Częstotliwość vs ROAS</h4>
      <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHover(null)}>
        {medianRoas > 0 && (
          <line x1={pad.left} y1={medY} x2={pad.left + iW} y2={medY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? p.r + 3 : p.r}
            fill={roass[i] >= (medianRoas || 4) ? '#4ade80' : '#f87171'} opacity={hover === i ? 0.9 : 0.5}
            stroke={hover === i ? 'white' : 'none'} strokeWidth={2}
            onMouseEnter={() => setHover(i)} className="cursor-pointer" />
        ))}
        {/* Axis labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="600">Częstotliwość →</text>
        <text x={pad.left - 8} y={pad.top + 4} textAnchor="end" fill="#9ca3af" fontSize="9">ROAS</text>
        {hover !== null && (
          <Tooltip x={pts[hover].x} y={pts[hover].y} visible={true} lines={[
            `Freq: ${freqs[hover].toFixed(1)}`,
            `ROAS: ${roass[hover].toFixed(1)}x`,
            `Impressions: ${imps[hover].toLocaleString()}`,
          ]} />
        )}
      </svg>
      <div className="flex gap-4 mt-1 text-sm font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" /><span className="text-gray-300">ROAS ≥ mediana</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="text-gray-300">ROAS &lt; mediana</span></span>
        <span className="text-gray-500 text-xs">Rozmiar = impressions</span>
      </div>
    </div>
  );
}

// ─── Chart 3: Social Proof vs ROAS ───

function SocialProofChart({ creative }: ChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const buckets = creative.weeklyBuckets.filter(b => b.spend > 0);
  if (buckets.length < 2) return null;

  const W = 480, H = 200, pad = { top: 15, right: 55, bottom: 30, left: 45 };
  const iW = W - pad.left - pad.right, iH = H - pad.top - pad.bottom;

  // Cumulative engagement per week (approximation from total)
  const totalEng = creative.engagement.reactions + creative.engagement.comments + creative.engagement.shares;
  const weeklyEng = buckets.map(b => {
    const weekFrac = b.impressions / Math.max(creative.impressions, 1);
    return Math.round(totalEng * weekFrac);
  });

  let cumulative = 0;
  const cumEngagement = weeklyEng.map(e => { cumulative += e; return cumulative; });
  const maxCum = Math.max(...cumEngagement, 1);
  const maxR = Math.max(...buckets.map(b => b.roas), 1);

  const engPts = cumEngagement.map((e, i) => ({
    x: pad.left + (i / (buckets.length - 1)) * iW,
    y: pad.top + iH - (e / maxCum) * iH,
  }));
  const roasPts = buckets.map((b, i) => ({
    x: pad.left + (i / (buckets.length - 1)) * iW,
    y: pad.top + iH - (b.roas / maxR) * iH,
  }));

  const engArea = `M${engPts[0].x},${pad.top + iH} ` +
    engPts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${engPts[engPts.length - 1].x},${pad.top + iH} Z`;
  const roasPath = roasPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div>
      <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-2">Social Proof vs Performance</h4>
      <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHover(null)}>
        <path d={engArea} fill="#3b82f6" opacity={0.15} />
        <path d={engPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')}
          fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
        <path d={roasPath} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {roasPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 5 : 3} fill="#ef4444"
            onMouseEnter={() => setHover(i)} className="cursor-pointer" />
        ))}
        {buckets.map((_, i) => {
          const x = pad.left + (i / (buckets.length - 1)) * iW;
          return <text key={i} x={x} y={H - 8} textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="600">
            {new Date(buckets[i].dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
          </text>;
        })}
        <text x={pad.left - 8} y={pad.top + 4} textAnchor="end" fill="#60a5fa" fontSize="9">Eng.</text>
        <text x={W - 4} y={pad.top + 4} textAnchor="start" fill="#ef4444" fontSize="9">ROAS</text>
        {hover !== null && (
          <Tooltip x={roasPts[hover].x} y={roasPts[hover].y} visible={true} lines={[
            `Engagement: ${cumEngagement[hover]}`,
            `ROAS: ${buckets[hover].roas.toFixed(1)}x`,
            `Tydzień ${hover + 1}`,
          ]} />
        )}
      </svg>
      <div className="flex gap-4 mt-1 text-sm font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/40" /><span className="text-gray-300">Engagement (kumulatywny)</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="text-gray-300">ROAS</span></span>
      </div>
    </div>
  );
}

// ─── Main export ───

export default function CreativeCharts({ creative, medianRoas }: ChartProps) {
  return (
    <div className="space-y-6 mt-4">
      <RoasSpendChart creative={creative} medianRoas={medianRoas} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FrequencyRoasChart creative={creative} medianRoas={medianRoas} />
        <SocialProofChart creative={creative} />
      </div>
    </div>
  );
}
