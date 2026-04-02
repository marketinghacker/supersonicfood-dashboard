'use client';

interface AiAnalysisProps {
  text: string;
  roas: number;
}

export default function AiAnalysis({ text, roas }: AiAnalysisProps) {
  const borderColor = roas >= 6.0 ? 'border-amber-400/40' : roas >= 4.0 ? 'border-blue-400/40' : 'border-red-400/40';
  const bgColor = roas >= 6.0 ? 'bg-amber-400/10' : roas >= 4.0 ? 'bg-blue-400/10' : 'bg-red-400/10';
  const headerColor = roas >= 6.0 ? 'text-amber-300' : roas >= 4.0 ? 'text-blue-300' : 'text-red-300';
  const headerText = roas >= 6.0 ? '🌟 Analiza TOP kreacji' : roas >= 4.0 ? '🔍 Analiza kreatywna' : '⚠️ Analiza — rekomendacje zmian';

  return (
    <div className={`rounded-lg border-2 ${borderColor} ${bgColor} p-5`}>
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${headerColor}`}>{headerText}</h4>
      <div className="text-base text-gray-100 leading-relaxed whitespace-pre-wrap font-medium">{text}</div>
      <div className="mt-3 text-sm text-gray-300">Powered by Gemini AI</div>
    </div>
  );
}
