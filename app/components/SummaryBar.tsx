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
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Lifecycle counts */}
        <div className="flex items-center gap-3">
          {Object.entries(LIFECYCLE_LABELS).map(([stage, cfg]) => {
            const count = lifecycleCounts.get(stage) || 0;
            if (count === 0) return null;
            return (
              <div key={stage} className="flex items-center gap-1 text-sm">
                <span>{cfg.emoji}</span>
                <span className="font-bold text-white">{count}</span>
                <span className="text-gray-500 text-xs hidden md:inline">{cfg.label}</span>
              </div>
            );
          })}
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Totals */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-400">Spend (60d): </span>
            <span className="font-bold text-white">{totalSpend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</span>
          </div>
          <div>
            <span className="text-gray-400">ROAS: </span>
            <span className="font-bold text-white">{avgRoas.toFixed(1)}x</span>
          </div>
          <div>
            <span className="text-gray-400">Video: </span>
            <span className="font-bold text-white">{creatives.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
