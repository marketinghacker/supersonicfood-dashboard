import type { Creative } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function retentionSummary(c: Creative): string {
  if (!c.videoRetention || c.videoRetention.plays === 0) return '';
  const r = c.videoRetention;
  const p25 = ((r.p25 / r.plays) * 100).toFixed(0);
  const p50 = ((r.p50 / r.plays) * 100).toFixed(0);
  const p75 = ((r.p75 / r.plays) * 100).toFixed(0);
  return `Retencja: ${p25}% @25%, ${p50}% @50%, ${p75}% @75%. Średni czas oglądania: ${r.avgWatchSeconds.toFixed(1)}s.`;
}

function engagementSummary(c: Creative): string {
  const e = c.engagement;
  const parts: string[] = [];
  if (e.reactions) parts.push(`${e.reactions} reakcji`);
  if (e.comments) parts.push(`${e.comments} komentarzy`);
  if (e.shares) parts.push(`${e.shares} udostępnień`);
  return parts.length ? `Zaangażowanie: ${parts.join(', ')}.` : '';
}

function lifecycleSummary(c: Creative): string {
  const labels: Record<string, string> = {
    new: 'Nowa kreacja', ramping: 'W fazie wzrostu', scaling: 'Skaluje się',
    peak: 'W szczycie', fatiguing: 'Wypala się', burned: 'Wypalona',
  };
  return `Status cyklu życia: ${labels[c.lifecycleStage] || c.lifecycleStage}.`;
}

function buildPrompt(creative: Creative): string {
  const { roas, ctr, spend, name } = creative;
  const ret = retentionSummary(creative);
  const eng = engagementSummary(creative);
  const lc = lifecycleSummary(creative);

  const context = `Kreacja video: "${name}"
Produkt: ${creative.product}
Metryki: ROAS ${roas.toFixed(1)}x, CTR ${ctr.toFixed(2)}%, Spend ${spend.toFixed(0)} PLN, Konwersje: ${creative.conversions}, Revenue: ${creative.revenue.toFixed(0)} PLN
${ret}
${eng}
${lc}`;

  const videoNote = creative.videoUrl
    ? 'WAŻNE: Przeanalizuj dokładnie załączony film — opisz co widzisz: hook (pierwsze 3 sekundy), storytelling, produkt, CTA, autentyczność kreatorki/kreatora.'
    : 'Video niedostępne — analizuj na podstawie nazwy kreacji i metryk.';

  if (roas >= 6.0) {
    return `Jesteś creative strategist pracujący dla agencji reklamowej. Analizujesz TOP kreację UGC video dla SupersonicFood.
Ta kreacja działa DOSKONALE — NIE sugeruj żadnych zmian.

${videoNote}

${context}

Opisz TYLKO co sprawia że ta kreacja jest tak skuteczna:
1. Co działa w materiale video? (hook, storytelling, autentyczność, produkt w kadrze)
2. Które elementy warto REPLIKOWAĆ w nowych kreacjach?
3. Jak zaangażowanie społeczne wpływa na wyniki?

Po polsku. ZERO krytyki, ZERO sugestii zmian. Bądź konkretny i szczegółowy.`;
  }

  if (roas >= 4.0) {
    return `Jesteś creative strategist pracujący dla agencji reklamowej. Analizujesz kreację UGC video dla SupersonicFood.

${videoNote}

${context}

1. Co działa w materiale video? (hook, storytelling, produkt)
2. Co można KREATYWNIE poprawić aby podnieść wyniki?
3. Jak retencja i zaangażowanie wpływają na performance?

Po polsku. Skup się na kreatywnych (nie mediowych) sugestiach. Bądź konkretny i szczegółowy.`;
  }

  return `Jesteś creative strategist pracujący dla agencji reklamowej. Analizujesz słabo działającą kreację UGC video dla SupersonicFood.

${videoNote}

${context}

1. Co NIE działa? (hook, przekaz, retencja, spójność z produktem)
2. Jakie elementy kreatywne osłabiają wynik?
3. Konkretne sugestie KREATYWNE co zmienić w kolejnych nagraniach.

Po polsku. Konkretne, actionable sugestie kreatywne. Bądź szczegółowy.`;
}

export async function analyzeCreative(creative: Creative): Promise<string> {
  const prompt = buildPrompt(creative);

  // Build parts — text + video if available
  const parts: Array<{ text: string } | { fileData: { mimeType: string; fileUri: string } }> = [];

  // If video URL is available, include it for Gemini to analyze
  if (creative.videoUrl) {
    parts.push({
      fileData: {
        mimeType: 'video/mp4',
        fileUri: creative.videoUrl,
      },
    });
  }

  parts.push({ text: prompt });

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    // If video analysis fails, retry without video
    if (creative.videoUrl) {
      console.error('Gemini video analysis failed, retrying text-only:', err);
      const textOnlyRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      });
      if (textOnlyRes.ok) {
        const json = await textOnlyRes.json();
        return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
      }
    }
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
}

export async function analyzeTopVsBottom(
  topCreatives: Creative[],
  bottomCreatives: Creative[]
): Promise<string> {
  const describe = (c: Creative) => {
    const ret = c.videoRetention && c.videoRetention.plays > 0
      ? `, retencja 50%: ${((c.videoRetention.p50 / c.videoRetention.plays) * 100).toFixed(0)}%`
      : '';
    const eng = c.engagement.reactions + c.engagement.comments + c.engagement.shares;
    return `- "${c.name}" (ROAS ${c.roas.toFixed(1)}x, Spend ${c.spend.toFixed(0)} PLN, CTR ${c.ctr.toFixed(2)}%${ret}, zaangażowanie: ${eng})`;
  };

  const topDesc = topCreatives.map(describe).join('\n');
  const bottomDesc = bottomCreatives.map(describe).join('\n');

  const prompt = `Jesteś creative strategist analizujący portfolio kreacji reklamowych video SupersonicFood.

TOP KREACJE (najlepsze wyniki):
${topDesc}

SŁABE KREACJE (najgorsze wyniki):
${bottomDesc}

Porównaj i odpowiedz szczegółowo:
1. Jakie WZORCE KREATYWNE łączą najlepsze kreacje? (hook, format, storytelling, retencja)
2. Jakie BŁĘDY KREATYWNE powtarzają się w słabych kreacjach?
3. Jak zaangażowanie (reakcje, komentarze, udostępnienia) koreluje z performance?
4. Jakie REKOMENDACJE KREATYWNE dla nowych materiałów UGC video?

Po polsku. Skup się TYLKO na wnioskach kreatywnych (nie mediowych).
Pamiętaj: UGC video dostarcza klient, copy/argumenty przygotowuje agencja. Bądź szczegółowy.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
}
