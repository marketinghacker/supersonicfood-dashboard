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

  // Filters
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Product override handler
  const handleProductOverride = useCallback((adId: string, product: string) => {
    setProductOverrides(prev => ({ ...prev, [adId]: product }));
    // Save to API (fire and forget)
    fetch('/api/products/override', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, product }),
    }).catch(() => {});
  }, []);

  // Apply overrides to creatives
  const creativesWithOverrides = creatives.map(c => {
    const override = productOverrides[c.id];
    return override ? { ...c, product: override, productOverride: override } : c;
  });

  // Only videos
  const videosOnly = creativesWithOverrides.filter(c => c.creativeType === 'video');

  // Apply filters
  const filtered = videosOnly
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

  // Unique products from videos
  const products = Array.from(new Set(videosOnly.map(c => c.product))).sort();

  // Group by product
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
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://supersonicfood.com/cdn/shop/files/desktop_-_flow.png?format=webp&v=1769515948&width=2560"
                alt="SupersonicFood"
                className="h-8 w-auto"
              />
              <span className="text-gray-500 text-sm hidden sm:inline">Creative Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {videoCount} video{otherCount > 0 ? ` / ${otherCount} inne` : ''}
              </span>
              {lastUpdated && (
                <span className="text-xs text-gray-600">
                  🔄 {new Date(lastUpdated).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                Odśwież
              </button>
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
        {!loading && videosOnly.length > 0 && <SummaryBar creatives={videosOnly} />}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm">Ładowanie kreacji video z Meta Ads...</p>
              <p className="text-gray-600 text-xs">Pobieranie danych z ostatnich 60 dni + trendy tygodniowe</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchData} className="mt-2 text-xs text-red-300 hover:text-red-200 underline">
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Creative Groups */}
        {!loading && !error && (
          <div className="space-y-8">
            {sortedGroups.map(([product, productCreatives]) => (
              <ProductGroup
                key={product}
                product={product}
                creatives={productCreatives}
                onProductOverride={handleProductOverride}
              />
            ))}

            {sorted.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Brak kreacji video spełniających kryteria</p>
              </div>
            )}
          </div>
        )}

        {/* Top vs Bottom Analysis */}
        {!loading && videosOnly.length > 5 && <TraitsReport />}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-600">Powered by</span>
          <img src="/mh-logo.png" alt="Marketing Hackers" className="h-5 w-auto opacity-60" />
        </div>
      </footer>
    </main>
  );
}
