import { NextRequest, NextResponse } from 'next/server';
import { getRustWatchHistory } from '@/lib/crunchyroll/rust-api-client';
import { calculateStats } from '@/lib/utils';

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

    console.log('Fetching watch history via Rust API...');

    // Call Rust API
    const watchHistory = await getRustWatchHistory(session.email, session.password);
    
    console.log(` Received ${watchHistory.length} items from Rust API`);

    const stats = calculateStats(watchHistory);

    return NextResponse.json({
      data: watchHistory,
      total: watchHistory.length,
      stats,
    });
  } catch (error) {
    console.error('Watch history fetch error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch watch history',
      },
      { status: 500 }
    );
  }
}