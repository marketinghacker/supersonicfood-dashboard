'use client';

import type { Creative } from '../lib/config';
import CreativeCard from './CreativeCard';

interface ProductGroupProps {
  product: string;
  creatives: Creative[];
  onProductOverride: (adId: string, product: string) => void;
}

export default function ProductGroup({ product, creatives, onProductOverride }: ProductGroupProps) {
  const totalSpend = creatives.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = creatives.reduce((s, c) => s + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-gray-800/80 rounded-xl px-5 py-3 border border-gray-700/60">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-white">{product}</h2>
          <span className="text-base font-semibold text-gray-200">({creatives.length} video)</span>
        </div>
        <div className="flex items-center gap-5 text-sm font-semibold text-gray-200">
          <span>Spend: <b className="text-white font-bold">{totalSpend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</b></span>
          <span>ROAS: <b className={`font-black ${avgRoas >= 6 ? 'text-amber-300' : avgRoas >= 5 ? 'text-green-300' : avgRoas >= 4 ? 'text-yellow-300' : 'text-red-300'}`}>{avgRoas.toFixed(1)}x</b></span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {creatives.map(c => <CreativeCard key={c.id} creative={c} onProductOverride={onProductOverride} />)}
      </div>
    </div>
  );
}
