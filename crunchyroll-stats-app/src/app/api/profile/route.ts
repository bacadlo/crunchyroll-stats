import { NextRequest, NextResponse } from 'next/server';
import { getRustProfile } from '@/lib/crunchyroll/rust-api-client';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('cr_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);

    if (Date.now() >= session.expires_at) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const profile = await getRustProfile(session.email, session.password);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}
