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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">{product}</h2>
          <span className="text-sm text-gray-400">({creatives.length} video)</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Spend: <b className="text-gray-300">{totalSpend.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN</b></span>
          <span>ROAS: <b className={avgRoas >= 6 ? 'text-amber-400' : avgRoas >= 5 ? 'text-green-400' : avgRoas >= 4 ? 'text-yellow-400' : 'text-red-400'}>{avgRoas.toFixed(1)}x</b></span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {creatives.map(c => (
          <CreativeCard key={c.id} creative={c} onProductOverride={onProductOverride} />
        ))}
      </div>
    </div>
  );
}
