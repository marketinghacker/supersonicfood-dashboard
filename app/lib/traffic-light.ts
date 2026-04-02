import { ROAS_THRESHOLDS, MIN_SPEND, MIN_IMPRESSIONS, type TrafficLightStatus } from './config';

interface TrafficLightResult {
  status: TrafficLightStatus;
  label: string;
}

export function getTrafficLight(roas: number, spend: number, impressions: number): TrafficLightResult {
  if (spend < MIN_SPEND || impressions < MIN_IMPRESSIONS) {
    return { status: 'no_data', label: 'Za mało danych' };
  }

  const roasFormatted = roas.toFixed(1);

  if (roas >= ROAS_THRESHOLDS.SUPER) {
    return { status: 'super', label: `SUPER — ROAS ${roasFormatted}x` };
  }
  if (roas >= ROAS_THRESHOLDS.GOOD) {
    return { status: 'good', label: `Dobrze — ROAS ${roasFormatted}x` };
  }
  if (roas >= ROAS_THRESHOLDS.WATCH) {
    return { status: 'watch', label: `Obserwujemy — ROAS ${roasFormatted}x` };
  }
  return { status: 'bad', label: `Źle — ROAS ${roasFormatted}x` };
}

export const TRAFFIC_LIGHT_CONFIG: Record<TrafficLightStatus, { emoji: string; color: string; bg: string; border: string }> = {
  super: { emoji: '🌟', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  good: { emoji: '🟢', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  watch: { emoji: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  bad: { emoji: '🔴', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  no_data: { emoji: '⚪', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
};
