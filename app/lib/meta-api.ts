import { META_BASE_URL } from './config';
import { getTrafficLight } from './traffic-light';
import { getProductName } from './product-mapper';
import type {
  Creative, WeeklyBucket, VideoRetention, SocialEngagement,
  CreativeType, LifecycleStage, EngagementQuadrant,
} from './config';

const TOKEN = process.env.META_SYSTEM_TOKEN!;
const ACCOUNT_ID = process.env.META_ACCOUNT_ID!;

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseActionValue(actions: Array<{ action_type: string; value: string }> | undefined, type: string): number {
  if (!actions) return 0;
  const found = actions.find(a => a.action_type === type);
  return found ? parseFloat(found.value) : 0;
}

function parseActionValueMulti(actions: Array<{ action_type: string; value: string }> | undefined, types: string[]): number {
  if (!actions) return 0;
  for (const t of types) {
    const found = actions.find(a => a.action_type === t);
    if (found) return parseFloat(found.value);
  }
  return 0;
}

// ─── Fetch weekly bucketed insights (time_increment=7, last 60 days) ───

interface RawInsight {
  ad_id: string;
  ad_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpm: string;
  frequency?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  video_play_actions?: Array<{ action_type: string; value: string }>;
  video_p25_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p50_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p75_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p95_watched_actions?: Array<{ action_type: string; value: string }>;
  video_avg_time_watched_actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

async function fetchWeeklyInsights(): Promise<RawInsight[]> {
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const allInsights: RawInsight[] = [];
  let nextUrl: string | null = null;
  const baseUrl = `${META_BASE_URL}/${ACCOUNT_ID}/insights`;

  const params = new URLSearchParams({
    access_token: TOKEN,
    level: 'ad',
    filtering: JSON.stringify([{ field: 'ad.effective_status', operator: 'IN', value: ['ACTIVE'] }]),
    fields: [
      'ad_id', 'ad_name', 'spend', 'impressions', 'clicks', 'ctr', 'cpm',
      'actions', 'action_values',
      'video_play_actions', 'video_p25_watched_actions', 'video_p50_watched_actions',
      'video_p75_watched_actions', 'video_p95_watched_actions', 'video_avg_time_watched_actions',
    ].join(','),
    time_range: JSON.stringify({ since: formatDate(since), until: formatDate(until) }),
    time_increment: '7',
    limit: '500',
  });

  let isFirstRequest = true;

  while (isFirstRequest || nextUrl) {
    const fetchUrl: string = isFirstRequest ? `${baseUrl}?${params.toString()}` : nextUrl!;
    isFirstRequest = false;

    const res = await fetch(fetchUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta API error ${res.status}: ${err}`);
    }
    const json = await res.json();
    allInsights.push(...(json.data || []));
    nextUrl = json.paging?.next || null;
  }

  return allInsights;
}

// ─── Fetch creative details (batch) ───

interface CreativeDetail {
  thumbnailUrl: string;
  videoUrl: string | null;
  imageUrl: string | null;
  destinationUrl: string;
  creativeType: CreativeType;
}

async function fetchCreativeDetails(adIds: string[]): Promise<Map<string, CreativeDetail>> {
  const result = new Map<string, CreativeDetail>();

  for (let i = 0; i < adIds.length; i += 50) {
    const batch = adIds.slice(i, i + 50);
    const batchRequests = batch.map(adId => ({
      method: 'GET',
      relative_url: `${adId}/adcreatives?fields=object_story_spec,thumbnail_url,image_url,asset_feed_spec,video_id`,
    }));

    try {
      const batchRes = await fetch(`${META_BASE_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          access_token: TOKEN,
          batch: JSON.stringify(batchRequests),
        }),
      });

      if (!batchRes.ok) continue;
      const batchJson: Array<{ code: number; body: string }> = await batchRes.json();

