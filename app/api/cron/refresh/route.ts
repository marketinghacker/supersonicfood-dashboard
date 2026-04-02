import { fetchDashboardData } from '../../../lib/meta-api';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await fetchDashboardData();
    return Response.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Cron refresh error:', error);
    return Response.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
