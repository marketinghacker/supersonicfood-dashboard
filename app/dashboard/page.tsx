'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Creative, TrafficLightStatus } from '../lib/config';
import PeriodSelector from '../components/PeriodSelector';
import FilterBar from '../components/FilterBar';
import SummaryBar from '../components/SummaryBar';
import ProductGroup from '../components/ProductGroup';
import TraitsReport from '../components/TraitsReport';

export default function DashboardPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<TrafficLightStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'roas' | 'spend' | 'ctr'>('roas');

  const fetchData = useCallback(async (periodDays: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?days=${periodDays}`);
      if (!res.ok) throw new Error('Błąd pobierania danych');
      const data = await res.json();
      setCreatives(data.creatives);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const handlePeriodChange = (newDays: number) => {
    setDays(newDays);
  };

  // Apply filters
  const filtered = creatives
    .filter(c => selectedProduct === 'all' || c.product === selectedProduct)
    .filter(c => selectedStatus === 'all' || c.trafficLight === selectedStatus);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'roas': return b.roas - a.roas;
      case 'spend': return b.spend - a.spend;
      case 'ctr': return b.ctr - a.ctr;
      default: return 0;
    }
  });

  // Group by product
  const products = Array.from(new Set(creatives.map(c => c.product))).sort();
  const groupedByProduct = new Map<string, Creative[]>();
  for (const c of sorted) {
    const existing = groupedByProduct.get(c.product) || [];
    existing.push(c);
    groupedByProduct.set(c.product, existing);
  }

  // Sort groups by total spend
  const sortedGroups = Array.from(groupedByProduct.entries()).sort(
    ([, a], [, b]) => b.reduce((s, c) => s + c.spend, 0) - a.reduce((s, c) => s + c.spend, 0)
  );

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                SUPERSONIC<span className="text-green-400">FOOD</span>
                <span className="text-gray-500 font-normal ml-2 text-sm">Creative Dashboard</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <PeriodSelector selectedDays={days} onSelect={handlePeriodChange} loading={loading} />
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                  <span>🔄</span>
                  <span>{new Date(lastUpdated).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <FilterBar
          products={products}
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Summary */}
        {!loading && creatives.length > 0 && <SummaryBar creatives={creatives} />}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm">Ładowanie kreacji z Meta Ads...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => fetchData(days)}
              className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Creative Groups */}
        {!loading && !error && (
          <div className="space-y-8">
            {sortedGroups.map(([product, productCreatives]) => (
              <ProductGroup key={product} product={product} creatives={productCreatives} />
            ))}

            {sorted.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Brak kreacji spełniających kryteria filtrowania</p>
              </div>
            )}
          </div>
        )}

        {/* Top vs Bottom Analysis */}
        {!loading && creatives.length > 5 && <TraitsReport />}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            Powered by <span className="text-gray-400 font-medium">Marketing Hackers</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