      for (let j = 0; j < batchJson.length; j++) {
        const item = batchJson[j];
        if (item.code !== 200) continue;

        const body = JSON.parse(item.body);
        const creative = body.data?.[0];
        if (!creative) continue;

        const adId = batch[j];
        let thumbnailUrl = creative.thumbnail_url || creative.image_url || '';
        let videoUrl: string | null = null;
        let imageUrl: string | null = creative.image_url || null;
        let destinationUrl = '';
        let creativeType: CreativeType = 'unknown';

        const storySpec = creative.object_story_spec;
        const afs = creative.asset_feed_spec;

        // Capture video_id from top-level creative field
        if (creative.video_id) {
          videoUrl = String(creative.video_id);
          creativeType = 'video';
        }

        if (storySpec?.video_data) {
          const vd = storySpec.video_data;
          destinationUrl = vd.call_to_action?.value?.link || '';
          if (vd.image_url) thumbnailUrl = vd.image_url;
          if (vd.video_id && !videoUrl) videoUrl = vd.video_id;
          creativeType = 'video';
        } else if (storySpec?.link_data) {
          const ld = storySpec.link_data;
          destinationUrl = ld.link || ld.call_to_action?.value?.link || '';
          creativeType = 'image';
        }

        if (afs) {
          if (afs.videos?.length > 0) {
            creativeType = 'video';
            if (afs.videos[0].thumbnail_url) thumbnailUrl = afs.videos[0].thumbnail_url;
            // Capture video_id from asset_feed_spec if not already set
            if (!videoUrl && afs.videos[0].video_id) {
              videoUrl = afs.videos[0].video_id;
            }
          } else if (afs.images?.length > 1) {
            creativeType = 'carousel';
          }
          if (!destinationUrl && afs.links?.length) {
            destinationUrl = afs.links[0].link;
          }
        }

        result.set(adId, { thumbnailUrl, videoUrl, imageUrl, destinationUrl, creativeType });
      }
    } catch {
      // Continue on batch errors
    }
  }

  // For videos: store video_id as fb:VIDEO_ID for Facebook embed player
  for (const [, data] of result) {
    if (data.videoUrl && !data.videoUrl.startsWith('http') && !data.videoUrl.startsWith('fb:')) {
      data.videoUrl = `fb:${data.videoUrl}`;
    }
  }

  return result;
}

// ─── Lifecycle stage calculation ───

function calcLifecycleStage(buckets: WeeklyBucket[], totalSpend: number): LifecycleStage {
  if (buckets.length < 2) return 'new';
  if (totalSpend < 200) return 'new'; // Not enough data for lifecycle

  // Only consider weeks with actual spend
  const activeBuckets = buckets.filter(b => b.spend > 0);
  if (activeBuckets.length < 2) return 'new';

  const recent = activeBuckets.slice(-3);
  const roasValues = recent.map(b => b.roas);
  const spendValues = recent.map(b => b.spend);

  const roasTrend = roasValues.length >= 2
    ? roasValues[roasValues.length - 1] - roasValues[0]
    : 0;
  const spendTrend = spendValues.length >= 2
    ? spendValues[spendValues.length - 1] - spendValues[0]
    : 0;

  const avgRoas = roasValues.reduce((a, b) => a + b, 0) / roasValues.length;
  const roasVariance = roasValues.reduce((sum, v) => sum + Math.pow(v - avgRoas, 2), 0) / roasValues.length;
  const isStable = roasVariance < (avgRoas * 0.15) ** 2;

  // Burned: ROAS below 4.0 for 2+ weeks
  if (roasValues.filter(r => r < 4.0).length >= 2 && totalSpend > 500) return 'burned';

  // Fatiguing: ROAS declining 2+ consecutive weeks
  if (roasValues.length >= 3 && roasValues[2] < roasValues[1] && roasValues[1] < roasValues[0]) return 'fatiguing';
  if (roasTrend < -1.0) return 'fatiguing';

  // Peak: highest ROAS was 2+ weeks ago
  const maxRoasIdx = roasValues.indexOf(Math.max(...roasValues));
  if (maxRoasIdx < roasValues.length - 1 && totalSpend > 3000) return 'peak';

  // Scaling: ROAS stable, high spend
  if (isStable && totalSpend > 5000) return 'scaling';

  // Ramping: ROAS trending up or spend increasing
  if (roasTrend > 0.5 || spendTrend > 0) return 'ramping';

  return 'scaling';
}

// ─── Engagement quadrant ───

function calcEngagementQuadrant(
  engScore: number, roas: number,
  medianEngScore: number, medianRoas: number,
  spend: number
): EngagementQuadrant {
  if (spend < 200) return 'no_data';
  const highEng = engScore > medianEngScore;
  const highRoas = roas > medianRoas;
  if (highEng && highRoas) return 'viral_winner';
  if (highEng && !highRoas) return 'engagement_trap';
  if (!highEng && highRoas) return 'silent_converter';
  return 'needs_work';
}

// ─── Main fetch function ───

