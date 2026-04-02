import type { Creative } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(creative: Creative): string {
  const { roas, ctr, spend, name } = creative;

  if (roas >= 6.0) {
    return `Jesteś creative strategist. Analizujesz TOP kreację reklamową "${name}" (ROAS ${roas.toFixed(1)}x).
Ta kreacja działa DOSKONALE — NIE sugeruj żadnych zmian.

Opisz TYLKO co sprawia że ta kreacja jest tak skuteczna:
1. Co działa w materiale video? (hook, storytelling, autentyczność)
2. Jak copy wspiera video? (argumenty, CTA, spójność)
3. Które elementy warto REPLIKOWAĆ w nowych kreacjach?

Copy reklamy: "${creative.adCopy}"

Metryki: ROAS ${roas.toFixed(1)}x, CTR ${ctr.toFixed(2)}%, Spend ${spend.toFixed(0)} PLN, Konwersje: ${creative.conversions}
Po polsku, max 150 słów. ZERO krytyki, ZERO sugestii zmian.`;
  }

  if (roas >= 4.0) {
    return `Jesteś creative strategist. Analizujesz kreację reklamową "${name}" (ROAS ${roas.toFixed(1)}x).

1. Co działa w materiale video?
2. Jak copy wspiera video?
3. Co można KREATYWNIE poprawić aby podnieść wyniki?

Copy reklamy: "${creative.adCopy}"

Metryki: ROAS ${roas.toFixed(1)}x, CTR ${ctr.toFixed(2)}%, Spend ${spend.toFixed(0)} PLN, Konwersje: ${creative.conversions}
Po polsku, max 150 słów. Skup się na kreatywnych (nie mediowych) sugestiach.`;
  }

  return `Jesteś creative strategist. Analizujesz słabo działającą kreację reklamową "${name}" (ROAS ${roas.toFixed(1)}x).

1. Co NIE działa? (hook, przekaz, spójność video+copy)
2. Jakie elementy kreatywne osłabiają wynik?
3. Konkretne sugestie KREATYWNE co zmienić.

Copy reklamy: "${creative.adCopy}"

Metryki: ROAS ${roas.toFixed(1)}x, CTR ${ctr.toFixed(2)}%, Spend ${spend.toFixed(0)} PLN, Konwersje: ${creative.conversions}
Po polsku, max 150 słów. Konkretne, actionable sugestie kreatywne.`;
}

export async function analyzeCreative(creative: Creative): Promise<string> {
  const prompt = buildPrompt(creative);

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
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
  const topDesc = topCreatives
    .map(c => `- "${c.name}" (ROAS ${c.roas.toFixed(1)}x, CTR ${c.ctr.toFixed(2)}%): ${c.adCopy.slice(0, 100)}`)
    .join('\n');

  const bottomDesc = bottomCreatives
    .map(c => `- "${c.name}" (ROAS ${c.roas.toFixed(1)}x, CTR ${c.ctr.toFixed(2)}%): ${c.adCopy.slice(0, 100)}`)
    .join('\n');

  const prompt = `Jesteś creative strategist analizujący portfolio kreacji reklamowych SupersonicFood.

TOP KREACJE (najlepsze wyniki):
${topDesc}

SŁABE KREACJE (najgorsze wyniki):
${bottomDesc}

Porównaj i odpowiedz:
1. Jakie WZORCE KREATYWNE łączą najlepsze kreacje? (hook, format, storytelling)
2. Jakie BŁĘDY KREATYWNE powtarzają się w słabych kreacjach?
3. Jakie REKOMENDACJE KREATYWNE dla nowych materiałów UGC i copy?

Po polsku, max 250 słów. Skup się TYLKO na wnioskach kreatywnych (nie mediowych).
Pamiętaj: UGC video dostarcza klient, copy/argumenty przygotowuje agencja.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
}
