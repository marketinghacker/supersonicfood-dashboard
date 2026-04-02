'use client';

import type { TrafficLightStatus } from '../lib/config';

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
  products, selectedProduct, onProductChange,
  selectedStatus, onStatusChange,
  sortBy, onSortChange,
}: FilterBarProps) {
  const statuses: Array<{ value: TrafficLightStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'super', label: '🌟 Super' },
    { value: 'good', label: '🟢 Dobrze' },
    { value: 'watch', label: '🟡 Obserwacja' },
    { value: 'bad', label: '🔴 Źle' },
    { value: 'no_data', label: '⚪ Za mało danych' },
  ];

  const sorts: Array<{ value: 'roas' | 'spend' | 'ctr'; label: string }> = [
    { value: 'roas', label: 'ROAS' },
    { value: 'spend', label: 'Spend' },
    { value: 'ctr', label: 'CTR' },
  ];

  return (
    <div className="bg-gray-800/80 rounded-xl border border-gray-600/60 p-4 flex flex-wrap items-center gap-6">
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
  );
}
