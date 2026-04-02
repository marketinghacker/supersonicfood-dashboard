import { META_BASE_URL } from './config';
import { getTrafficLight } from './traffic-light';
import { getProductName } from './product-mapper';
import type { Creative } from './config';

const TOKEN = process.env.META_SYSTEM_TOKEN!;
const ACCOUNT_ID = process.env.META_ACCOUNT_ID!;

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(days: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - days);
  return { since: formatDate(since), until: formatDate(until) };
}

interface MetaInsight {
  ad_id: string;
  ad_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
}

interface MetaCreativeData {
  id: string;
  object_story_spec?: {
    link_data?: {
      link?: string;
      message?: string;
      call_to_action?: { value?: { link?: string } };
    };
    video_data?: {
      video_id?: string;
      message?: string;
      call_to_action?: { value?: { link?: string } };
      image_url?: string;
    };
  };
  thumbnail_url?: string;
  image_url?: string;
  asset_feed_spec?: {
    videos?: Array<{ video_id: string; thumbnail_url?: string }>;
    bodies?: Array<{ text: string }>;
    links?: Array<{ link: string }>;
  };
}

interface MetaVideoData {
  source?: string;
  thumbnails?: { data?: Array<{ uri: string }> };
}

async function metaGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${META_BASE_URL}${path}`);
  url.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function fetchAllInsights(days: number): Promise<MetaInsight[]> {
  const { since, until } = getDateRange(days);
  const allInsights: MetaInsight[] = [];
  let url: string | null = `${META_BASE_URL}/${ACCOUNT_ID}/insights`;

  const params = new URLSearchParams({
    access_token: TOKEN,
    level: 'ad',
    filtering: JSON.stringify([{ field: 'ad.effective_status', operator: 'IN', value: ['ACTIVE'] }]),
    fields: 'ad_id,ad_name,spend,impressions,clicks,ctr,actions,action_values',
    time_range: JSON.stringify({ since, until }),
    limit: '500',
  });

  while (url) {
    const fullUrl: string = url.includes('?') ? url : `${url}?${params.toString()}`;
    const res = await fetch(fullUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta API error ${res.status}: ${err}`);
    }
    const json = await res.json();
    allInsights.push(...(json.data || []));
    url = json.paging?.next || null;
  }

  return allInsights;
}

async function fetchCreativeDetails(adIds: string[]): Promise<Map<string, { thumbnailUrl: string; videoUrl: string | null; imageUrl: string | null; adCopy: string; destinationUrl: string }>> {
  const result = new Map<string, { thumbnailUrl: string; videoUrl: string | null; imageUrl: string | null; adCopy: string; destinationUrl: string }>();

  // Batch in groups of 50
  for (let i = 0; i < adIds.length; i += 50) {
    const batch = adIds.slice(i, i + 50);
    const batchRequests = batch.map(adId => ({
      method: 'GET',
      relative_url: `${adId}/adcreatives?fields=object_story_spec,thumbnail_url,image_url,asset_feed_spec`,
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
        const creative: MetaCreativeData | undefined = body.data?.[0];
        if (!creative) continue;

        const adId = batch[j];
        let thumbnailUrl = creative.thumbnail_url || creative.image_url || '';
        let videoUrl: string | null = null;
        let imageUrl: string | null = creative.image_url || null;
        let adCopy = '';
        let destinationUrl = '';

        const storySpec = creative.object_story_spec;
        if (storySpec?.video_data) {
          const vd = storySpec.video_data;
          adCopy = vd.message || '';
          destinationUrl = vd.call_to_action?.value?.link || '';
          if (vd.image_url) thumbnailUrl = vd.image_url;
          // We'll fetch video source URL separately
          if (vd.video_id) {
            videoUrl = vd.video_id; // placeholder, will resolve later
          }
        } else if (storySpec?.link_data) {
          const ld = storySpec.link_data;
          adCopy = ld.message || '';
          destinationUrl = ld.link || ld.call_to_action?.value?.link || '';
        }

        if (creative.asset_feed_spec) {
          const afs = creative.asset_feed_spec;
          if (!adCopy && afs.bodies?.length) {
            adCopy = afs.bodies.map(b => b.text).join(' | ');
          }
          if (!destinationUrl && afs.links?.length) {
            destinationUrl = afs.links[0].link;
          }
          if (afs.videos?.length && afs.videos[0].thumbnail_url) {
            thumbnailUrl = afs.videos[0].thumbnail_url;
          }
        }

        result.set(adId, { thumbnailUrl, videoUrl, imageUrl, adCopy, destinationUrl });
      }
    } catch {
      // Continue on batch errors
    }
  }

  // Resolve video URLs for video IDs
  const videoIds = new Set<string>();
  for (const [, data] of result) {
    if (data.videoUrl && !data.videoUrl.startsWith('http')) {
      videoIds.add(data.videoUrl);
    }
  }

  if (videoIds.size > 0) {
    const videoMap = new Map<string, string>();
    const videoIdArr = Array.from(videoIds);

    for (let i = 0; i < videoIdArr.length; i += 50) {
      const batch = videoIdArr.slice(i, i + 50);
      const batchRequests = batch.map(vid => ({
        method: 'GET',
        relative_url: `${vid}?fields=source`,
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
          if (batchJson[j].code === 200) {
            const body: MetaVideoData = JSON.parse(batchJson[j].body);
            if (body.source) {
              videoMap.set(batch[j], body.source);
            }
          }
        }
      } catch {
        // Continue on batch errors
      }
    }

    for (const [adId, data] of result) {
      if (data.videoUrl && videoMap.has(data.videoUrl)) {
        data.videoUrl = videoMap.get(data.videoUrl)!;
      } else if (data.videoUrl && !data.videoUrl.startsWith('http')) {
        data.videoUrl = null;
      }
    }
  }

  return result;
}

export async function fetchDashboardData(days: number): Promise<Creative[]> {
  const insights = await fetchAllInsights(days);

  const adIds = insights.map(i => i.ad_id);
  const creativeDetails = await fetchCreativeDetails(adIds);

  return insights.map(insight => {
    const spend = parseFloat(insight.spend) || 0;
    const impressions = parseInt(insight.impressions) || 0;
    const clicks = parseInt(insight.clicks) || 0;
    const ctr = parseFloat(insight.ctr) || 0;

    const purchaseActions = insight.actions?.find(a => a.action_type === 'purchase') ||
      insight.actions?.find(a => a.action_type === 'omni_purchase');
    const conversions = purchaseActions ? parseInt(purchaseActions.value) : 0;

    const purchaseValues = insight.action_values?.find(a => a.action_type === 'purchase') ||
      insight.action_values?.find(a => a.action_type === 'omni_purchase');
    const revenue = purchaseValues ? parseFloat(purchaseValues.value) : 0;

    const roas = spend > 0 ? revenue / spend : 0;
    const { status: trafficLight, label: trafficLightLabel } = getTrafficLight(roas, spend, impressions);

    const details = creativeDetails.get(insight.ad_id);
    const product = details ? getProductName(details.destinationUrl) : 'Katalog ogólny';

    return {
      id: insight.ad_id,
      name: insight.ad_name,
      status: 'ACTIVE',
      spend,
      impressions,
      clicks,
      ctr,
      roas,
      conversions,
      revenue,
      thumbnailUrl: details?.thumbnailUrl || '',
      videoUrl: details?.videoUrl || null,
      imageUrl: details?.imageUrl || null,
      adCopy: details?.adCopy || '',
      product,
      trafficLight,
      trafficLightLabel,
    };
  });
}
