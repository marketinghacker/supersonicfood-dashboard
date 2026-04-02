'use client';

import type { LifecycleStage, TrafficLightStatus } from '../lib/config';

const LIFECYCLE_CONFIG: Record<LifecycleStage, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  new: { emoji: '🆕', label: 'Nowa', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ramping: { emoji: '🚀', label: 'Rośnie', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  scaling: { emoji: '📈', label: 'Skaluje', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  peak: { emoji: '⭐', label: 'Peak', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  fatiguing: { emoji: '📉', label: 'Wypalanie', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  burned: { emoji: '🔥', label: 'Wypalona', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const TRAFFIC_COLORS: Record<TrafficLightStatus, string> = {
  super: 'text-amber-400',
  good: 'text-green-400',
  watch: 'text-yellow-400',
  bad: 'text-red-400',
  no_data: 'text-gray-400',
};

interface LifecycleBadgeProps {
  stage: LifecycleStage;
  trafficLight: TrafficLightStatus;
  roas: number;
  spend: number;
}

export default function LifecycleBadge({ stage, trafficLight, roas, spend }: LifecycleBadgeProps) {
  const cfg = LIFECYCLE_CONFIG[stage];

  return (
    <div className="flex items-center gap-2">
      {/* Lifecycle */}
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
        <span>{cfg.emoji}</span>
        <span>{cfg.label}</span>
      </span>

      {/* ROAS value */}
      {spend >= 200 && (
        <span className={`text-xs font-bold ${TRAFFIC_COLORS[trafficLight]}`}>
          ROAS {roas.toFixed(1)}x
        </span>
      )}
      {spend < 200 && (
        <span className="text-xs text-gray-500">Za mało danych</span>
      )}
    </div>
  );
}
