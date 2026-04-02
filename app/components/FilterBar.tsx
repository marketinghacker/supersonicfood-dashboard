'use client';

import type { TrafficLightStatus } from '../lib/config';

export type SortBy = 'roas' | 'spend' | 'ctr' | 'cqi';
export type AdvancedFilter = 'all' | 'viral_winner' | 'ramping' | 'fatiguing' | 'good_hook' | 'bad_hook';

interface FilterBarProps {
  products: string[];
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedStatus: TrafficLightStatus | 'all';
  onStatusChange: (status: TrafficLightStatus | 'all') => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  advancedFilter: AdvancedFilter;
  onAdvancedFilterChange: (filter: AdvancedFilter) => void;
}

export default function FilterBar({
  products, selectedProduct, onProductChange,
  selectedStatus, onStatusChange,
  sortBy, onSortChange,
  advancedFilter, onAdvancedFilterChange,
}: FilterBarProps) {
  const statuses: Array<{ value: TrafficLightStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'super', label: '🌟 Super' },
    { value: 'good', label: '🟢 Dobrze' },
    { value: 'watch', label: '🟡 Obserwacja' },
    { value: 'bad', label: '🔴 Źle' },
    { value: 'no_data', label: '⚪ Za mało danych' },
  ];

  const sorts: Array<{ value: SortBy; label: string }> = [
    { value: 'cqi', label: 'CQI' },
    { value: 'roas', label: 'ROAS' },
    { value: 'spend', label: 'Spend' },
    { value: 'ctr', label: 'CTR' },
  ];

  const advancedFilters: Array<{ value: AdvancedFilter; label: string }> = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'viral_winner', label: '🔥 Viralowe hity' },
    { value: 'ramping', label: '🚀 Rosnące' },
    { value: 'fatiguing', label: '📉 Spadające' },
    { value: 'good_hook', label: '🎯 Dobry hook' },
    { value: 'bad_hook', label: '😴 Słaby hook' },
  ];

  return (
    <div className="bg-gray-800/80 rounded-xl border border-gray-600/60 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-200 uppercase tracking-wider">Produkt</label>
          <select value={selectedProduct} onChange={e => onProductChange(e.target.value)}
            className="bg-gray-700 text-white text-sm font-semibold rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-400 focus:outline-none min-w-[160px]">
            <option value="all">Wszystkie</option>
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-200 uppercase tracking-wider">Status</label>
          <select value={selectedStatus} onChange={e => onStatusChange(e.target.value as TrafficLightStatus | 'all')}
            className="bg-gray-700 text-white text-sm font-semibold rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-400 focus:outline-none min-w-[160px]">
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-200 uppercase tracking-wider">Sortuj</label>
          <div className="flex gap-1">
            {sorts.map(s => (
              <button key={s.value} onClick={() => onSortChange(s.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  sortBy === s.value
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'text-gray-200 bg-gray-700/50 hover:text-white hover:bg-gray-600/50 border border-gray-600'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-bold text-gray-200 uppercase tracking-wider">Filtr</label>
        {advancedFilters.map(f => (
          <button key={f.value} onClick={() => onAdvancedFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              advancedFilter === f.value
                ? 'bg-purple-600 text-white border border-purple-500'
                : 'text-gray-200 bg-gray-700/50 hover:text-white hover:bg-gray-600/50 border border-gray-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
