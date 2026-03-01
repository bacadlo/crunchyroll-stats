import { NextResponse } from 'next/server';
import { getRustWatchHistory } from '@/lib/crunchyroll/rust-api-client';
import { calculateStats } from '@/lib/utils';
import { getCached, setCache } from '@/lib/server-cache';
import { WatchHistoryResponse } from '@/types/watch-history';
import { validateSession, SessionError } from '@/lib/session';

export async function GET() {
  try {
    const session = await validateSession();

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
    if (error instanceof SessionError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.error('Watch history fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch watch history' },
      { status: 500 }
    );
  }
}
