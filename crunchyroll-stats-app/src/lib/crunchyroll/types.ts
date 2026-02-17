export interface CrunchyrollAuthResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    country: string;
    account_id: string;
  }
  
  export interface CrunchyrollPlayhead {
    playhead: number;
    content_id: string;
    fully_watched: boolean;
    last_modified: string;
  }
  
  export interface CrunchyrollEpisode {
    id: string;
    series_id: string;
    series_title: string;
    episode: string;
    title: string;
    duration_ms: number;
    images: {
      thumbnail: Array<{
        source: string;
      }>;
    };
  }