'use client';

import { useState } from 'react';

const KNOWN_PRODUCTS = [
  'Matcha Latte Collagen',
  'Collagen Beauty Drink',
  'Body Detox Drink',
  'Flow Creatine',
  'Protein Shape Meal',
  'Proteinowy Shake z Kolagenem',
  'Whey 360',
  'Smart Meal',
  'Meale',
  'Katalog ogólny',
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
      <select
        autoFocus
        className="text-xs bg-gray-800 border border-blue-500/50 rounded px-1.5 py-0.5 text-gray-200 focus:outline-none"
        value={product}
        onChange={e => {
          onOverride(adId, e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
      >
        {KNOWN_PRODUCTS.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    );
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors group"
      title="Kliknij aby zmienić produkt"
    >
      <span>{isOverride ? '✏️' : '🔗'}</span>
      <span className="group-hover:underline">{product}</span>
    </button>
  );
}
