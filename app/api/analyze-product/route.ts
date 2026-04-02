import { fetchDashboardData } from '../../lib/meta-api';
import { analyzeProduct } from '../../lib/gemini-analyze';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { productName, creativeIds } = await request.json();
    if (!productName) return Response.json({ error: 'Missing productName' }, { status: 400 });

    const allCreatives = await fetchDashboardData();
    const productCreatives = creativeIds
      ? allCreatives.filter(c => creativeIds.includes(c.id))
      : allCreatives.filter(c => c.product === productName && c.creativeType === 'video');

    if (productCreatives.length === 0) {
      return Response.json({ analysis: 'Brak kreacji video dla tego produktu.' });
    }

    const analysis = await analyzeProduct(productCreatives, productName);
    return Response.json({ analysis });
  } catch (error) {
    console.error('Analyze-product error:', error);
    return Response.json({ error: 'Błąd analizy' }, { status: 500 });
  }
}
