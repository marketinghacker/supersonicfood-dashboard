import type { Creative, CQI } from './config';

// Sigmoid normalizer: median=50, 2x median≈82, 0.5x median≈18
function norm(value: number, median: number, higherBetter = true): number {
  if (median <= 0) return 50;
  const ratio = higherBetter ? value / median : median / Math.max(value, 0.001);
  return Math.max(0, Math.min(100, 100 / (1 + Math.exp(-3.5 * (ratio - 1)))));
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

interface Benchmarks {
  roas: number;
  ctr: number;
  cpc: number;
  hookRate: number;
  thruPlayRate: number;
  p25: number;
  p50: number;
  p75: number;
  sharesPerMil: number;
  savesPerMil: number;
  commentsPerMil: number;
  reactionsPerMil: number;
}

export function computeBenchmarks(creatives: Creative[]): Benchmarks {
  const valid = creatives.filter(c => c.spend >= 200 && c.impressions >= 1000);
  return {
    roas: median(valid.map(c => c.roas)),
    ctr: median(valid.map(c => c.ctr)),
    cpc: median(valid.filter(c => c.cpc > 0).map(c => c.cpc)),
    hookRate: median(valid.filter(c => c.videoRetention).map(c => c.videoRetention!.hookRate)),
    thruPlayRate: median(valid.filter(c => c.videoRetention && c.impressions > 0).map(c => c.videoRetention!.thruPlays / c.impressions)),
    p25: median(valid.filter(c => c.videoRetention && c.videoRetention.plays > 0).map(c => c.videoRetention!.p25 / c.videoRetention!.plays)),
    p50: median(valid.filter(c => c.videoRetention && c.videoRetention.plays > 0).map(c => c.videoRetention!.p50 / c.videoRetention!.plays)),
    p75: median(valid.filter(c => c.videoRetention && c.videoRetention.plays > 0).map(c => c.videoRetention!.p75 / c.videoRetention!.plays)),
    sharesPerMil: median(valid.filter(c => c.impressions > 0).map(c => (c.engagement.shares / c.impressions) * 1000)),
    savesPerMil: median(valid.filter(c => c.impressions > 0).map(c => (c.engagement.saves / c.impressions) * 1000)),
    commentsPerMil: median(valid.filter(c => c.impressions > 0).map(c => (c.engagement.comments / c.impressions) * 1000)),
    reactionsPerMil: median(valid.filter(c => c.impressions > 0).map(c => (c.engagement.reactions / c.impressions) * 1000)),
  };
}

export function calculateCQI(c: Creative, b: Benchmarks): CQI {
  // Not enough data
  if (c.spend < 50 || c.impressions < 500) {
    return { score: 0, grade: '-', label: 'Brak danych', confidence: 'low', pillars: { performance: 0, hookStrength: 0, storytelling: 0, engagement: 0, durability: 0 } };
  }

  // PILLAR 1: Performance (40%)
  const roasScore = norm(c.roas, b.roas);
  const ctrScore = norm(c.ctr, b.ctr);
  const cpcScore = norm(c.cpc, b.cpc, false);
  const performance = roasScore * 0.65 + ctrScore * 0.20 + cpcScore * 0.15;

  // PILLAR 2: Hook Strength (15%)
  let hookStrength = 50;
  if (c.videoRetention) {
    const hookScore = norm(c.videoRetention.hookRate, b.hookRate);
    const p25Score = c.videoRetention.plays > 0
      ? norm(c.videoRetention.p25 / c.videoRetention.plays, b.p25)
      : 50;
    hookStrength = hookScore * 0.60 + p25Score * 0.40;
  }

  // PILLAR 3: Storytelling (15%)
  let storytelling = 50;
  if (c.videoRetention && c.videoRetention.plays > 0) {
    const p50Score = norm(c.videoRetention.p50 / c.videoRetention.plays, b.p50);
    const p75Score = norm(c.videoRetention.p75 / c.videoRetention.plays, b.p75);
    const thruPlayRate = c.impressions > 0 ? c.videoRetention.thruPlays / c.impressions : 0;
    const thruPlayScore = norm(thruPlayRate, b.thruPlayRate);
    const retentionShape = c.videoRetention.p25 > 0 ? c.videoRetention.p75 / c.videoRetention.p25 : 0;
    const shapeScore = Math.max(0, Math.min(100, (retentionShape - 0.1) * 200));
    storytelling = p50Score * 0.30 + p75Score * 0.25 + thruPlayScore * 0.25 + shapeScore * 0.20;
  }

  // PILLAR 4: Engagement (10%)
  const imp = c.impressions || 1;
  const sharesScore = norm((c.engagement.shares / imp) * 1000, b.sharesPerMil);
  const savesScore = norm((c.engagement.saves / imp) * 1000, b.savesPerMil);
  const commentsScore = norm((c.engagement.comments / imp) * 1000, b.commentsPerMil);
  const reactionsScore = norm((c.engagement.reactions / imp) * 1000, b.reactionsPerMil);
  const engagement = sharesScore * 0.35 + savesScore * 0.30 + commentsScore * 0.20 + reactionsScore * 0.15;

  // PILLAR 5: Durability (20%)
  const activeBuckets = c.weeklyBuckets.filter(b => b.spend > 0);
  let trendScore = 50;
  if (activeBuckets.length >= 3) {
    const rv = activeBuckets.map(b => b.roas);
    const n = rv.length;
    const xMean = (n - 1) / 2;
    const yMean = rv.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (i - xMean) * (rv[i] - yMean); den += (i - xMean) ** 2; }
    const slope = den !== 0 ? num / den : 0;
    const slopeRatio = yMean !== 0 ? slope / yMean : 0;
    trendScore = Math.max(0, Math.min(100, 60 + slopeRatio * 300));
  }

  let freqScore = 100;
  if (c.frequency > 2) freqScore = Math.max(0, 100 - (c.frequency - 2) * 20);

  let scaleScore = 50;
  if (activeBuckets.length >= 3) {
    const rs = activeBuckets.slice(-3).map(b => b.spend);
    const rr = activeBuckets.slice(-3).map(b => b.roas);
    const spendUp = rs[2] > rs[0] * 1.1;
    const roasOk = rr[2] >= rr[0] * 0.85;
    if (spendUp && roasOk) scaleScore = 85;
    else if (spendUp && !roasOk) scaleScore = 30;
    else if (!spendUp && roasOk) scaleScore = 60;
  }

  const lcMod: Record<string, number> = { ramping: 0, scaling: 5, peak: 0, fatiguing: -15, burned: -30, new: 0 };
  const durability = Math.max(0, Math.min(100,
    trendScore * 0.40 + freqScore * 0.30 + scaleScore * 0.30 + (lcMod[c.lifecycleStage] ?? 0)
  ));

  const raw = performance * 0.40 + hookStrength * 0.15 + storytelling * 0.15 + engagement * 0.10 + durability * 0.20;
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  let confidence: 'low' | 'medium' | 'high' = 'high';
  if (c.spend < 50 || activeBuckets.length < 2) confidence = 'low';
  else if (c.spend < 500 || activeBuckets.length < 4) confidence = 'medium';

  return {
    score,
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C+' : score >= 40 ? 'C' : score >= 30 ? 'D' : 'F',
    label: score >= 90 ? 'Wyjątkowa' : score >= 80 ? 'Mocna' : score >= 70 ? 'Dobra' : score >= 60 ? 'Solidna' : score >= 50 ? 'Przeciętna' : score >= 40 ? 'Słaba' : score >= 30 ? 'Kiepska' : 'Krytyczna',
    confidence,
    pillars: {
      performance: Math.round(performance),
      hookStrength: Math.round(hookStrength),
      storytelling: Math.round(storytelling),
      engagement: Math.round(engagement),
      durability: Math.round(durability),
    },
  };
}
