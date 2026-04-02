'use client';

interface AiAnalysisProps {
  text: string;
  roas: number;
}

function renderMarkdown(text: string) {
  // Parse structured analysis with ## headers
  const sections = text.split(/^## /m).filter(Boolean);

  if (sections.length <= 1) {
    // Fallback: plain text with bullet points
    return <div className="text-base text-gray-100 leading-relaxed whitespace-pre-wrap font-medium">{text}</div>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const [title, ...body] = section.split('\n');
        const content = body.join('\n').trim();

        // Parse **bold** markers
        const renderLine = (line: string, idx: number) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <div key={idx} className={`${line.startsWith('-') || line.startsWith('•') ? 'pl-4' : ''} ${line.startsWith('#') ? 'hidden' : ''}`}>
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <b key={j} className="text-white font-black">{part.slice(2, -2)}</b>;
                }
                return <span key={j}>{part}</span>;
              })}
            </div>
          );
        };

        // Extract score if present (e.g., "[8/10]" or "8/10")
        const scoreMatch = content.match(/(\d+)\/10/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

        return (
          <div key={i} className="border-l-2 border-gray-600 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="text-sm font-black text-white uppercase tracking-wider">{title.trim()}</h5>
              {score !== null && (
                <span className={`text-sm font-black px-2 py-0.5 rounded ${
                  score >= 8 ? 'bg-green-500/20 text-green-300' :
                  score >= 6 ? 'bg-yellow-500/20 text-yellow-300' :
                  score >= 4 ? 'bg-orange-500/20 text-orange-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {score}/10
                </span>
              )}
            </div>
            <div className="text-base text-gray-200 leading-relaxed font-medium space-y-1">
              {content.split('\n').filter(l => l.trim()).map((line, idx) => renderLine(line, idx))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AiAnalysis({ text, roas }: AiAnalysisProps) {
  const borderColor = roas >= 6.0 ? 'border-amber-400/40' : roas >= 4.0 ? 'border-blue-400/40' : 'border-red-400/40';
  const bgColor = roas >= 6.0 ? 'bg-amber-400/10' : roas >= 4.0 ? 'bg-blue-400/10' : 'bg-red-400/10';
  const headerColor = roas >= 6.0 ? 'text-amber-300' : roas >= 4.0 ? 'text-blue-300' : 'text-red-300';
  const headerText = roas >= 6.0 ? '🌟 Analiza TOP kreacji' : roas >= 4.0 ? '🔍 Analiza kreatywna' : '⚠️ Rekomendacje zmian';

  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-5`}>
      <h4 className={`text-base font-black uppercase tracking-wider mb-4 ${headerColor}`}>{headerText}</h4>
      {renderMarkdown(text)}
      <div className="mt-4 text-sm text-gray-400 font-medium">Gemini 3.1 Pro Preview</div>
    </div>
  );
}
