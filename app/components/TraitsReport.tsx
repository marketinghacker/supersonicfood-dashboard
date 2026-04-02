'use client';

import { useState } from 'react';

export default function TraitsReport() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-top', { method: 'POST' });
      const data = await res.json();
      setReport(data.analysis);
    } catch {
      setReport('Błąd analizy. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 p-6">
      {!report ? (
        <div className="text-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              loading
                ? 'bg-purple-600/30 text-purple-400 animate-pulse'
                : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/25'
            }`}
          >
            {loading ? '⏳ Analizuję Top vs Bottom...' : '📊 Analizuj Top Performerów'}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            AI porówna najlepsze i najsłabsze kreacje — wnioski kreatywne
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold text-white mb-1">📊 Top vs Bottom — Wnioski Kreatywne</h3>
          <p className="text-xs text-gray-500 mb-4">Analiza wzorców w najlepszych i najsłabszych kreacjach</p>
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-900/50 rounded-lg p-4">
            {report}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">Powered by Gemini AI</span>
            <button
              onClick={() => { setReport(null); handleAnalyze(); }}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              🔄 Odśwież analizę
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
