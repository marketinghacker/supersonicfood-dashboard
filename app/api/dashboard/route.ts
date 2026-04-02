import { fetchDashboardData } from '../../lib/meta-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    const creatives = await fetchDashboardData();
    return Response.json({
      creatives,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return Response.json(
      { error: 'Błąd pobierania danych z Meta API' },
      { status: 500 }
    );
  }
}
