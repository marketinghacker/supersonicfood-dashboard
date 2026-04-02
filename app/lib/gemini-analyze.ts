import type { Creative } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function retentionSummary(c: Creative): string {
  if (!c.videoRetention || c.videoRetention.plays === 0) return '';
  const r = c.videoRetention;
  const p25 = ((r.p25 / r.plays) * 100).toFixed(0);
  const p50 = ((r.p50 / r.plays) * 100).toFixed(0);
  const p75 = ((r.p75 / r.plays) * 100).toFixed(0);
  return `Retencja: ${p25}% @25%, ${p50}% @50%, ${p75}% @75%. Avg watch: ${r.avgWatchSeconds.toFixed(1)}s.`;
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
    new: 'Nowa kreacja',
    ramping: 'W fazie wzrostu',
    scaling: 'Skaluje się',
    peak: 'W szczycie',
    fatiguing: 'Wypala się',
    burned: 'Wypalona',
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

  if (roas >= 6.0) {
    return `Jesteś creative strategist. Analizujesz TOP kreację reklamową UGC video.
Ta kreacja działa DOSKONALE — NIE sugeruj żadnych zmian.

${context}

Opisz TYLKO co sprawia że ta kreacja jest tak skuteczna:
1. Co prawdopodobnie działa w materiale video? (hook, storytelling, autentyczność)
2. Które elementy warto REPLIKOWAĆ w nowych kreacjach?
3. Jak zaangażowanie społeczne wpływa na wyniki?

Po polsku, max 200 słów. ZERO krytyki, ZERO sugestii zmian. Bądź konkretny.`;
  }

  if (roas >= 4.0) {
    return `Jesteś creative strategist. Analizujesz kreację reklamową UGC video.

${context}

1. Co działa w materiale video?
2. Co można KREATYWNIE poprawić aby podnieść wyniki?
3. Jak retencja i zaangażowanie wpływają na performance?

Po polsku, max 200 słów. Skup się na kreatywnych (nie mediowych) sugestiach. Bądź konkretny.`;
  }

  return `Jesteś creative strategist. Analizujesz słabo działającą kreację reklamową UGC video.

${context}

1. Co NIE działa? (hook, przekaz, retencja)
2. Jakie elementy kreatywne osłabiają wynik?
3. Konkretne sugestie KREATYWNE co zmienić.

Po polsku, max 200 słów. Konkretne, actionable sugestie kreatywne.`;
}

export async function analyzeCreative(creative: Creative): Promise<string> {
  const prompt = buildPrompt(creative);

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
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
    return `- "${c.name}" (ROAS ${c.roas.toFixed(1)}x, Spend ${c.spend.toFixed(0)} PLN, CTR ${c.ctr.toFixed(2)}%${ret}, engagement: ${eng})`;
  };

  const topDesc = topCreatives.map(describe).join('\n');
  const bottomDesc = bottomCreatives.map(describe).join('\n');

  const prompt = `Jesteś creative strategist analizujący portfolio kreacji reklamowych video SupersonicFood.

TOP KREACJE (najlepsze wyniki):
${topDesc}

SŁABE KREACJE (najgorsze wyniki):
${bottomDesc}

Porównaj i odpowiedz:
1. Jakie WZORCE KREATYWNE łączą najlepsze kreacje? (hook, format, storytelling, retencja)
2. Jakie BŁĘDY KREATYWNE powtarzają się w słabych kreacjach?
3. Jak zaangażowanie (reakcje, komentarze, udostępnienia) koreluje z performance?
4. Jakie REKOMENDACJE KREATYWNE dla nowych materiałów UGC video?

Po polsku, max 300 słów. Skup się TYLKO na wnioskach kreatywnych (nie mediowych).
Pamiętaj: UGC video dostarcza klient, copy/argumenty przygotowuje agencja.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
}
