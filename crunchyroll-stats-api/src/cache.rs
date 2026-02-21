use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

use crate::models::{HistoryEntry, Profile};

const HISTORY_TTL: Duration = Duration::from_secs(10 * 60); // 10 minutes
const PROFILE_TTL: Duration = Duration::from_secs(30 * 60); // 30 minutes

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

pub struct AppCache {
    history: RwLock<HashMap<String, CacheEntry<Vec<HistoryEntry>>>>,
    profiles: RwLock<HashMap<String, CacheEntry<Profile>>>,
}

impl AppCache {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            history: RwLock::new(HashMap::new()),
            profiles: RwLock::new(HashMap::new()),
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

    pub async fn get_profile(&self, key: &str) -> Option<Profile> {
        let cache = self.profiles.read().await;
        cache.get(key).and_then(|entry| {
            if entry.is_expired() {
                None
            } else {
                Some(entry.data.clone())
            }
        })
    }

    pub async fn set_profile(&self, key: String, data: Profile) {
        let mut cache = self.profiles.write().await;
        cache.insert(key, CacheEntry {
            data,
            inserted_at: Instant::now(),
            ttl: PROFILE_TTL,
        });
    }
}
