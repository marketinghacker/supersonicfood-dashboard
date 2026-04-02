import type { Creative } from './config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-2.5-pro-preview-05-06';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildDeepContext(c: Creative): string {
  const lines: string[] = [];
  lines.push(`Kreacja video: "${c.name}"`);
  lines.push(`Produkt: ${c.product}`);
  lines.push('');

  // Performance metrics
  lines.push('=== METRYKI PERFORMANCE ===');
  lines.push(`ROAS: ${c.roas.toFixed(2)}x | Spend: ${c.spend.toFixed(0)} PLN | Revenue: ${c.revenue.toFixed(0)} PLN`);
  lines.push(`CTR: ${c.ctr.toFixed(2)}% | CPC: ${c.cpc.toFixed(2)} PLN | CPM: ${c.cpm.toFixed(2)} PLN`);
  lines.push(`Konwersje: ${c.conversions} | Impressions: ${c.impressions.toLocaleString()} | Frequency: ${c.frequency.toFixed(1)}`);

  // Link metrics
  if (c.inlineLinkClicks > 0) {
    lines.push(`Link clicks: ${c.inlineLinkClicks} | Link CTR: ${c.inlineLinkCtr.toFixed(2)}%`);
  }
  if (c.outboundClicks > 0) {
    lines.push(`Outbound clicks: ${c.outboundClicks} | Outbound CTR: ${c.outboundCtr.toFixed(3)}%`);
  }

  // Meta rankings
  if (c.qualityRanking) {
    lines.push(`Meta rankingi: Quality=${c.qualityRanking}, Engagement=${c.engagementRanking}, Conversion=${c.conversionRanking}`);
  }

  // CQI
  lines.push(`\nCreative Quality Index: ${c.cqi.score}/100 (${c.cqi.grade} — ${c.cqi.label})`);
  lines.push(`  Performance: ${c.cqi.pillars.performance}/100 | Hook: ${c.cqi.pillars.hookStrength}/100 | Story: ${c.cqi.pillars.storytelling}/100 | Engagement: ${c.cqi.pillars.engagement}/100 | Trwałość: ${c.cqi.pillars.durability}/100`);

  // Video retention
  if (c.videoRetention && c.videoRetention.plays > 0) {
    const r = c.videoRetention;
    lines.push('\n=== RETENCJA VIDEO ===');
    lines.push(`Hook Rate (3s views/impressions): ${(r.hookRate * 100).toFixed(1)}%`);
    lines.push(`Hold Rate (ThruPlay/3s views): ${(r.holdRate * 100).toFixed(1)}%`);
    lines.push(`Retencja: ${((r.p25/r.plays)*100).toFixed(0)}% @25% | ${((r.p50/r.plays)*100).toFixed(0)}% @50% | ${((r.p75/r.plays)*100).toFixed(0)}% @75% | ${((r.p95/r.plays)*100).toFixed(0)}% @95%`);
    lines.push(`ThruPlay: ${r.thruPlays.toLocaleString()} | Avg watch: ${r.avgWatchSeconds.toFixed(1)}s | Cost/ThruPlay: ${r.costPerThruPlay.toFixed(2)} PLN`);
  }

  // Engagement
  lines.push('\n=== ZAANGAŻOWANIE ===');
  lines.push(`Reakcje: ${c.engagement.reactions} | Komentarze: ${c.engagement.comments} | Udostępnienia: ${c.engagement.shares} | Zapisy: ${c.engagement.saves}`);
  lines.push(`Engagement score: ${c.engagement.engagementScore.toFixed(1)} | Kwadrant: ${c.engagementQuadrant}`);

  // Lifecycle & trend
  const labels: Record<string, string> = { new: 'Nowa', ramping: 'Rośnie', scaling: 'Skaluje', peak: 'Peak', fatiguing: 'Wypalanie', burned: 'Wypalona' };
  lines.push(`\n=== CYKL ŻYCIA: ${labels[c.lifecycleStage] || c.lifecycleStage} ===`);

  // Weekly trend
  const active = c.weeklyBuckets.filter(b => b.spend > 0);
  if (active.length > 0) {
    lines.push('Trend tygodniowy (ROAS | Spend | Revenue | Konwersje):');
    for (const b of active) {
      const date = new Date(b.dateStart).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
      lines.push(`  ${date}: ROAS ${b.roas.toFixed(1)}x | ${b.spend.toFixed(0)} PLN | ${b.revenue.toFixed(0)} PLN | ${b.conversions} konw.`);
    }
  }

  return lines.join('\n');
}

