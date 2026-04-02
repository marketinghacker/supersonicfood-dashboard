import type { Creative } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-3.1-pro-preview';
const GEMINI_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function buildDeepContext(c: Creative): string {
  const lines: string[] = [];
  lines.push(`Kreacja: "${c.name}" | Produkt: ${c.product}`);
  lines.push(`ROAS: ${c.roas.toFixed(2)}x | Spend: ${c.spend.toFixed(0)} PLN | Revenue: ${c.revenue.toFixed(0)} PLN | Konwersje: ${c.conversions}`);
  lines.push(`CTR: ${c.ctr.toFixed(2)}% | CPC: ${c.cpc.toFixed(2)} PLN | CPM: ${c.cpm.toFixed(2)} PLN | Frequency: ${c.frequency.toFixed(1)}`);
  lines.push(`CQI: ${c.cqi.score}/100 (${c.cqi.grade}) | Hook: ${c.cqi.pillars.hookStrength} | Story: ${c.cqi.pillars.storytelling} | Engage: ${c.cqi.pillars.engagement} | Trwałość: ${c.cqi.pillars.durability}`);

  if (c.inlineLinkClicks > 0) lines.push(`Link clicks: ${c.inlineLinkClicks} | Link CTR: ${c.inlineLinkCtr.toFixed(2)}%`);
  if (c.qualityRanking) lines.push(`Meta: Quality=${c.qualityRanking} | Engagement=${c.engagementRanking} | Conversion=${c.conversionRanking}`);

  if (c.videoRetention && c.videoRetention.plays > 0) {
    const r = c.videoRetention;
    lines.push(`\nRETENCJA: Hook rate=${(r.hookRate * 100).toFixed(1)}% | Hold rate=${(r.holdRate * 100).toFixed(1)}%`);
    lines.push(`Retencja: ${((r.p25/r.plays)*100).toFixed(0)}%@25% | ${((r.p50/r.plays)*100).toFixed(0)}%@50% | ${((r.p75/r.plays)*100).toFixed(0)}%@75% | ${((r.p95/r.plays)*100).toFixed(0)}%@95%`);
    lines.push(`ThruPlay: ${r.thruPlays} | Avg watch: ${r.avgWatchSeconds.toFixed(1)}s | Cost/ThruPlay: ${r.costPerThruPlay.toFixed(2)} PLN`);
  }

  lines.push(`\nENGAGEMENT: ❤️${c.engagement.reactions} 💬${c.engagement.comments} ↗️${c.engagement.shares} 🔖${c.engagement.saves} | Score: ${c.engagement.engagementScore.toFixed(1)}`);

  const active = c.weeklyBuckets.filter(b => b.spend > 0);
  if (active.length > 0) {
    lines.push(`\nTREND TYGODNIOWY (${active.length} tyg.):`);
    for (const b of active) {
      const d = new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
      lines.push(`  ${d}: ROAS ${b.roas.toFixed(1)}x | ${b.spend.toFixed(0)} PLN | Freq ${b.frequency.toFixed(1)} | CPM ${b.cpm.toFixed(1)}`);
    }
  }

  if (c.adCopy) lines.push(`\nTEKST REKLAMOWY (ad copy):\n"${c.adCopy}"`);

  return lines.join('\n');
}

