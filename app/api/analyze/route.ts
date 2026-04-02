import { analyzeCreative } from '../../lib/gemini-analyze';
import type { Creative } from '../../lib/config';

export const maxDuration = 600;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const creative: Creative = body.creative;

    if (!creative) {
      return Response.json({ error: 'Brak danych kreacji' }, { status: 400 });
    }

    const analysis = await analyzeCreative(creative);
    return Response.json({ analysis });
  } catch (error) {
    console.error('Analyze API error:', error);
    return Response.json({ error: 'Błąd analizy AI' }, { status: 500 });
  }
}
