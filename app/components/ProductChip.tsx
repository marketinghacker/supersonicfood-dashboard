'use client';

import { useState } from 'react';

const KNOWN_PRODUCTS = [
  'Matcha Latte Collagen', 'Collagen Beauty Drink', 'Body Detox Drink',
  'Flow Creatine', 'Protein Shape Meal', 'Proteinowy Shake z Kolagenem',
  'Whey 360', 'Smart Meal', 'Meale', 'Katalog ogólny',
];

interface ProductChipProps {
  adId: string;
  product: string;
  isOverride: boolean;
  onOverride: (adId: string, product: string) => void;
}

export default function ProductChip({ adId, product, isOverride, onOverride }: ProductChipProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div onClick={e => e.stopPropagation()}>
        <select autoFocus
          className="text-sm font-semibold bg-gray-700 border-2 border-blue-400 rounded-lg px-3 py-1.5 text-white focus:outline-none"
          value={product}
          onChange={e => { onOverride(adId, e.target.value); setEditing(false); }}
          onBlur={() => setEditing(false)}>
          {KNOWN_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    );
  }

  return (
    <button onClick={e => { e.stopPropagation(); setEditing(true); }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-200 hover:text-white transition-colors group"
      title="Kliknij aby zmienić produkt">
      <span>{isOverride ? '✏️' : '🏷️'}</span>
      <span className="group-hover:underline">{product}</span>
    </button>
  );
}