function buildStructuredPrompt(c: Creative): string {
  const context = buildDeepContext(c);
  const videoNote = c.videoUrl ? 'Masz dostęp do załączonego filmu — OBEJRZYJ GO i opisz co widzisz.' : '';

  return `Jesteś senior creative strategist w agencji Marketing Hackers. Analizujesz kreację UGC video dla SupersonicFood.

${videoNote}

DANE KREACJI:
${context}

WYPEŁNIJ KAŻDĄ SEKCJĘ PONIŻEJ. Nie pomijaj żadnej. Jeśli brak danych — napisz "BRAK DANYCH".

## 1. HOOK (pierwsze 3 sekundy)
**Typ hooka**: [wybierz: Szok wizualny / Pytanie / Kontrowersja / Problem / Rezultat najpierw / POV / Pattern interrupt / Social proof / Ciekawość / Demonstracja]
**Co się dzieje**: [dosłownie co widać i słychać w pierwszych 3 sekundach]
**Dlaczego działa/nie działa**: [3 bullet pointy]
**Ocena**: [1-10]/10
**Alternatywny hook do testu**: [konkretna propozycja]

## 2. NARRACJA I STORYTELLING
**Model narracyjny**: [wybierz: Problem-Agitacja-Rozwiązanie / Przed-Po / 3 Powody / Dzień z życia / Testimonial / Porównanie / How-To / Lista korzyści]
**Mapa narracji**: [timeline z timestamps, np. "0-3s: HOOK, 3-8s: PROBLEM, 8-18s: ROZWIĄZANIE, 18-24s: DOWÓD, 24-27s: CTA"]
**Punkty retencji** (momenty trzymające widza): [bullet pointy z timestamps]
**Punkty odpadu** (gdzie tracisz widzów): [bullet pointy z timestamps]
**Ocena**: [1-10]/10

## 3. ANALIZA AUDIO I GŁOSU
**Typ**: [Voiceover naturalny / Profesjonalny / AI / Muzyka / ASMR / Dialog / Mix]
**Ton głosu**: [Przyjacielski / Ekspercki / Entuzjastyczny / Spokojny / Konwersacyjny / Pilny / Empatyczny / Pewny siebie]
**Muzyka**: [opis + czy wspiera czy dominuje]
**Ocena**: [1-10]/10

## 4. TRANSKRYPCJA I ARGUMENTACJA
**Kluczowe argumenty sprzedażowe**: [numerowana lista z klasyfikacją: Funkcjonalny/Emocjonalny/Społeczny/Ekonomiczny]
**Adresowane problemy klienta**: [bullet pointy]
**CTA**: [co mówi + ocena siły CTA]
**Ocena**: [1-10]/10

## 5. KOMPOZYCJA WIZUALNA
**Estetyka**: [Lo-Fi UGC / Polished UGC / Studio / Lifestyle / Raw / Hybrid]
**Kadrowanie**: [plan, ruch kamery, kontakt wzrokowy]
**Tempo montażu**: [cięcia/minutę + ocena]
**Branding**: [jak produkt jest widoczny]
**Ocena**: [1-10]/10

## 6. TEKST REKLAMOWY (AD COPY)
**Analiza nagłówka**: [ocena]
**Spójność copy ↔ video**: [1-10, czy copy i video mówią to samo]
**Ocena**: [1-10]/10

## 7. CZĘSTOTLIWOŚĆ I ZMĘCZENIE
**Wpływ frequency na ROAS**: [jak frequency zmienia się w czasie i jak wpływa na performance]
**Punkt krytyczny**: [przy jakiej frequency ROAS zaczyna spadać]
**Odporność na zmęczenie**: [Wysoka / Średnia / Niska + uzasadnienie]

## 8. SOCIAL PROOF → PERFORMANCE
**Jak engagement wpływa na wyniki**: [korelacja reakcji/komentarzy/udostępnień z ROAS w czasie]
**Czy social proof jest wiodący czy opóźniony**: [czy engagement rośnie PRZED czy PO wzroście ROAS]

## 9. ZASTOSOWANIE NA INNE PRODUKTY
**Przenośne elementy**: [co z tej kreacji zadziała dla innych produktów SupersonicFood]
**Anty-wzorce**: [czego NIE replikować]
**Szablon do replikacji**: [konkretny framework: czas + struktura]

## 10. REKOMENDACJE
**Top 3 zmiany** (uporządkowane po wpływie): [konkretne, actionable]
**Warianty A/B do przetestowania**: [2 konkretne testy]

Po polsku. Bądź szczegółowy, oparty na danych. Każda ocena musi mieć uzasadnienie.`;
}

