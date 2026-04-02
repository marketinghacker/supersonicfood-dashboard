import { NextRequest } from 'next/server';
import { fetchDashboardData } from '../../lib/meta-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  const validDays = [7, 14, 30, 60].includes(days) ? days : 30;

  try {
    const creatives = await fetchDashboardData(validDays);
    return Response.json({
      creatives,
      lastUpdated: new Date().toISOString(),
      period: validDays,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return Response.json(
      { error: 'Błąd pobierania danych z Meta API' },
      { status: 500 }
    );
  }
}
