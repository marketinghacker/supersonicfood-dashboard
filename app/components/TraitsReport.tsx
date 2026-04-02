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
    <div className="bg-gray-800/80 backdrop-blur rounded-xl border-2 border-gray-600/50 p-6">
      {!report ? (
        <div className="text-center">
          <button onClick={handleAnalyze} disabled={loading}
            className={`px-6 py-3 rounded-xl text-base font-bold transition-all ${
              loading ? 'bg-purple-600/30 text-purple-300 animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/25'
            }`}>
            {loading ? '⏳ Analizuję Top vs Bottom...' : '📊 Analizuj Top Performerów'}
          </button>
          <p className="mt-3 text-sm text-gray-300 font-medium">AI porówna najlepsze i najsłabsze kreacje — wnioski kreatywne</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-black text-white mb-1">📊 Top vs Bottom — Wnioski Kreatywne</h3>
          <p className="text-sm text-gray-300 font-medium mb-4">Analiza wzorców w najlepszych i najsłabszych kreacjach</p>
          <div className="text-base text-gray-100 leading-relaxed whitespace-pre-wrap font-medium bg-gray-900/50 rounded-lg p-5">{report}</div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-300">Powered by Gemini AI</span>
            <button onClick={() => { setReport(null); handleAnalyze(); }}
              className="text-sm font-bold text-purple-300 hover:text-purple-200">🔄 Odśwież analizę</button>
          </div>
        </div>
      )}
    </div>
  );
}