export async function fetchDashboardData(): Promise<Creative[]> {
  const rawInsights = await fetchWeeklyInsights();

  // Group weekly buckets by ad_id
  const adBuckets = new Map<string, { name: string; rows: RawInsight[] }>();
  for (const row of rawInsights) {
    const existing = adBuckets.get(row.ad_id);
    if (existing) {
      existing.rows.push(row);
    } else {
      adBuckets.set(row.ad_id, { name: row.ad_name, rows: [row] });
    }
  }

  // Fetch creative details
  const adIds = Array.from(adBuckets.keys());
  const creativeDetails = await fetchCreativeDetails(adIds);

  // Build creatives
  const creatives: Creative[] = [];

  for (const [adId, { name, rows }] of adBuckets) {
    // Sort rows by date
    rows.sort((a, b) => a.date_start.localeCompare(b.date_start));

    // Build weekly buckets
    const weeklyBuckets: WeeklyBucket[] = rows.map(r => {
      const spend = parseFloat(r.spend) || 0;
      const revenue = parseActionValueMulti(r.action_values, ['purchase', 'omni_purchase']);
      return {
        dateStart: r.date_start,
        dateStop: r.date_stop,
        spend,
        roas: spend > 0 ? revenue / spend : 0,
        impressions: parseInt(r.impressions) || 0,
        cpm: parseFloat(r.cpm) || 0,
        ctr: parseFloat(r.ctr) || 0,
        conversions: parseActionValueMulti(r.actions, ['purchase', 'omni_purchase']),
        revenue,
      };
    });

    // Aggregate totals
    const totalSpend = weeklyBuckets.reduce((s, b) => s + b.spend, 0);
    const totalImpressions = weeklyBuckets.reduce((s, b) => s + b.impressions, 0);
    const totalClicks = rows.reduce((s, r) => s + (parseInt(r.clicks) || 0), 0);
    const totalRevenue = weeklyBuckets.reduce((s, b) => s + b.revenue, 0);
    const totalConversions = weeklyBuckets.reduce((s, b) => s + b.conversions, 0);
    const totalCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const totalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    // Video retention (aggregate across all weeks)
    const totalPlays = rows.reduce((s, r) => s + parseActionValue(r.video_play_actions, 'video_view'), 0);
    let videoRetention: VideoRetention | null = null;
    if (totalPlays > 0) {
      videoRetention = {
        plays: totalPlays,
        p25: rows.reduce((s, r) => s + parseActionValue(r.video_p25_watched_actions, 'video_view'), 0),
        p50: rows.reduce((s, r) => s + parseActionValue(r.video_p50_watched_actions, 'video_view'), 0),
        p75: rows.reduce((s, r) => s + parseActionValue(r.video_p75_watched_actions, 'video_view'), 0),
        p95: rows.reduce((s, r) => s + parseActionValue(r.video_p95_watched_actions, 'video_view'), 0),
        avgWatchSeconds: rows.reduce((s, r) => s + parseActionValue(r.video_avg_time_watched_actions, 'video_view'), 0) / rows.length,
      };
    }

    // Social engagement
    const reactions = rows.reduce((s, r) => s + parseActionValue(r.actions, 'post_reaction'), 0);
    const comments = rows.reduce((s, r) => s + parseActionValue(r.actions, 'comment'), 0);
    const shares = rows.reduce((s, r) => s + parseActionValue(r.actions, 'post'), 0);
    const saves = rows.reduce((s, r) => s + parseActionValue(r.actions, 'onsite_conversion.post_save'), 0);
    const engagementScore = totalImpressions > 0
      ? ((reactions + comments * 3 + shares * 5) / totalImpressions) * 1000
      : 0;

    const engagement: SocialEngagement = { reactions, comments, shares, saves, engagementScore };

    // Traffic light
    const { status: trafficLight, label: trafficLightLabel } = getTrafficLight(totalRoas, totalSpend, totalImpressions);

    // Lifecycle
    const lifecycleStage = calcLifecycleStage(weeklyBuckets, totalSpend);

    // Creative details
    const details = creativeDetails.get(adId);
    const product = details ? getProductName(details.destinationUrl) : 'Katalog ogólny';

    creatives.push({
      id: adId,
      name,
      status: 'ACTIVE',
      creativeType: details?.creativeType || 'unknown',
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalCtr,
      roas: totalRoas,
      conversions: totalConversions,
      revenue: totalRevenue,
      thumbnailUrl: details?.thumbnailUrl || '',
      videoUrl: details?.videoUrl || null,
      imageUrl: details?.imageUrl || null,
      product,
      productOverride: null,
      trafficLight,
      trafficLightLabel,
      lifecycleStage,
      weeklyBuckets,
      videoRetention,
      engagement,
      engagementQuadrant: 'no_data', // will be computed after median calc
    });
  }

  // Compute engagement quadrant (needs medians)
  const withData = creatives.filter(c => c.spend >= 200);
  if (withData.length > 0) {
    const sortedRoas = [...withData].sort((a, b) => a.roas - b.roas);
    const sortedEng = [...withData].sort((a, b) => a.engagement.engagementScore - b.engagement.engagementScore);
    const medianRoas = sortedRoas[Math.floor(sortedRoas.length / 2)].roas;
    const medianEng = sortedEng[Math.floor(sortedEng.length / 2)].engagement.engagementScore;

    for (const c of creatives) {
      c.engagementQuadrant = calcEngagementQuadrant(
        c.engagement.engagementScore, c.roas, medianEng, medianRoas, c.spend
      );
    }
  }

  return creatives;
}
