// Simple in-memory store for product overrides
// In production, use Vercel KV or similar persistent storage
const overrides = new Map<string, string>();

export async function PUT(request: Request) {
  try {
    const { adId, product } = await request.json();
    if (!adId || !product) {
      return Response.json({ error: 'Missing adId or product' }, { status: 400 });
    }
    overrides.set(adId, product);
    return Response.json({ ok: true, adId, product });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return Response.json(Object.fromEntries(overrides));
}
