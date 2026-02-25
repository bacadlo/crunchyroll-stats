import { NextRequest, NextResponse } from 'next/server';
import { getRustWatchHistory } from '@/lib/crunchyroll/rust-api-client';
import { calculateStats } from '@/lib/utils';
import { getCached, setCache } from '@/lib/server-cache';
import { WatchHistoryResponse } from '@/types/watch-history';

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

    const cacheKey = `history:${session.email}`;
    const cached = getCached<WatchHistoryResponse>(cacheKey);
    if (cached) {
      console.log(`Returning cached watch history (${cached.data.length} items)`);
      return NextResponse.json(cached);
    }

    console.log('Fetching watch history via Rust API...');

    const watchHistory = await getRustWatchHistory(session.email, session.password);

    console.log(`Received ${watchHistory.length} items from Rust API`);

    const stats = calculateStats(watchHistory);

    const result: WatchHistoryResponse = {
      data: watchHistory,
      stats,
    };

    setCache(cacheKey, result);

    return NextResponse.json(result);
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
