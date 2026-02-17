import axios, { AxiosInstance } from 'axios';
import { crunchyrollAuth } from './auth';
import { CrunchyrollPlayhead } from './types';
import { WatchHistoryItem } from '@/types/watch-history';

const API_BASE_URL = 'https://www.crunchyroll.com';

export class CrunchyrollClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAuthHeaders() {
    const token = await crunchyrollAuth.ensureValidToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getFullWatchHistory(limit: number = 100): Promise<WatchHistoryItem[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const profileResponse = await this.client.get('/accounts/v1/me/profile', { headers });
      const accountId = profileResponse.data.account_id;

      const playheadResponse = await this.client.get<{ data: CrunchyrollPlayhead[] }>(
        `/content/v2/playheads/${accountId}`,
        { 
          headers,
          params: { locale: 'en-US' }
        }
      );

      const episodeIds = playheadResponse.data.data
        .slice(0, limit)
        .map(p => p.content_id);

      if (episodeIds.length === 0) {
        return [];
      }

      const episodesResponse = await this.client.get('/content/v2/cms/episodes', {
        headers,
        params: {
          episode_ids: episodeIds.join(','),
          locale: 'en-US',
        },
      });

      const episodes = episodesResponse.data.data || [];
      const playheadMap = new Map(
        playheadResponse.data.data.map((p) => [p.content_id, p])
      );

      return episodes.map((episode: any) => {
        const playhead = playheadMap.get(episode.id);
        const durationSeconds = episode.duration_ms / 1000;
        const watchedSeconds = playhead?.playhead || 0;
        const completionPercent = durationSeconds > 0 
          ? Math.round((watchedSeconds / durationSeconds) * 100) 
          : 0;

        return {
          id: episode.id,
          animeTitle: episode.series_title,
          episodeNumber: episode.episode,
          episodeName: episode.title,
          dateWatched: playhead?.last_modified || new Date().toISOString(),
          completionPercent: Math.min(completionPercent, 100),
          duration: Math.round(durationSeconds),
          thumbnail: episode.images?.thumbnail?.[0]?.source,
          seriesId: episode.series_id,
          episodeId: episode.id,
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch watch history: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

export const crunchyrollClient = new CrunchyrollClient();