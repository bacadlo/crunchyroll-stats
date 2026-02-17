import axios from 'axios';
import { WatchHistoryItem } from '@/types/watch-history';

const RUST_API_URL = process.env.RUST_API_URL || 'http://localhost:8080';

export async function getRustWatchHistory(
  email: string,
  password: string
): Promise<WatchHistoryItem[]> {
  try {
    console.log('Calling Rust API server...');

    const response = await axios.post(`${RUST_API_URL}/api/watch-history`, {
      email,
      password,
    });

    console.log(`✅ Received ${response.data.total} items from Rust API`);

    // Transform Rust response to our format
    const watchHistory: WatchHistoryItem[] = response.data.data.map((item: any) => ({
      id: item.id,
      animeTitle: item.anime_title,
      episodeNumber: item.episode_number || '',
      episodeName: item.episode_name,
      dateWatched: item.date_watched,
      completionPercent: item.completion_percent,
      duration: item.duration,
      thumbnail: item.thumbnail || undefined,
      seriesId: '',
      episodeId: item.id,
    }));

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