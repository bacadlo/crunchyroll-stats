use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct WatchedItem {
    pub title: String,
    pub episode_title: Option<String>,
    pub date_watched: DateTime<Utc>,
    pub progress: f64,
    pub fully_watched: bool,
    pub thumbnail: Option<String>,
}


#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}


#[derive(Debug, Serialize)]
pub struct WatchHistoryResponse {
    pub data: Vec<WatchHistoryItem>,
    pub total: usize,
}


#[derive(Debug, Serialize)]
pub struct WatchHistoryItem {
    pub id: String,
    pub anime_title: String,
    pub episode_number: String,
    pub episode_name: String,
    pub date_watched: String,
    pub completion_percent: u32,
    pub duration: u32,
    pub thumbnail: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}