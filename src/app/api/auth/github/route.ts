import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
  }

  // GitHub OAuth scopes needed for repo access
  const scopes = ['repo', 'read:user', 'user:email'];
  
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('state', generateState());
  
  return NextResponse.redirect(authUrl.toString());
}

function generateState(): string {
  // In production, store this in a cookie/session and verify on callback
  return Math.random().toString(36).substring(2);
}
