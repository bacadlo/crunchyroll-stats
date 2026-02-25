import axios from 'axios';
import { HistoryEntry } from '@/types/watch-history';

const RUST_API_URL = process.env.RUST_API_URL || 'http://localhost:8080';

interface RustImage {
  source: string;
  width: number;
}

export async function getRustWatchHistory(
  email: string,
  password: string
): Promise<HistoryEntry[]> {
  try {
    console.log('Calling Rust API server...');

    const response = await axios.post(`${RUST_API_URL}/api/watch-history`, {
      email,
      password,
    });

    console.log(`Received ${response.data.data.length} items from Rust API`);

    const watchHistory: HistoryEntry[] = response.data.data.map((item: any) => {
      const images: RustImage[] = Array.isArray(item.images) ? item.images : [];
      const thumbnail = images.length > 0
        ? images.reduce((max, img) => img.width > max.width ? img : max).source
        : undefined;

      return {
        id: item.id,
        mediaType: item.media_type ?? undefined,
        contentId: item.content_id ?? undefined,
        seriesId: item.series_id ?? undefined,
          title: item.title,
        episodeTitle: item.episode_title ?? undefined,
        watchedAt: item.watched_at ?? undefined,
        progressMs: item.playhead != null ? item.playhead * 1000 : undefined,
        durationMs: item.duration_ms ?? undefined,
        thumbnail,
        genres: Array.isArray(item.genres) ? item.genres : [],
      };
    });

    return watchHistory;
  } catch (error) {
    console.error('Rust API call failed:', error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.error || error.message;
      throw new Error(`Failed to fetch from Rust API: ${errorMsg}`);
    }
    throw new Error('Failed to fetch watch history');
  }
}
