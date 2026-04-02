import { fetchDashboardData } from '../../lib/meta-api';
import { analyzeTopVsBottom } from '../../lib/gemini-analyze';

export const maxDuration = 600;

export async function POST() {
  try {
    const creatives = await fetchDashboardData();

    // Only videos with enough spend
    const videos = creatives.filter(c => c.creativeType === 'video' && c.spend >= 200);

    const sorted = [...videos].sort((a, b) => b.roas - a.roas);
    const top = sorted.slice(0, 5);
    const bottom = sorted.slice(-5).reverse();

    if (top.length === 0 || bottom.length === 0) {
      return Response.json({ analysis: 'Za mało kreacji video z wystarczającymi danymi do porównania.' });
    }

    const analysis = await analyzeTopVsBottom(top, bottom);
    return Response.json({ analysis });
  } catch (error) {
    console.error('Analyze-top API error:', error);
    return Response.json({ error: 'Błąd analizy AI' }, { status: 500 });
  }
}
