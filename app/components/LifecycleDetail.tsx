'use client';

import { useState, useRef, useEffect } from 'react';
import type { LifecycleStage, TrafficLightStatus, WeeklyBucket } from '../lib/config';

const LIFECYCLE_CONFIG: Record<LifecycleStage, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  new: { emoji: '🆕', label: 'Nowa', color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  ramping: { emoji: '🚀', label: 'Rośnie', color: 'text-cyan-300', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
  scaling: { emoji: '📈', label: 'Skaluje', color: 'text-green-300', bg: 'bg-green-500/15', border: 'border-green-500/30' },
  peak: { emoji: '⭐', label: 'Peak', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  fatiguing: { emoji: '📉', label: 'Wypalanie', color: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  burned: { emoji: '🔥', label: 'Wypalona', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/30' },
};

const TRAFFIC_COLORS: Record<TrafficLightStatus, string> = {
  super: 'text-amber-300', good: 'text-green-300', watch: 'text-yellow-300', bad: 'text-red-300', no_data: 'text-gray-300',
};

function getExplanation(stage: LifecycleStage, buckets: WeeklyBucket[], spend: number): string {
  const active = buckets.filter(b => b.spend > 0);
  const recent = active.slice(-3);
  const roas = recent.map(b => b.roas);

  switch (stage) {
    case 'new': return spend < 200
      ? `Spend ${spend.toFixed(0)} PLN < 200 PLN minimum. Za mało danych.`
      : `Mniej niż 2 tygodnie aktywnych danych (${active.length}).`;
    case 'ramping': return roas.length >= 2
      ? `ROAS rośnie: ${roas.map(r => r.toFixed(1) + 'x').join(' → ')}. Spend się zwiększa.`
      : 'Trend ROAS wzrostowy.';
    case 'scaling': return `Stabilny ROAS przy spendzie ${spend.toFixed(0)} PLN (>5000 PLN).`;
    case 'peak': return `Najwyższy ROAS (${Math.max(...roas).toFixed(1)}x) był wcześniej. Kreacja mogła osiągnąć szczyt.`;
    case 'fatiguing': return `ROAS spada: ${roas.map(r => r.toFixed(1) + 'x').join(' → ')}. Trend spadkowy.`;
    case 'burned': return `ROAS poniżej 4.0x przez ${roas.filter(r => r < 4).length} z ${roas.length} ostatnich tygodni.`;
  }
}

interface Props {
  stage: LifecycleStage;
  trafficLight: TrafficLightStatus;
  roas: number;
  spend: number;
  weeklyBuckets: WeeklyBucket[];
}

export default function LifecycleDetail({ stage, trafficLight, roas, spend, weeklyBuckets }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = LIFECYCLE_CONFIG[stage];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const active = weeklyBuckets.filter(b => b.spend > 0);

  // Chart
  const cW = 460, cH = 150;
  const pad = { top: 20, right: 20, bottom: 28, left: 20 };
  const iW = cW - pad.left - pad.right, iH = cH - pad.top - pad.bottom;

  const rv = active.map(b => b.roas);
  const sv = active.map(b => b.spend);
  const maxR = Math.max(...rv, 1), minR = Math.min(...rv, 0), rng = maxR - minR || 1;
  const maxS = Math.max(...sv, 1);

  const pts = rv.map((r, i) => ({
    x: pad.left + (rv.length > 1 ? (i / (rv.length - 1)) * iW : iW / 2),
    y: pad.top + iH - ((r - minR) / rng) * iH, v: r,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const bW = iW / Math.max(rv.length, 1) * 0.5;

  return (
    <div className="relative inline-flex" ref={ref}>
      <button onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-2 cursor-pointer group">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold border transition-all ${cfg.bg} ${cfg.border} ${cfg.color} group-hover:ring-2 group-hover:ring-white/20`}>
          <span>{cfg.emoji}</span><span>{cfg.label}</span>
          <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {spend >= 200 ? (
          <span className={`text-base font-black ${TRAFFIC_COLORS[trafficLight]}`}>ROAS {roas.toFixed(1)}x</span>
        ) : (
          <span className="text-sm font-semibold text-gray-300">Za mało danych</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[calc(100vw-2rem)] md:w-[500px] bg-gray-900 border-2 border-gray-600 rounded-xl shadow-2xl shadow-black/50 p-5 space-y-4"
          onClick={e => e.stopPropagation()}>
          {/* Why */}
          <div>
            <h4 className="text-base font-black text-white mb-2">{cfg.emoji} Dlaczego: {cfg.label}?</h4>
            <p className="text-base text-gray-200 font-medium">{getExplanation(stage, weeklyBuckets, spend)}</p>
          </div>

          {/* Chart */}
          {active.length >= 2 && (
            <div>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Trend ROAS + Spend</h4>
              <svg width={cW} height={cH} className="w-full" viewBox={`0 0 ${cW} ${cH}`}>
                {/* Threshold lines */}
                {[4.0, 5.0, 6.0].filter(t => t >= minR && t <= maxR).map(t => {
                  const y = pad.top + iH - ((t - minR) / rng) * iH;
                  return (
                    <g key={t}>
                      <line x1={pad.left} y1={y} x2={pad.left + iW} y2={y} stroke="#6b7280" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
                      <text x={pad.left + iW + 4} y={y + 4} fill="#9ca3af" fontSize="11" fontWeight="600">{t}x</text>
                    </g>
                  );
                })}
                {/* Spend bars */}
                {sv.map((s, i) => {
                  const x = pad.left + (sv.length > 1 ? (i / (sv.length - 1)) * iW : iW / 2);
                  const h = (s / maxS) * (iH * 0.4);
                  return <rect key={i} x={x - bW / 2} y={cH - pad.bottom - h} width={bW} height={h} fill="#3b82f6" opacity={0.2} rx={2} />;
                })}
                {/* ROAS line */}
                <path d={path} fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {/* Points */}
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={4} fill="#4ade80" />
                    <text x={p.x} y={p.y - 8} textAnchor="middle" fill="white" fontSize="11" fontWeight="800">{p.v.toFixed(1)}x</text>
                  </g>
                ))}
                {/* Week labels */}
                {active.map((b, i) => {
                  const x = pad.left + (active.length > 1 ? (i / (active.length - 1)) * iW : iW / 2);
                  return <text key={i} x={x} y={cH - 6} textAnchor="middle" fill="#d1d5db" fontSize="10" fontWeight="600">
                    {new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                  </text>;
                })}
              </svg>
              <div className="flex items-center gap-4 mt-2 text-sm font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" /><span className="text-gray-300">ROAS</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/40" /><span className="text-gray-300">Spend</span></span>
              </div>
            </div>
          )}

          {/* Correlation table */}
          {active.length >= 2 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gray-300 font-bold border-b border-gray-700">
                  <th className="text-left py-1.5">Tydzień</th><th className="text-right py-1.5 px-2">Spend</th>
                  <th className="text-right py-1.5 px-2">ROAS</th><th className="text-right py-1.5 px-2">Zmiana</th>
                </tr></thead>
                <tbody>{active.map((b, i) => {
                  const prev = i > 0 ? active[i - 1].roas : null;
                  const ch = prev !== null ? b.roas - prev : null;
                  return (
                    <tr key={i} className="border-b border-gray-800 text-gray-200">
                      <td className="py-1.5 text-gray-400 font-semibold">{new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</td>
                      <td className="text-right py-1.5 px-2 font-semibold">{b.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</td>
                      <td className={`text-right py-1.5 px-2 font-black ${b.roas >= 6 ? 'text-amber-300' : b.roas >= 5 ? 'text-green-300' : b.roas >= 4 ? 'text-yellow-300' : 'text-red-300'}`}>{b.roas.toFixed(1)}x</td>
                      <td className={`text-right py-1.5 px-2 font-bold ${ch === null ? 'text-gray-500' : ch > 0 ? 'text-green-400' : ch < 0 ? 'text-red-400' : 'text-gray-400'}`}>{ch === null ? '-' : `${ch > 0 ? '+' : ''}${ch.toFixed(1)}x`}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
