export const META_API_VERSION = 'v21.0';
export const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export const ROAS_THRESHOLDS = {
  SUPER: 6.0,
  GOOD: 5.0,
  WATCH: 4.0,
} as const;

export const MIN_SPEND = 200; // PLN
export const MIN_IMPRESSIONS = 1000;

export const PERIODS = [
  { label: '7 dni', days: 7 },
  { label: '14 dni', days: 14 },
  { label: '30 dni', days: 30 },
  { label: '60 dni', days: 60 },
] as const;

export type Period = (typeof PERIODS)[number];

export type TrafficLightStatus = 'super' | 'good' | 'watch' | 'bad' | 'no_data';

export interface Creative {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas: number;
  conversions: number;
  revenue: number;
  thumbnailUrl: string;
  videoUrl: string | null;
  imageUrl: string | null;
  adCopy: string;
  product: string;
  trafficLight: TrafficLightStatus;
  trafficLightLabel: string;
}