function buildPrompt(creative: Creative): string {
  const context = buildDeepContext(creative);

  const videoNote = creative.videoUrl
    ? 'WAŻNE: Przeanalizuj dokładnie załączony film — opisz hook (pierwsze 3 sekundy), storytelling, produkt w kadrze, CTA, autentyczność kreatorki/kreatora.'
    : '';

  const baseInstructions = `Jesteś senior creative strategist pracujący dla agencji reklamowej Marketing Hackers. Analizujesz kreację UGC video dla SupersonicFood.

${videoNote}

${context}

INSTRUKCJE ANALIZY:
Zbierz WSZYSTKIE dane do kupy: metryki performance (ROAS, CTR, CPC), retencję video (hook rate, hold rate), zaangażowanie (reakcje, komentarze, udostępnienia), trendy tygodniowe (czy ROAS rośnie/spada w czasie), CQI (Creative Quality Index) i Meta rankingi.

Dopiero PO zebraniu pełnego obrazu daj analizę w punktach:`;

  if (creative.roas >= 6.0) {
    return `${baseInstructions}

Ta kreacja działa DOSKONALE (ROAS ${creative.roas.toFixed(1)}x) — NIE sugeruj żadnych zmian.

Odpowiedz w bullet pointach:
• DLACZEGO ta kreacja działa tak dobrze? (na podstawie hook rate, retencji, zaangażowania, trendów)
• Co w materiale video przyciąga uwagę? (hook, storytelling, autentyczność)
• Jak trendy tygodniowe potwierdzają stabilność wyników?
• Które elementy warto REPLIKOWAĆ w nowych kreacjach?
• Jak zaangażowanie społeczne (komentarze, udostępnienia) wspiera performance?

Po polsku. ZERO krytyki. Bądź szczegółowy i oparty na danych.`;
  }

  if (creative.roas >= 4.0) {
    return `${baseInstructions}

Kreacja ma średnie wyniki (ROAS ${creative.roas.toFixed(1)}x).

Odpowiedz w bullet pointach:
• Co DZIAŁA w tej kreacji? (na podstawie danych retencji, hook rate, zaangażowania)
• Co jest SŁABE? (gdzie dane pokazują problemy — np. słaby hook, duży drop w retencji, niski CTR)
• Jak trendy tygodniowe wyglądają — stabilne, rosnące czy spadające?
• Konkretne SUGESTIE KREATYWNE co zmienić (hook, storytelling, CTA)
• Co mówi stosunek engagement vs ROAS? (wysoki engagement ale niski ROAS = problem z konwersją)

Po polsku. Skup się na kreatywnych sugestiach opartych na danych.`;
  }

  return `${baseInstructions}

Kreacja działa SŁABO (ROAS ${creative.roas.toFixed(1)}x).

Odpowiedz w bullet pointach:
• Co NIE DZIAŁA? (na podstawie danych — słaby hook rate, niska retencja, brak zaangażowania?)
• Gdzie w video tracisz widzów? (analiza retencji po kwartylach)
• Dlaczego trend tygodniowy pokazuje spadek/stagnację?
• Konkretne SUGESTIE co zmienić w kolejnym nagraniu (hook, format, tempo, CTA, produkt w kadrze)
• Czy ta kreacja powinna być wyłączona? (na podstawie trendu i lifecycle stage)

Po polsku. Konkretne, actionable sugestie kreatywne oparte na danych.`;
}

export async function analyzeCreative(creative: Creative): Promise<string> {
  const prompt = buildPrompt(creative);

  const parts: Array<{ text: string } | { fileData: { mimeType: string; fileUri: string } }> = [];
  if (creative.videoUrl && creative.videoUrl.startsWith('http')) {
    parts.push({ fileData: { mimeType: 'video/mp4', fileUri: creative.videoUrl } });
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
    if (creative.videoUrl) {
      console.error('Gemini video analysis failed, retrying text-only:', err);
      const textRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      });
      if (textRes.ok) {
        const json = await textRes.json();
        return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
      }
    }
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
}

export async function analyzeTopVsBottom(top: Creative[], bottom: Creative[]): Promise<string> {
  const describe = (c: Creative) => {
    const hook = c.videoRetention ? `hook ${(c.videoRetention.hookRate * 100).toFixed(0)}%` : '';
    const hold = c.videoRetention ? `hold ${(c.videoRetention.holdRate * 100).toFixed(0)}%` : '';
    const eng = c.engagement.reactions + c.engagement.comments + c.engagement.shares;
    return `- "${c.name}" (ROAS ${c.roas.toFixed(1)}x, CQI ${c.cqi.score}/100, Spend ${c.spend.toFixed(0)} PLN, ${hook}, ${hold}, engagement: ${eng})`;
  };

  const prompt = `Jesteś senior creative strategist. Analizujesz portfolio kreacji video SupersonicFood.

TOP KREACJE:
${top.map(describe).join('\n')}

SŁABE KREACJE:
${bottom.map(describe).join('\n')}

Odpowiedz w bullet pointach:
• Jakie WZORCE łączą najlepsze kreacje? (hook, retencja, format, storytelling)
• Jakie BŁĘDY powtarzają się w słabych? (na podstawie hook rate, hold rate, engagement)
• Jak CQI (Creative Quality Index) koreluje z ROAS — czy wyłapuje dobre kreacje?
• Jakie zaangażowanie (komentarze, udostępnienia) mają TOP vs BOTTOM?
• Konkretne REKOMENDACJE na nowe UGC video i copy

Po polsku. Pamiętaj: UGC video = klient, copy = agencja. Bądź szczegółowy.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak analizy';
}
