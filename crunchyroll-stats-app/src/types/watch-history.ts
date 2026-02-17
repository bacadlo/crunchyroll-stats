export interface WatchHistoryItem {
    id: string;
    animeTitle: string;
    episodeNumber?: string;
    episodeName: string;
    dateWatched: string;
    timeWatched?: string;
    completionPercent: number;
    duration?: number;
    thumbnail?: string;
    seriesId?: string;
    episodeId?: string;
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
    recentlyWatched: WatchHistoryItem[];
  }
  
  export interface WatchHistoryResponse {
    data: WatchHistoryItem[];
    total: number;
    stats: WatchHistoryStats;
  }