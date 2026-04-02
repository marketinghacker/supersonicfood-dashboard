'use client';

import { TRAFFIC_LIGHT_CONFIG } from '../lib/traffic-light';
import type { TrafficLightStatus } from '../lib/config';

export default function TrafficLight({ status, label }: { status: TrafficLightStatus; label: string }) {
  const config = TRAFFIC_LIGHT_CONFIG[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.color}`}>
      <span>{config.emoji}</span>
      <span>{label}</span>
    </div>
  );
}
