'use client';

import type { TrafficLightStatus } from '../lib/config';
import { TRAFFIC_LIGHT_CONFIG } from '../lib/traffic-light';

interface FilterBarProps {
  products: string[];
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedStatus: TrafficLightStatus | 'all';
  onStatusChange: (status: TrafficLightStatus | 'all') => void;
  sortBy: 'roas' | 'spend' | 'ctr';
  onSortChange: (sort: 'roas' | 'spend' | 'ctr') => void;
}

export default function FilterBar({
  products,
  selectedProduct,
  onProductChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const statuses: Array<{ value: TrafficLightStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'super', label: `${TRAFFIC_LIGHT_CONFIG.super.emoji} Super` },
    { value: 'good', label: `${TRAFFIC_LIGHT_CONFIG.good.emoji} Dobrze` },
    { value: 'watch', label: `${TRAFFIC_LIGHT_CONFIG.watch.emoji} Obserwacja` },
    { value: 'bad', label: `${TRAFFIC_LIGHT_CONFIG.bad.emoji} Źle` },
    { value: 'no_data', label: `${TRAFFIC_LIGHT_CONFIG.no_data.emoji} Za mało danych` },
  ];

  const sorts: Array<{ value: 'roas' | 'spend' | 'ctr'; label: string }> = [
    { value: 'roas', label: 'ROAS' },
    { value: 'spend', label: 'Spend' },
    { value: 'ctr', label: 'CTR' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Produkt</label>
        <select
          value={selectedProduct}
          onChange={e => onProductChange(e.target.value)}
          className="bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Wszystkie</option>
          {products.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Status</label>
        <select
          value={selectedStatus}
          onChange={e => onStatusChange(e.target.value as TrafficLightStatus | 'all')}
          className="bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Sortuj</label>
        <div className="flex gap-1">
          {sorts.map(s => (
            <button
              key={s.value}
              onClick={() => onSortChange(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sortBy === s.value
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
