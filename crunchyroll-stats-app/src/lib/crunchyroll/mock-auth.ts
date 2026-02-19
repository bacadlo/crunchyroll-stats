import { HistoryEntry } from '@/types/watch-history';

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

export async function mockGetWatchHistory(): Promise<HistoryEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock watch history data
  return [
    {
      id: '1',
      title: 'Attack on Titan',
      episodeTitle: 'To You, in 2000 Years',
      watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      progressMs: 1440000,
      durationMs: 1440000,
      thumbnail: undefined,
    },
    {
      id: '2',
      title: 'Demon Slayer',
      episodeTitle: 'My Own Steel',
      watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      progressMs: 1311000,
      durationMs: 1380000,
      thumbnail: undefined,
    },
    {
      id: '3',
      title: 'My Hero Academia',
      episodeTitle: 'All Might',
      watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      progressMs: 1107600,
      durationMs: 1420000,
      thumbnail: undefined,
    },
    {
      id: '4',
      title: 'Attack on Titan',
      episodeTitle: 'That Day',
      watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      progressMs: 1440000,
      durationMs: 1440000,
      thumbnail: undefined,
    },
    {
      id: '5',
      title: 'Jujutsu Kaisen',
      episodeTitle: 'Ryomen Sukuna',
      watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      progressMs: 1440000,
      durationMs: 1440000,
      thumbnail: undefined,
    },
  ];
}
