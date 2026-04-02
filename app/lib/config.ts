export const META_API_VERSION = 'v21.0';
export const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export const ROAS_THRESHOLDS = {
  SUPER: 6.0,
  GOOD: 5.0,
  WATCH: 4.0,
} as const;

export const MIN_SPEND = 200; // PLN
export const MIN_IMPRESSIONS = 1000;

export type TrafficLightStatus = 'super' | 'good' | 'watch' | 'bad' | 'no_data';

export type LifecycleStage = 'ramping' | 'scaling' | 'peak' | 'fatiguing' | 'burned' | 'new';

export type CreativeType = 'video' | 'image' | 'carousel' | 'unknown';

export type EngagementQuadrant = 'viral_winner' | 'engagement_trap' | 'silent_converter' | 'needs_work' | 'no_data';

export interface WeeklyBucket {
  dateStart: string;
  dateStop: string;
  spend: number;
  roas: number;
  impressions: number;
  cpm: number;
  ctr: number;
  conversions: number;
  revenue: number;
}

export interface VideoRetention {
  plays: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  avgWatchSeconds: number;
}

export interface SocialEngagement {
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  engagementScore: number; // (reactions + comments*3 + shares*5) / impressions * 1000
}

export interface Creative {
  id: string;
  name: string;
  status: string;
  creativeType: CreativeType;
  // Totals (last 60 days)
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas: number;
  conversions: number;
  revenue: number;
  // Media
  thumbnailUrl: string;
  videoUrl: string | null;
  imageUrl: string | null;
  // Product
  product: string;
  productOverride: string | null;
  // Traffic light (based on total ROAS)
  trafficLight: TrafficLightStatus;
  trafficLightLabel: string;
  // Lifecycle (based on trend)
  lifecycleStage: LifecycleStage;
  // Trend data
  weeklyBuckets: WeeklyBucket[];
  // Video retention
  videoRetention: VideoRetention | null;
  // Social engagement
  engagement: SocialEngagement;
  engagementQuadrant: EngagementQuadrant;
}
