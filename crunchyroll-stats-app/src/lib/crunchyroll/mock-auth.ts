import { WatchHistoryItem } from '@/types/watch-history';

// Mock data for testing
export async function mockAuthenticate(email: string, password: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if credentials match env variables
  if (email === process.env.CRUNCHYROLL_EMAIL && password === process.env.CRUNCHYROLL_PASSWORD) {
    return {
      access_token: 'mock_access_token_12345',
      refresh_token: 'mock_refresh_token_67890',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'offline_access',
      country: 'US',
      account_id: 'mock_account_123',
    };
  }

  throw new Error('Invalid credentials');
}

export async function mockGetWatchHistory(): Promise<WatchHistoryItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock watch history data
  return [
    {
      id: '1',
      animeTitle: 'Attack on Titan',
      episodeNumber: '1',
      episodeName: 'To You, in 2000 Years',
      dateWatched: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      completionPercent: 100,
      duration: 1440,
      seriesId: 'series_1',
      episodeId: 'ep_1',
    },
    {
      id: '2',
      animeTitle: 'Demon Slayer',
      episodeNumber: '5',
      episodeName: 'My Own Steel',
      dateWatched: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      completionPercent: 95,
      duration: 1380,
      seriesId: 'series_2',
      episodeId: 'ep_5',
    },
    {
      id: '3',
      animeTitle: 'My Hero Academia',
      episodeNumber: '12',
      episodeName: 'All Might',
      dateWatched: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      completionPercent: 78,
      duration: 1420,
      seriesId: 'series_3',
      episodeId: 'ep_12',
    },
    {
      id: '4',
      animeTitle: 'Attack on Titan',
      episodeNumber: '2',
      episodeName: 'That Day',
      dateWatched: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      completionPercent: 100,
      duration: 1440,
      seriesId: 'series_1',
      episodeId: 'ep_2',
    },
    {
      id: '5',
      animeTitle: 'Jujutsu Kaisen',
      episodeNumber: '1',
      episodeName: 'Ryomen Sukuna',
      dateWatched: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      completionPercent: 100,
      duration: 1440,
      seriesId: 'series_4',
      episodeId: 'ep_1',
    },
  ];
}