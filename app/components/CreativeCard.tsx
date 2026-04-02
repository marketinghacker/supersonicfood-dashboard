'use client';

import { useState } from 'react';
import type { Creative } from '../lib/config';
import LifecycleDetail from './LifecycleDetail';
import EngagementBadge from './EngagementBadge';
import SparklineChart from './SparklineChart';
import VideoPlayer from './VideoPlayer';
import RetentionCurve from './RetentionCurve';
import AiAnalysis from './AiAnalysis';
import ProductChip from './ProductChip';

const BORDER_COLORS: Record<string, string> = {
  super: 'border-l-amber-400',
  good: 'border-l-green-400',
  watch: 'border-l-yellow-400',
  bad: 'border-l-red-400',
  no_data: 'border-l-gray-500',
};

interface CreativeCardProps {
  creative: Creative;
  onProductOverride: (adId: string, product: string) => void;
}

export default function CreativeCard({ creative, onProductOverride }: CreativeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analyzing || analysis) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creative }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setExpanded(true);
    } catch {
      setAnalysis('Błąd analizy. Spróbuj ponownie.');
    } finally {
      setAnalyzing(false);
    }
  };

  const borderColor = BORDER_COLORS[creative.trafficLight] || 'border-l-gray-500';

  return (
    <div className={`bg-gray-800 border border-gray-600 border-l-4 ${borderColor} rounded-xl overflow-hidden transition-all hover:border-gray-500 hover:bg-gray-700/80 shadow-lg ${expanded ? 'col-span-full' : ''}`}>
      {/* Collapsed view */}
      <div className="flex items-start gap-5 p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Thumbnail */}
        <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
          {creative.thumbnailUrl ? (
            <img src={creative.thumbnailUrl} alt={creative.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-bold">
              {creative.name.split(' ').slice(0, 2).join(' ')}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="text-base font-bold text-white truncate">{creative.name}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* CQI Badge */}
            {creative.cqi.score > 0 && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-black border ${
                creative.cqi.score >= 70 ? 'bg-green-500/15 border-green-500/30 text-green-300' :
                creative.cqi.score >= 50 ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' :
                'bg-red-500/15 border-red-500/30 text-red-300'
              }`} title={`CQI: ${creative.cqi.label} (${creative.cqi.confidence})`}>
                {creative.cqi.score} {creative.cqi.grade}
              </span>
            )}
            <LifecycleDetail
              stage={creative.lifecycleStage}
              trafficLight={creative.trafficLight}
              roas={creative.roas}
              spend={creative.spend}
              weeklyBuckets={creative.weeklyBuckets}
            />
            <EngagementBadge quadrant={creative.engagementQuadrant} engagement={creative.engagement} compact />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
            <span>Spend: <b className="text-white font-bold">{creative.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</b></span>
            <span>Konwersje: <b className="text-white font-bold">{creative.conversions}</b></span>
            {creative.engagement.reactions > 0 && <span className="text-gray-200">❤️ {creative.engagement.reactions}</span>}
            {creative.engagement.comments > 0 && <span className="text-gray-200">💬 {creative.engagement.comments}</span>}
            {creative.engagement.shares > 0 && <span className="text-gray-200">🔗 {creative.engagement.shares}</span>}
          </div>

          <ProductChip
            adId={creative.id}
            product={creative.productOverride || creative.product}
            isOverride={!!creative.productOverride}
            onOverride={onProductOverride}
          />
        </div>

        {/* Sparkline + Actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <SparklineChart buckets={creative.weeklyBuckets} totalRoas={creative.roas} />

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !!analysis}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                analysis
                  ? 'bg-green-600/20 text-green-300 border border-green-500/40'
                  : analyzing
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 animate-pulse'
                    : 'bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30'
              }`}
            >
              {analysis ? '✓ Analiza' : analyzing ? '⏳...' : '🤖 Analizuj'}
            </button>
            <svg className={`w-5 h-5 text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-gray-600 p-5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Video: fixed 300px for 9:16 Stories */}
            <div className="w-full md:w-[300px] flex-shrink-0 self-start">
              <VideoPlayer videoUrl={creative.videoUrl} imageUrl={null} thumbnailUrl={creative.thumbnailUrl} name={creative.name} />
            </div>

            <div className="flex-1 min-w-0 space-y-5">
              {/* Metrics */}
              <div>
                <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-3">Metryki (60 dni)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'ROAS', value: `${creative.roas.toFixed(1)}x` },
                    { label: 'Spend', value: `${creative.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN` },
                    { label: 'Revenue', value: `${creative.revenue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN` },
                    { label: 'CTR', value: `${creative.ctr.toFixed(2)}%` },
                    { label: 'Konwersje', value: creative.conversions.toString() },
                    { label: 'Impressions', value: creative.impressions.toLocaleString('pl-PL') },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-900/60 rounded-lg p-3">
                      <div className="text-sm font-bold text-gray-300 uppercase">{m.label}</div>
                      <div className="text-lg font-black text-white">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {creative.videoRetention && <RetentionCurve retention={creative.videoRetention} />}
              <EngagementBadge quadrant={creative.engagementQuadrant} engagement={creative.engagement} />
              {analysis && <AiAnalysis text={analysis} roas={creative.roas} />}
            </div>
          </div>

          {/* Weekly Trend Table */}
          {creative.weeklyBuckets.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-3">Trend tygodniowy</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-200 font-bold border-b border-gray-600">
                      <th className="text-left py-2 pr-3">Tydzień</th>
                      <th className="text-right py-2 px-3">ROAS</th>
                      <th className="text-right py-2 px-3">Spend</th>
                      <th className="text-right py-2 px-3">Revenue</th>
                      <th className="text-right py-2 px-3">Konw.</th>
                      <th className="text-right py-2 px-3">CPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creative.weeklyBuckets.map((b, i) => (
                      <tr key={i} className="border-b border-gray-700/50 text-gray-100">
                        <td className="py-2 pr-3 text-gray-300 font-semibold">{new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</td>
                        <td className={`text-right py-2 px-3 font-black ${b.roas >= 6 ? 'text-amber-400' : b.roas >= 5 ? 'text-green-400' : b.roas >= 4 ? 'text-yellow-300' : b.spend > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {b.spend > 0 ? `${b.roas.toFixed(1)}x` : '-'}
                        </td>
                        <td className="text-right py-2 px-3 font-semibold">{b.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}</td>
                        <td className="text-right py-2 px-3 font-semibold">{b.revenue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}</td>
                        <td className="text-right py-2 px-3 font-semibold">{b.conversions}</td>
                        <td className="text-right py-2 px-3">{b.cpm.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
