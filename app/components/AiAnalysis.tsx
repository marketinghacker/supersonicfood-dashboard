'use client';

interface AiAnalysisProps {
  text: string;
  roas: number;
}

export default function AiAnalysis({ text, roas }: AiAnalysisProps) {
  const borderColor = roas >= 6.0
    ? 'border-amber-400/30'
    : roas >= 4.0
      ? 'border-blue-400/30'
      : 'border-red-400/30';

  const bgColor = roas >= 6.0
    ? 'bg-amber-400/5'
    : roas >= 4.0
      ? 'bg-blue-400/5'
      : 'bg-red-400/5';

  const headerColor = roas >= 6.0
    ? 'text-amber-400'
    : roas >= 4.0
      ? 'text-blue-400'
      : 'text-red-400';

  const headerText = roas >= 6.0
    ? '🌟 Analiza TOP kreacji'
    : roas >= 4.0
      ? '🔍 Analiza kreatywna'
      : '⚠️ Analiza — rekomendacje zmian';

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${headerColor}`}>
        {headerText}
      </h4>
      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <span>Powered by Gemini AI</span>
      </div>
    </div>
  );
}
