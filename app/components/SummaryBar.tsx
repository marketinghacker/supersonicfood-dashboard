'use client';

import type { Creative } from '../lib/config';

const LIFECYCLE_LABELS: Record<string, { emoji: string; label: string }> = {
  new: { emoji: '🆕', label: 'Nowe' },
  ramping: { emoji: '🚀', label: 'Rosną' },
  scaling: { emoji: '📈', label: 'Skalują' },
  peak: { emoji: '⭐', label: 'Peak' },
  fatiguing: { emoji: '📉', label: 'Wypalają się' },
  burned: { emoji: '🔥', label: 'Wypalone' },
};

export default function SummaryBar({ creatives }: { creatives: Creative[] }) {
  const lifecycleCounts = new Map<string, number>();
  for (const c of creatives) {
    lifecycleCounts.set(c.lifecycleStage, (lifecycleCounts.get(c.lifecycleStage) || 0) + 1);
  }

  const totalSpend = creatives.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = creatives.reduce((sum, c) => sum + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="bg-gray-800/90 backdrop-blur rounded-2xl border-2 border-gray-600/60 p-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          {Object.entries(LIFECYCLE_LABELS).map(([stage, cfg]) => {
            const count = lifecycleCounts.get(stage) || 0;
            if (count === 0) return null;
            return (
              <div key={stage} className="flex items-center gap-1.5 text-base">
                <span>{cfg.emoji}</span>
                <span className="font-black text-white">{count}</span>
                <span className="text-gray-200 text-sm font-semibold">{cfg.label}</span>
              </div>
            );
          })}
        </div>

        <div className="h-8 w-px bg-gray-500" />

        <div className="flex items-center gap-6 text-base">
          <div>
            <span className="text-gray-200 font-semibold">Spend (60d): </span>
            <span className="font-black text-white">{totalSpend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</span>
          </div>
          <div>
            <span className="text-gray-200 font-semibold">ROAS: </span>
            <span className="font-black text-white">{avgRoas.toFixed(1)}x</span>
          </div>
          <div>
            <span className="text-gray-200 font-semibold">Video: </span>
            <span className="font-black text-white">{creatives.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
