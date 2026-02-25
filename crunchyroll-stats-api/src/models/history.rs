use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Image {
    pub source: String,
    pub width: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub media_type: String,
    pub content_id: Option<String>,
    pub series_id: Option<String>,
    pub movie_listing_id: Option<String>,
    pub title: String,
    pub episode_title: Option<String>,
    pub watched_at: Option<String>,
    pub playhead: Option<u32>,
    pub duration_ms: Option<u64>,
    pub images: Vec<Image>,
    pub genres: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct HistoryResponse {
    pub data: Vec<HistoryEntry>,
}
