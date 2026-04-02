import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (password === process.env.DASHBOARD_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return Response.json({ ok: true });
  }

  return Response.json({ error: 'Invalid password' }, { status: 401 });
}
