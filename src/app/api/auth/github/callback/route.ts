import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(new URL('/projects?error=github_auth_denied', origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/projects?error=missing_code', origin));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return NextResponse.redirect(new URL('/projects?error=token_exchange_failed', origin));
    }

    const accessToken = tokenData.access_token;

    // Redirect to projects page with the token in a secure way
    // The client will pick this up and store it in Firestore
    // Using a short-lived token param that the client consumes immediately
    const redirectUrl = new URL('/projects', origin);
    redirectUrl.searchParams.set('github_token', accessToken);
    redirectUrl.searchParams.set('github_connected', 'pending');
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/projects?error=callback_failed', origin));
  }
}
