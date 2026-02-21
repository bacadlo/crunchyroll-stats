export interface HistoryEntry {
  id: string;
  mediaType?: 'episode' | 'movie';
  contentId?: string;
  seriesId?: string;
  movieListingId?: string;
  title: string;
  episodeTitle?: string;
  watchedAt?: string;
  progressMs?: number;
  durationMs?: number;
  thumbnail?: string;
  genres?: string[];
}

export interface TopAnime {
  title: string;
  count: number;
  thumbnail?: string;
}

export interface WatchHistoryStats {
  totalEpisodes: number;
  totalWatchTime: number;
  topAnime: TopAnime[];
  averageCompletion: number;
  recentlyWatched: HistoryEntry[];
}

export interface WatchHistoryResponse {
  data: HistoryEntry[];
  total: number;
  stats: WatchHistoryStats;
}
