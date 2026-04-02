'use client';

import type { Creative } from '../lib/config';
import CreativeCard from './CreativeCard';

interface ProductGroupProps {
  product: string;
  creatives: Creative[];
}

export default function ProductGroup({ product, creatives }: ProductGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-white">{product}</h2>
        <span className="text-sm text-gray-400">({creatives.length} kreacji)</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {creatives.map(c => (
          <CreativeCard key={c.id} creative={c} />
        ))}
      </div>
    </div>
  );
}
