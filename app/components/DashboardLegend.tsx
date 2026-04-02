'use client';

import { useState } from 'react';

export default function DashboardLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-2xl border-2 border-gray-600/60 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-700/40 transition-colors">
        <span className="text-lg font-black text-white">ℹ️ Jak czytać dashboard?</span>
        <svg className={`w-6 h-6 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-600">
          {/* ROAS Traffic Light */}
          <div className="pt-5">
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-3">Kolory ROAS</h3>
            <p className="text-base text-gray-300 font-medium mb-3">Kolor lewej krawędzi karty. Wymaga min. 200 PLN wydanych i 1000 wyświetleń.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { color: 'border-l-amber-400 bg-amber-400/10', label: '🌟 SUPER — ROAS ≥ 6.0x' },
                { color: 'border-l-green-400 bg-green-400/10', label: '🟢 Dobrze — ROAS 5.0x – 5.9x' },
                { color: 'border-l-yellow-400 bg-yellow-400/10', label: '🟡 Obserwacja — ROAS 4.0x – 4.9x' },
                { color: 'border-l-red-400 bg-red-400/10', label: '🔴 Źle — ROAS < 4.0x' },
                { color: 'border-l-gray-500 bg-gray-500/10', label: '⚪ Za mało danych — spend < 200 PLN' },
              ].map(item => (
                <div key={item.label} className={`border-l-4 ${item.color} rounded-lg px-4 py-3`}>
                  <span className="text-base font-bold text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lifecycle Stages */}
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-3">Cykl życia kreacji</h3>
            <p className="text-base text-gray-300 font-medium mb-3">Etap na podstawie trendu ROAS i wydatków z ostatnich 3 tygodni. Kliknij badge aby zobaczyć szczegóły.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { emoji: '🆕', label: 'Nowa', desc: '< 2 tygodnie danych lub spend < 200 PLN' },
                { emoji: '🚀', label: 'Rośnie', desc: 'ROAS rośnie lub spend się zwiększa' },
                { emoji: '📈', label: 'Skaluje', desc: 'Stabilny ROAS przy spendzie > 5000 PLN' },
                { emoji: '⭐', label: 'Peak', desc: 'Najlepszy ROAS był 2+ tygodnie temu' },
                { emoji: '📉', label: 'Wypalanie', desc: 'ROAS spada 2+ tygodnie z rzędu' },
                { emoji: '🔥', label: 'Wypalona', desc: 'ROAS < 4.0x przez 2+ tygodnie' },
              ].map(item => (
                <div key={item.label} className="bg-gray-900/60 rounded-lg px-4 py-3">
                  <div className="text-base font-bold text-white">{item.emoji} {item.label}</div>
                  <div className="text-sm text-gray-300 font-medium mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Quadrants */}
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-3">Zaangażowanie</h3>
            <p className="text-base text-gray-300 font-medium mb-3">
              Engagement score = (reakcje + komentarze×3 + udostępnienia×5) / wyświetlenia × 1000.
              Porównanie z medianą wszystkich kreacji.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Viralowy hit', desc: 'Wysoki engagement + wysoki ROAS', color: 'bg-amber-400/15 text-amber-300' },
                { label: 'Angażuje, nie sprzedaje', desc: 'Wysoki engagement, niski ROAS — content lubiany, ale słaba konwersja', color: 'bg-orange-400/15 text-orange-300' },
                { label: 'Cichy sprzedawca', desc: 'Niski engagement, wysoki ROAS — sprzedaje mimo braku lajków', color: 'bg-blue-400/15 text-blue-300' },
                { label: 'Do poprawy', desc: 'Niski engagement + niski ROAS — kandydat do wyłączenia', color: 'bg-red-400/15 text-red-300' },
              ].map(item => (
                <div key={item.label} className={`rounded-lg px-4 py-3 ${item.color}`}>
                  <div className="text-base font-black">{item.label}</div>
                  <div className="text-sm font-medium mt-1 opacity-80">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          {/* CQI */}
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-3">Creative Quality Index (CQI)</h3>
            <p className="text-base text-gray-300 font-medium mb-3">
              Złożony wskaźnik 0-100 oceniający jakość kreacji. Obliczany względem mediany Twojego konta (nie absolutnych progów).
            </p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[
                { w: '40%', label: 'Performance', desc: 'ROAS + CTR + CPC' },
                { w: '15%', label: 'Hook', desc: 'Siła pierwszych sekund' },
                { w: '15%', label: 'Storytelling', desc: 'Retencja p50/p75/ThruPlay' },
                { w: '10%', label: 'Engagement', desc: 'Udostępnienia, zapisy, komentarze' },
                { w: '20%', label: 'Trwałość', desc: 'Trend ROAS, frequency, skalowalność' },
              ].map(p => (
                <div key={p.label} className="bg-gray-900/60 rounded-lg p-3 text-center">
                  <div className="text-lg font-black text-white">{p.w}</div>
                  <div className="text-sm font-bold text-gray-200">{p.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { range: '90-100', grade: 'A+', label: 'Wyjątkowa', color: 'text-green-300' },
                { range: '70-89', grade: 'A/B+', label: 'Mocna/Dobra', color: 'text-green-300' },
                { range: '50-69', grade: 'B/C+', label: 'Solidna/Przeciętna', color: 'text-yellow-300' },
                { range: '30-49', grade: 'C/D', label: 'Słaba', color: 'text-orange-300' },
                { range: '0-29', grade: 'F', label: 'Krytyczna', color: 'text-red-300' },
              ].map(s => (
                <div key={s.range} className="bg-gray-900/60 rounded-lg p-2 text-center">
                  <div className={`text-base font-black ${s.color}`}>{s.grade}</div>
                  <div className="text-xs text-gray-300">{s.range}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
