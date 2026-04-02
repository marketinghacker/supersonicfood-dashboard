'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Creative, TrafficLightStatus } from '../lib/config';
import FilterBar from '../components/FilterBar';
import SummaryBar from '../components/SummaryBar';
import ProductGroup from '../components/ProductGroup';
import TraitsReport from '../components/TraitsReport';

export default function DashboardPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [productOverrides, setProductOverrides] = useState<Record<string, string>>({});

  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<TrafficLightStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'roas' | 'spend' | 'ctr'>('roas');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProductOverride = useCallback((adId: string, product: string) => {
    setProductOverrides(prev => ({ ...prev, [adId]: product }));
    fetch('/api/products/override', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, product }),
    }).catch(() => {});
  }, []);

  const creativesWithOverrides = creatives.map(c => {
    const override = productOverrides[c.id];
    return override ? { ...c, product: override, productOverride: override } : c;
  });

  const videosOnly = creativesWithOverrides.filter(c => c.creativeType === 'video');

  const filtered = videosOnly
    .filter(c => selectedProduct === 'all' || c.product === selectedProduct)
    .filter(c => selectedStatus === 'all' || c.trafficLight === selectedStatus);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'roas': return b.roas - a.roas;
      case 'spend': return b.spend - a.spend;
      case 'ctr': return b.ctr - a.ctr;
      default: return 0;
    }
  });

  const products = Array.from(new Set(videosOnly.map(c => c.product))).sort();

  const groupedByProduct = new Map<string, Creative[]>();
  for (const c of sorted) {
    const existing = groupedByProduct.get(c.product) || [];
    existing.push(c);
    groupedByProduct.set(c.product, existing);
  }

  const sortedGroups = Array.from(groupedByProduct.entries()).sort(
    ([, a], [, b]) => b.reduce((s, c) => s + c.spend, 0) - a.reduce((s, c) => s + c.spend, 0)
  );

  const videoCount = creativesWithOverrides.filter(c => c.creativeType === 'video').length;
  const otherCount = creativesWithOverrides.length - videoCount;

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/supersonic-logo.png" alt="SUPERSONIC" className="h-10 w-auto invert" />
              <span className="text-gray-200 text-base font-semibold">Creative Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-200">
                {videoCount} video{otherCount > 0 ? ` / ${otherCount} inne` : ''}
              </span>
              {lastUpdated && (
                <span className="text-sm text-gray-300 font-medium">
                  🔄 {new Date(lastUpdated).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button onClick={fetchData} disabled={loading}
                className="text-sm font-bold text-blue-300 hover:text-blue-200 disabled:opacity-50">
                Odśwież
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <FilterBar products={products} selectedProduct={selectedProduct} onProductChange={setSelectedProduct}
          selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} sortBy={sortBy} onSortChange={setSortBy} />

        {!loading && videosOnly.length > 0 && <SummaryBar creatives={videosOnly} />}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white text-lg font-bold">Ładowanie kreacji video z Meta Ads...</p>
              <p className="text-gray-300 text-base">Pobieranie danych z ostatnich 60 dni + trendy tygodniowe</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/15 border-2 border-red-500/40 rounded-xl p-6 text-center">
            <p className="text-red-300 text-lg font-bold">{error}</p>
            <button onClick={fetchData} className="mt-3 text-base font-bold text-red-200 hover:text-red-100 underline">
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {sortedGroups.map(([product, productCreatives]) => (
              <ProductGroup key={product} product={product} creatives={productCreatives} onProductOverride={handleProductOverride} />
            ))}
            {sorted.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-xl font-bold text-gray-200">Brak kreacji video spełniających kryteria</p>
              </div>
            )}
          </div>
        )}

        {!loading && videosOnly.length > 5 && <TraitsReport />}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <span className="text-sm text-gray-400 font-medium">Powered by</span>
          <img src="/mh-logo.png" alt="Marketing Hackers" className="h-8 w-auto" />
        </div>
      </footer>
    </main>
  );
}
