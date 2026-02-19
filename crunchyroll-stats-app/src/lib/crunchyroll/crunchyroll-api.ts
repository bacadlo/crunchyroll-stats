import axios, { AxiosInstance } from 'axios';
import { HistoryEntry } from '@/types/watch-history';

const BASE_URL = 'https://www.crunchyroll.com';

// Crunchyroll API client credentials
const CLIENT_ID = 'cr_web';
const CLIENT_SECRET = '';

// Modern web browser user agent
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  country: string;
  account_id: string;
}

interface Playhead {
  playhead: number;
  content_id: string;
  fully_watched: boolean;
  last_modified: string;
}

export class CrunchyrollAPI {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private accountId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
  }

  async authenticate(email: string, password: string): Promise<AuthTokens> {
    try {
      console.log('Initializing Crunchyroll API client...');

      try {
        const configResponse = await this.client.get('/index/v2', {
          headers: {
            'User-Agent': USER_AGENT,
          },
        });

        const cms = configResponse.data?.cms;
        if (cms) {
          console.log('CMS configuration retrieved successfully');
        }
      } catch (configError) {
        console.log('CMS config not required, continuing...');
      }

      console.log('Authenticating with Crunchyroll API...');

      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      formData.append('scope', 'offline_access');

      const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

      const response = await this.client.post<AuthTokens>(
        '/auth/v1/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authHeader}`,
            'User-Agent': USER_AGENT,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.expiresAt = Date.now() + response.data.expires_in * 1000;
      this.accountId = response.data.account_id;

      console.log('Authentication successful');
      console.log('Account ID:', this.accountId);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.error('Authentication failed:', errorData?.error || error.message);
        console.error('Status code:', error.response?.status);
        console.error('Error details:', errorData);

        if (errorData?.error === 'invalid_grant') {
          throw new Error('Invalid email or password. Please check your Crunchyroll credentials.');
        }
        if (errorData?.error === 'invalid_client') {
          throw new Error('Authentication service configuration error. Please try again later.');
        }

        throw new Error(errorData?.error || errorData?.message || 'Authentication failed');
      }
      throw error;
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.expiresAt - 60000) {
      throw new Error('Token expired or not available');
    }
    return this.accessToken;
  }

  async getWatchHistory(limit: number = 100): Promise<HistoryEntry[]> {
    try {
      const token = await this.ensureValidToken();

      if (!this.accountId) {
        console.log('Fetching account profile...');
        const profileResponse = await this.client.get('/accounts/v1/me/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': USER_AGENT,
          },
        });
        this.accountId = profileResponse.data.account_id;
        console.log('Account ID:', this.accountId);
      }

      console.log('Fetching watch history...');

      const playheadResponse = await this.client.get<{ data: Playhead[] }>(
        `/content/v2/playheads/${this.accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': USER_AGENT,
          },
          params: {
            locale: 'en-US',
          },
        }
      );

      const playheads = playheadResponse.data.data || [];
      console.log(`Found ${playheads.length} watched episodes`);

      if (playheads.length === 0) {
        console.log('No watch history found');
        return [];
      }

      const episodeIds = playheads.slice(0, limit).map(p => p.content_id);

      console.log(`Retrieving details for ${episodeIds.length} episodes...`);

      const episodesResponse = await this.client.get('/content/v2/cms/episodes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT,
        },
        params: {
          episode_ids: episodeIds.join(','),
          locale: 'en-US',
        },
      });

      const episodes = episodesResponse.data.data || [];
      console.log(`Retrieved ${episodes.length} episode details`);

      const playheadMap = new Map(playheads.map(p => [p.content_id, p]));

      const watchHistory: HistoryEntry[] = episodes.map((episode: any) => {
        const playhead = playheadMap.get(episode.id);
        const watchedMs = (playhead?.playhead || 0) * 1000;

        return {
          id: episode.id,
          title: episode.series_title || 'Unknown',
          episodeTitle: episode.title || 'Unknown Episode',
          watchedAt: playhead?.last_modified || new Date().toISOString(),
          progressMs: watchedMs,
          durationMs: episode.duration_ms,
          thumbnail: episode.images?.thumbnail?.[0]?.source,
        };
      });

      console.log(`Successfully processed ${watchHistory.length} watch history items`);
      return watchHistory;
    } catch (error) {
      console.error('Failed to fetch watch history:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || error.message;
        throw new Error(`Failed to fetch watch history: ${errorMsg}`);
      }
      throw error;
    }
  }

  getTokens() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
      accountId: this.accountId,
    };
  }

  setTokens(accessToken: string, refreshToken: string, expiresAt: number, accountId?: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    if (accountId) {
      this.accountId = accountId;
    }
  }
}
