'use client';

import type { Creative } from '../lib/config';
import { TRAFFIC_LIGHT_CONFIG } from '../lib/traffic-light';

export default function SummaryBar({ creatives }: { creatives: Creative[] }) {
  const counts = {
    super: creatives.filter(c => c.trafficLight === 'super').length,
    good: creatives.filter(c => c.trafficLight === 'good').length,
    watch: creatives.filter(c => c.trafficLight === 'watch').length,
    bad: creatives.filter(c => c.trafficLight === 'bad').length,
    no_data: creatives.filter(c => c.trafficLight === 'no_data').length,
  };

  const totalSpend = creatives.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = creatives.reduce((sum, c) => sum + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 p-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          {(['super', 'good', 'watch', 'bad', 'no_data'] as const).map(status => (
            <div key={status} className="flex items-center gap-1.5 text-sm">
              <span>{TRAFFIC_LIGHT_CONFIG[status].emoji}</span>
              <span className={`font-bold ${TRAFFIC_LIGHT_CONFIG[status].color}`}>{counts[status]}</span>
            </div>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-700" />

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-400">Spend: </span>
            <span className="font-bold text-white">{totalSpend.toLocaleString('pl-PL')} PLN</span>
          </div>
          <div>
            <span className="text-gray-400">Avg ROAS: </span>
            <span className="font-bold text-white">{avgRoas.toFixed(1)}x</span>
          </div>
          <div>
            <span className="text-gray-400">Aktywne: </span>
            <span className="font-bold text-white">{creatives.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
