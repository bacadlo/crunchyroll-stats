use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

use crate::models::HistoryEntry;

const HISTORY_TTL: Duration = Duration::from_secs(60 * 60); // 60 minutes

struct CacheEntry<T> {
    data: T,
    inserted_at: Instant,
    ttl: Duration,
}

impl<T> CacheEntry<T> {
    fn is_expired(&self) -> bool {
        self.inserted_at.elapsed() > self.ttl
    }
}

/// In-memory cache isolated per user.
/// Cache keys are SHA256 hashes of the user's email address, ensuring:
/// - Each user's data is stored under a unique, non-reversible key
/// - No scenario where user A's lookup can return user B's data
/// - Email addresses are not stored as plain text in cache keys
pub struct AppCache {
    history: RwLock<HashMap<String, CacheEntry<Vec<HistoryEntry>>>>,
}

impl AppCache {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            history: RwLock::new(HashMap::new()),
        })
    }

    pub fn cache_key(email: &str) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(email.as_bytes());
        hex::encode(hasher.finalize())
    }

    pub async fn get_history(&self, key: &str) -> Option<Vec<HistoryEntry>> {
        let cache = self.history.read().await;
        cache.get(key).and_then(|entry| {
            if entry.is_expired() {
                None
            } else {
                Some(entry.data.clone())
            }
        })
    }

    pub async fn set_history(&self, key: String, data: Vec<HistoryEntry>) {
        let mut cache = self.history.write().await;
        cache.insert(key, CacheEntry {
            data,
            inserted_at: Instant::now(),
            ttl: HISTORY_TTL,
        });
    }
}
