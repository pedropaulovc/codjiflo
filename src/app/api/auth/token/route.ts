import { NextResponse } from 'next/server';

interface TokenRequest {
  code: string;
  code_verifier: string;
}

interface GitHubTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

/**
 * POST /api/auth/token
 * Exchanges an authorization code for access and refresh tokens
 * This endpoint proxies the request to GitHub to keep the client secret secure
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as TokenRequest;
    const { code, code_verifier } = body;

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: 'Missing required parameters: code and code_verifier' },
        { status: 400 }
      );
    }

    const clientId = process.env['GITHUB_APP_CLIENT_ID'];
    const clientSecret = process.env['GITHUB_APP_CLIENT_SECRET'];

    if (!clientId || !clientSecret) {
      const missing = [];
      if (!clientId) missing.push('GITHUB_APP_CLIENT_ID');
      if (!clientSecret) missing.push('GITHUB_APP_CLIENT_SECRET');
      console.error(`Missing GitHub App credentials: ${missing.join(', ')}`);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier,
      }),
    });

    const data = await response.json() as GitHubTokenResponse;

    if (data.error) {
      return NextResponse.json(
        { error: data.error, error_description: data.error_description },
        { status: 400 }
      );
    }

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      refresh_token_expires_in: data.refresh_token_expires_in,
      token_type: data.token_type,
      scope: data.scope,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
