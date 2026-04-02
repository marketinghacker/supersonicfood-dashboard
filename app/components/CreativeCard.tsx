'use client';

import { useState } from 'react';
import type { Creative } from '../lib/config';
import TrafficLight from './TrafficLight';
import VideoPlayer from './VideoPlayer';
import AiAnalysis from './AiAnalysis';

export default function CreativeCard({ creative }: { creative: Creative }) {
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
    <div
      className={`bg-gray-800/60 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden transition-all hover:border-gray-600/50 ${
        expanded ? 'col-span-full' : ''
      }`}
    >
      {/* Collapsed view */}
      <div
        className="flex items-start gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
          {creative.thumbnailUrl ? (
            <img
              src={creative.thumbnailUrl}
              alt={creative.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
              N/A
            </div>
          )}
          {creative.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{creative.name}</h3>
          <div className="mt-1">
            <TrafficLight status={creative.trafficLight} label={creative.trafficLightLabel} />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
            <span>Spend: <b className="text-gray-200">{creative.spend.toLocaleString('pl-PL')} PLN</b></span>
            <span>CTR: <b className="text-gray-200">{creative.ctr.toFixed(2)}%</b></span>
            <span>Konwersje: <b className="text-gray-200">{creative.conversions}</b></span>
            {creative.revenue > 0 && (
              <span>Revenue: <b className="text-gray-200">{creative.revenue.toLocaleString('pl-PL')} PLN</b></span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
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
            {analysis ? '✓ Analiza' : analyzing ? '⏳ Analizuję...' : '🤖 Analizuj'}
          </button>
          <button className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-gray-700/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video/Image */}
            <VideoPlayer
              videoUrl={creative.videoUrl}
              imageUrl={creative.imageUrl}
              thumbnailUrl={creative.thumbnailUrl}
              name={creative.name}
            />

            {/* Copy + Analysis */}
            <div className="space-y-4">
              {creative.adCopy && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ad Copy</h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-900/50 rounded-lg p-3">
                    {creative.adCopy}
                  </p>
                </div>
              )}

              {/* Metrics */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Metryki</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'ROAS', value: `${creative.roas.toFixed(1)}x` },
                    { label: 'Spend', value: `${creative.spend.toLocaleString('pl-PL')} PLN` },
                    { label: 'CTR', value: `${creative.ctr.toFixed(2)}%` },
                    { label: 'Konwersje', value: creative.conversions.toString() },
                    { label: 'Revenue', value: `${creative.revenue.toLocaleString('pl-PL')} PLN` },
                    { label: 'Impressions', value: creative.impressions.toLocaleString('pl-PL') },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-900/50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">{m.label}</div>
                      <div className="text-sm font-semibold text-white">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {analysis && <AiAnalysis text={analysis} roas={creative.roas} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
