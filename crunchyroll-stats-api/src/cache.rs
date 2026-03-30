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

    #[cfg(test)]
    async fn set_history_expired(&self, key: String, data: Vec<HistoryEntry>) {
        let mut cache = self.history.write().await;
        cache.insert(key, CacheEntry {
            data,
            inserted_at: Instant::now(),
            ttl: Duration::ZERO,
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_entry(id: &str) -> HistoryEntry {
        HistoryEntry {
            id: id.to_string(),
            media_type: "episode".to_string(),
            content_id: None,
            series_id: None,
            movie_listing_id: None,
            title: "Test Anime".to_string(),
            episode_title: None,
            watched_at: None,
            playhead: None,
            duration_ms: None,
            images: vec![],
            genres: vec![],
        }
    }

    #[test]
    fn cache_key_is_deterministic() {
        let key1 = AppCache::cache_key("user@example.com");
        let key2 = AppCache::cache_key("user@example.com");
        assert_eq!(key1, key2);
    }

    #[test]
    fn cache_key_different_emails_differ() {
        let key1 = AppCache::cache_key("alice@example.com");
        let key2 = AppCache::cache_key("bob@example.com");
        assert_ne!(key1, key2);
    }

    #[test]
    fn cache_key_is_64_char_hex() {
        let key = AppCache::cache_key("user@example.com");
        assert_eq!(key.len(), 64);
        assert!(key.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[tokio::test]
    async fn get_history_miss_returns_none() {
        let cache = AppCache::new();
        let result = cache.get_history("nonexistent").await;
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn set_and_get_history_returns_data() {
        let cache = AppCache::new();
        let data = vec![make_entry("item-0"), make_entry("item-1")];
        cache.set_history("key1".to_string(), data.clone()).await;

        let result = cache.get_history("key1").await;
        assert!(result.is_some());
        let entries = result.unwrap();
        assert_eq!(entries.len(), 2);
        assert_eq!(entries[0].id, "item-0");
        assert_eq!(entries[1].id, "item-1");
    }

    #[tokio::test]
    async fn get_history_expired_returns_none() {
        let cache = AppCache::new();
        cache.set_history_expired("key2".to_string(), vec![make_entry("item-0")]).await;

        let result = cache.get_history("key2").await;
        assert!(result.is_none());
    }
}
