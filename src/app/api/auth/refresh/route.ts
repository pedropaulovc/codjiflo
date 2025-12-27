import { NextResponse } from 'next/server';

interface RefreshRequest {
  refresh_token: string;
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
 * POST /api/auth/refresh
 * Refreshes an expired access token using a refresh token
 * This endpoint proxies the request to GitHub to keep the client secret secure
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as RefreshRequest;
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Missing required parameter: refresh_token' },
        { status: 400 }
      );
    }

    const clientId = process.env['GITHUB_APP_CLIENT_ID'];
    const clientSecret = process.env['GITHUB_APP_CLIENT_SECRET'];

    if (!clientId || !clientSecret) {
      console.error('Missing GitHub App credentials in environment');
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
        grant_type: 'refresh_token',
        refresh_token,
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
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
