'use client';

import { useState } from 'react';
import type { Creative } from '../lib/config';
import CreativeCard from './CreativeCard';

interface ProductGroupProps {
  product: string;
  creatives: Creative[];
  onProductOverride: (adId: string, product: string) => void;
  productImage?: string;
}

export default function ProductGroup({ product, creatives, onProductOverride, productImage }: ProductGroupProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const totalSpend = creatives.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = creatives.reduce((s, c) => s + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const avgCqi = creatives.length > 0 ? Math.round(creatives.reduce((s, c) => s + c.cqi.score, 0) / creatives.length) : 0;

  const handleSummary = async () => {
    if (loadingSummary) return;
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: product, creativeIds: creatives.map(c => c.id) }),
      });
      const data = await res.json();
      setSummary(data.analysis);
    } catch {
      setSummary('Błąd analizy.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-gray-800/80 rounded-xl px-5 py-3 border border-gray-700/60">
        <div className="flex items-center gap-3">
          {productImage && (
            <img src={productImage} alt={product} className="w-10 h-10 rounded-lg object-cover" />
          )}
          <div>
            <h2 className="text-xl font-black text-white">{product}</h2>
            <span className="text-sm font-semibold text-gray-300">{creatives.length} video | CQI avg: {avgCqi}</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-sm font-semibold text-gray-200">
            <span>Spend: <b className="text-white font-bold">{totalSpend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</b></span>
            <span className="ml-4">ROAS: <b className={`font-black ${avgRoas >= 6 ? 'text-amber-300' : avgRoas >= 5 ? 'text-green-300' : avgRoas >= 4 ? 'text-yellow-300' : 'text-red-300'}`}>{avgRoas.toFixed(1)}x</b></span>
          </div>
          <button onClick={handleSummary} disabled={loadingSummary || !!summary}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
              summary ? 'bg-green-600/20 text-green-300 border border-green-500/30' :
              loadingSummary ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 animate-pulse' :
              'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30'
            }`}>
            {summary ? '✓ Podsumowanie' : loadingSummary ? '⏳...' : '📊 Podsumuj produkt'}
          </button>
        </div>
      </div>

      {summary && (
        <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-xl p-5">
          <h3 className="text-base font-black text-purple-300 mb-3">📊 Podsumowanie: {product}</h3>
          <div className="text-base text-gray-100 leading-relaxed whitespace-pre-wrap font-medium">{summary}</div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Gemini 3.1 Pro Preview</span>
            <button onClick={() => { setSummary(null); handleSummary(); }}
              className="text-sm font-bold text-purple-300 hover:text-purple-200">🔄 Odśwież</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {creatives.map(c => <CreativeCard key={c.id} creative={c} onProductOverride={onProductOverride} />)}
      </div>
    </div>
  );
}