async function callGemini(model: string, parts: Array<{ text: string } | { fileData: { mimeType: string; fileUri: string } }>): Promise<string | null> {
  const url = `${GEMINI_URL_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.7 },
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export async function analyzeCreative(creative: Creative): Promise<string> {
  const prompt = buildStructuredPrompt(creative);
  const parts: Array<{ text: string } | { fileData: { mimeType: string; fileUri: string } }> = [];

  if (creative.videoUrl && creative.videoUrl.startsWith('http')) {
    parts.push({ fileData: { mimeType: 'video/mp4', fileUri: creative.videoUrl } });
  }
  parts.push({ text: prompt });

  const result = await callGemini(GEMINI_MODEL, parts);

  return result || 'Błąd analizy — spróbuj ponownie.';
}

export async function analyzeTopVsBottom(top: Creative[], bottom: Creative[]): Promise<string> {
  const describe = (c: Creative) => {
    const hook = c.videoRetention ? `hook ${(c.videoRetention.hookRate * 100).toFixed(0)}%` : '';
    const hold = c.videoRetention ? `hold ${(c.videoRetention.holdRate * 100).toFixed(0)}%` : '';
    return `- "${c.name}" (CQI ${c.cqi.score}, ROAS ${c.roas.toFixed(1)}x, Spend ${c.spend.toFixed(0)} PLN, ${hook}, ${hold}, ❤️${c.engagement.reactions} 💬${c.engagement.comments} ↗️${c.engagement.shares})`;
  };

  const prompt = `Jesteś senior creative strategist. Analizujesz portfolio kreacji video SupersonicFood.

TOP (najlepsze):
${top.map(describe).join('\n')}

BOTTOM (najsłabsze):
${bottom.map(describe).join('\n')}

## WZORCE ZWYCIĘZCÓW
[co łączy najlepsze kreacje — hook, retencja, format, storytelling]

## BŁĘDY W SŁABYCH
[powtarzające się problemy]

## SOCIAL PROOF → PERFORMANCE
[jak engagement koreluje z wynikami w top vs bottom]

## REKOMENDACJE NA NOWE UGC
[konkretne briefy kreatywne]

Po polsku. Szczegółowo, z danymi. UGC = klient, copy = agencja.`;

  const result = await callGemini(GEMINI_MODEL, [{ text: prompt }]);
  return result || 'Błąd analizy.';
}

export async function analyzeProduct(creatives: Creative[], productName: string): Promise<string> {
  const describe = (c: Creative) =>
    `- "${c.name}" CQI=${c.cqi.score} ROAS=${c.roas.toFixed(1)}x Spend=${c.spend.toFixed(0)} Lifecycle=${c.lifecycleStage} Hook=${c.videoRetention ? (c.videoRetention.hookRate * 100).toFixed(0) + '%' : 'n/a'}`;

  const sorted = [...creatives].sort((a, b) => b.cqi.score - a.cqi.score);

  const prompt = `Analizujesz WSZYSTKIE kreacje video dla produktu "${productName}" (SupersonicFood).

KREACJE (${sorted.length} szt., posortowane po CQI):
${sorted.map(describe).join('\n')}

## PODSUMOWANIE PRODUKTU
[najlepsza kreacja i dlaczego, najsłabsza i dlaczego]

## TRENDY
[co rośnie, co spada, czy potrzebne nowe kreacje]

## CO DZIAŁA DLA ${productName.toUpperCase()}
[jakie hooki, argumenty, formaty najlepiej konwertują dla tego produktu]

## REKOMENDACJE NA NOWE KREACJE
[3 konkretne briefy kreatywne z opisem hooka, struktury, argumentów]

Po polsku. Bądź szczegółowy.`;

  const result = await callGemini(GEMINI_MODEL, [{ text: prompt }]);
  return result || 'Błąd analizy.';
}
