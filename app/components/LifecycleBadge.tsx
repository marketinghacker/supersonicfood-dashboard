'use client';

import type { LifecycleStage, TrafficLightStatus } from '../lib/config';

const LIFECYCLE_CONFIG: Record<LifecycleStage, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  new: { emoji: '🆕', label: 'Nowa', color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  ramping: { emoji: '🚀', label: 'Rośnie', color: 'text-cyan-300', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
  scaling: { emoji: '📈', label: 'Skaluje', color: 'text-green-300', bg: 'bg-green-500/15', border: 'border-green-500/30' },
  peak: { emoji: '⭐', label: 'Peak', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  fatiguing: { emoji: '📉', label: 'Wypalanie', color: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  burned: { emoji: '🔥', label: 'Wypalona', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/30' },
};

const TRAFFIC_COLORS: Record<TrafficLightStatus, string> = {
  super: 'text-amber-300',
  good: 'text-green-300',
  watch: 'text-yellow-300',
  bad: 'text-red-300',
  no_data: 'text-gray-300',
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
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
        <span>{cfg.emoji}</span>
        <span>{cfg.label}</span>
      </span>

      {spend >= 200 ? (
        <span className={`text-base font-black ${TRAFFIC_COLORS[trafficLight]}`}>
          ROAS {roas.toFixed(1)}x
        </span>
      ) : (
        <span className="text-sm font-semibold text-gray-300">Za mało danych</span>
      )}
    </div>
  );
}
