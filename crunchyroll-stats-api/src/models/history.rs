use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub title: String,
    pub episode_title: Option<String>,
    pub watched_at: Option<String>,
    pub progress_ms: Option<u64>,
    pub duration_ms: Option<u64>,
    pub thumbnail: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HistoryResponse {
    pub data: Vec<HistoryEntry>,
    pub total: usize,
}
