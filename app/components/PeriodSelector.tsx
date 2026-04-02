'use client';

import { PERIODS } from '../lib/config';

interface PeriodSelectorProps {
  selectedDays: number;
  onSelect: (days: number) => void;
  loading?: boolean;
}

export default function PeriodSelector({ selectedDays, onSelect, loading }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {PERIODS.map(p => (
        <button
          key={p.days}
          onClick={() => onSelect(p.days)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedDays === p.days
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          } disabled:opacity-50`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
