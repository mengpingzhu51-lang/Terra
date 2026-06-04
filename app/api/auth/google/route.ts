import { OAuth2Client } from 'google-auth-library';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const client = new OAuth2Client();

export async function POST(req: Request) {
  const { credential } = await req.json();

  if (!credential) {
    return Response.json({ error: '缺少 Google 凭证' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return Response.json({ error: '服务端未配置 GOOGLE_CLIENT_ID' }, { status: 500 });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      return Response.json({ error: 'Google 凭证无效' }, { status: 400 });
    }

    return Response.json({
      user: {
        id: `google_${payload.sub}`,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture || undefined,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Google token verification failed:', err.message);
    return Response.json({ error: 'Google 凭证验证失败' }, { status: 401 });
  }
}
