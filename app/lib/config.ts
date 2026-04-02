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
  cpc: number;
  conversions: number;
  revenue: number;
}

export interface VideoRetention {
  plays: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  p100: number;
  avgWatchSeconds: number;
  thruPlays: number;
  threeSecViews: number;
  hookRate: number;       // 3s views / impressions
  holdRate: number;       // thruplay / 3s views
  costPerThruPlay: number;
}

export interface SocialEngagement {
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  engagementScore: number;
}

export interface CQI {
  score: number;          // 0-100
  grade: string;          // A+, A, B+, etc.
  label: string;          // Wyjątkowa, Mocna, etc.
  confidence: 'low' | 'medium' | 'high';
  pillars: {
    performance: number;
    hookStrength: number;
    storytelling: number;
    engagement: number;
    durability: number;
  };
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
  cpc: number;
  cpm: number;
  roas: number;
  conversions: number;
  revenue: number;
  frequency: number;
  // Media
  thumbnailUrl: string;
  videoUrl: string | null;
  imageUrl: string | null;
  // Product
  product: string;
  productOverride: string | null;
  // Traffic light
  trafficLight: TrafficLightStatus;
  trafficLightLabel: string;
  // Lifecycle
  lifecycleStage: LifecycleStage;
  // Trend data
  weeklyBuckets: WeeklyBucket[];
  // Video retention
  videoRetention: VideoRetention | null;
  // Social engagement
  engagement: SocialEngagement;
  engagementQuadrant: EngagementQuadrant;
  // Creative Quality Index
  cqi: CQI;
  // Meta rankings
  qualityRanking: string;
  engagementRanking: string;
  conversionRanking: string;
  // Link metrics
  inlineLinkClicks: number;
  inlineLinkCtr: number;
  outboundClicks: number;
  outboundCtr: number;
}
