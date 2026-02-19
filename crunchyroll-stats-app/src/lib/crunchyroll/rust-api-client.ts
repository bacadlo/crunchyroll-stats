import axios from 'axios';
import { HistoryEntry } from '@/types/watch-history';
import { AccountOwner, Profile } from '@/types/auth';

const RUST_API_URL = process.env.RUST_API_URL || 'http://localhost:8080';

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

    console.log(`Received ${response.data.total} items from Rust API`);

    const watchHistory: HistoryEntry[] = response.data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      episodeTitle: item.episode_title ?? undefined,
      watchedAt: item.watched_at ?? undefined,
      progressMs: item.progress_ms ?? undefined,
      durationMs: item.duration_ms ?? undefined,
      thumbnail: item.thumbnail ?? undefined,
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

export async function getRustAccount(
  email: string,
  password: string
): Promise<AccountOwner> {
  try {
    const response = await axios.post(`${RUST_API_URL}/api/account`, {
      email,
      password,
    });

    const data = response.data;
    return {
      accountId: data.account_id,
      email: data.email,
      createdAt: data.created_at,
      premium: data.premium,
    };
  } catch (error) {
    console.error('Rust API account call failed:', error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.error || error.message;
      throw new Error(`Failed to fetch account: ${errorMsg}`);
    }
    throw new Error('Failed to fetch account');
  }
}

export async function getRustProfile(
  email: string,
  password: string
): Promise<Profile> {
  try {
    const response = await axios.post(`${RUST_API_URL}/api/profile`, {
      email,
      password,
    });

    const data = response.data;
    return {
      profileId: data.profile_id,
      username: data.username,
      profileName: data.profile_name,
      avatar: data.avatar,
      maturityRating: data.maturity_rating,
      isPrimary: data.is_primary,
    };
  } catch (error) {
    console.error('Rust API profile call failed:', error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.error || error.message;
      throw new Error(`Failed to fetch profile: ${errorMsg}`);
    }
    throw new Error('Failed to fetch profile');
  }
}
