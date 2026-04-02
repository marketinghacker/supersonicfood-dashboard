'use client';

import { useState } from 'react';
import type { Creative } from '../lib/config';
import LifecycleBadge from './LifecycleBadge';
import EngagementBadge from './EngagementBadge';
import SparklineChart from './SparklineChart';
import VideoPlayer from './VideoPlayer';
import RetentionCurve from './RetentionCurve';
import AiAnalysis from './AiAnalysis';
import ProductChip from './ProductChip';

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

  return (
    <div className={`bg-gray-800/60 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden transition-all hover:border-gray-600/50 ${expanded ? 'col-span-full' : ''}`}>
      {/* Collapsed view */}
      <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Thumbnail */}
        <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
          {creative.thumbnailUrl ? (
            <img src={creative.thumbnailUrl} alt={creative.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">N/A</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-sm font-semibold text-white truncate">{creative.name}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <LifecycleBadge
              stage={creative.lifecycleStage}
              trafficLight={creative.trafficLight}
              roas={creative.roas}
              spend={creative.spend}
            />
            <EngagementBadge quadrant={creative.engagementQuadrant} engagement={creative.engagement} compact />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span>Spend: <b className="text-gray-200">{creative.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</b></span>
            <span>Konwersje: <b className="text-gray-200">{creative.conversions}</b></span>
            {creative.engagement.reactions > 0 && <span>❤️ {creative.engagement.reactions}</span>}
            {creative.engagement.comments > 0 && <span>💬 {creative.engagement.comments}</span>}
            {creative.engagement.shares > 0 && <span>🔗 {creative.engagement.shares}</span>}
          </div>

          <ProductChip
            adId={creative.id}
            product={creative.productOverride || creative.product}
            isOverride={!!creative.productOverride}
            onOverride={onProductOverride}
          />
        </div>

        {/* Sparkline + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SparklineChart buckets={creative.weeklyBuckets} />

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !!analysis}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                analysis
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : analyzing
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 animate-pulse'
                    : 'bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30'
              }`}
            >
              {analysis ? '✓ Analiza' : analyzing ? '⏳...' : '🤖 Analizuj'}
            </button>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-gray-700/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Player */}
            <VideoPlayer
              videoUrl={creative.videoUrl}
              imageUrl={null}
              thumbnailUrl={creative.thumbnailUrl}
              name={creative.name}
            />

            {/* Metrics + Retention + Engagement + AI */}
            <div className="space-y-4">
              {/* Metrics */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Metryki (60 dni)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'ROAS', value: `${creative.roas.toFixed(1)}x` },
                    { label: 'Spend', value: `${creative.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN` },
                    { label: 'Revenue', value: `${creative.revenue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN` },
                    { label: 'CTR', value: `${creative.ctr.toFixed(2)}%` },
                    { label: 'Konwersje', value: creative.conversions.toString() },
                    { label: 'Impressions', value: creative.impressions.toLocaleString('pl-PL') },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-[10px] text-gray-500">{m.label}</div>
                      <div className="text-sm font-semibold text-white">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention Curve */}
              {creative.videoRetention && (
                <RetentionCurve retention={creative.videoRetention} />
              )}

              {/* Engagement Detail */}
              <EngagementBadge
                quadrant={creative.engagementQuadrant}
                engagement={creative.engagement}
              />

              {/* AI Analysis */}
              {analysis && <AiAnalysis text={analysis} roas={creative.roas} />}
            </div>
          </div>

          {/* Weekly Trend Table */}
          {creative.weeklyBuckets.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Trend tygodniowy</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-700/50">
                      <th className="text-left py-1.5 pr-3">Tydzień</th>
                      <th className="text-right py-1.5 px-2">ROAS</th>
                      <th className="text-right py-1.5 px-2">Spend</th>
                      <th className="text-right py-1.5 px-2">Revenue</th>
                      <th className="text-right py-1.5 px-2">Konw.</th>
                      <th className="text-right py-1.5 px-2">CPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creative.weeklyBuckets.map((b, i) => (
                      <tr key={i} className="border-b border-gray-800/50 text-gray-300">
                        <td className="py-1.5 pr-3 text-gray-500">{new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</td>
                        <td className={`text-right py-1.5 px-2 font-semibold ${b.roas >= 6 ? 'text-amber-400' : b.roas >= 5 ? 'text-green-400' : b.roas >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {b.spend > 0 ? `${b.roas.toFixed(1)}x` : '-'}
                        </td>
                        <td className="text-right py-1.5 px-2">{b.spend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}</td>
                        <td className="text-right py-1.5 px-2">{b.revenue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}</td>
                        <td className="text-right py-1.5 px-2">{b.conversions}</td>
                        <td className="text-right py-1.5 px-2">{b.cpm.toFixed(1)}</td>
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
