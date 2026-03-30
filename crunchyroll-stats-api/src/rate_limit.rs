use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

const MAX_FAILURES: u32 = 5;
const WINDOW: Duration = Duration::from_secs(15 * 60); // 15 minutes
const CLEANUP_INTERVAL: Duration = Duration::from_secs(5 * 60); // 5 minutes

struct Entry {
    failures: u32,
    window_start: Instant,
}

pub struct RateLimiter {
    entries: Mutex<HashMap<IpAddr, Entry>>,
}

impl RateLimiter {
    pub fn new() -> Arc<Self> {
        let limiter = Arc::new(Self {
            entries: Mutex::new(HashMap::new()),
        });

        // Periodic cleanup of expired entries
        let limiter_clone = limiter.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(CLEANUP_INTERVAL).await;
                let mut entries = limiter_clone.entries.lock().await;
                entries.retain(|_, e| e.window_start.elapsed() < WINDOW);
            }
        });

        limiter
    }

    /// Returns true if the request should be blocked (rate limited).
    pub async fn is_blocked(&self, ip: IpAddr) -> bool {
        let entries = self.entries.lock().await;
        if let Some(entry) = entries.get(&ip) {
            if entry.window_start.elapsed() < WINDOW && entry.failures >= MAX_FAILURES {
                return true;
            }
        }
        false
    }

    /// Record a failed authentication attempt for the given IP.
    pub async fn record_failure(&self, ip: IpAddr) {
        let mut entries = self.entries.lock().await;
        let entry = entries.entry(ip).or_insert(Entry {
            failures: 0,
            window_start: Instant::now(),
        });

        // Reset window if expired
        if entry.window_start.elapsed() >= WINDOW {
            entry.failures = 0;
            entry.window_start = Instant::now();
        }

        entry.failures += 1;
        tracing::warn!(
            ip = %ip,
            event = "auth_failure",
            attempts = entry.failures,
            max = MAX_FAILURES
        );
    }

    /// Clear failure count on successful auth.
    pub async fn record_success(&self, ip: IpAddr) {
        let mut entries = self.entries.lock().await;
        entries.remove(&ip);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    fn ip(a: u8) -> IpAddr {
        IpAddr::V4(Ipv4Addr::new(127, 0, 0, a))
    }

    #[tokio::test]
    async fn new_ip_is_not_blocked() {
        let limiter = RateLimiter::new();
        assert!(!limiter.is_blocked(ip(1)).await);
    }

    #[tokio::test]
    async fn not_blocked_before_max_failures() {
        let limiter = RateLimiter::new();
        for _ in 0..MAX_FAILURES - 1 {
            limiter.record_failure(ip(2)).await;
        }
        assert!(!limiter.is_blocked(ip(2)).await);
    }

    #[tokio::test]
    async fn blocked_after_max_failures() {
        let limiter = RateLimiter::new();
        for _ in 0..MAX_FAILURES {
            limiter.record_failure(ip(3)).await;
        }
        assert!(limiter.is_blocked(ip(3)).await);
    }

    #[tokio::test]
    async fn success_clears_block() {
        let limiter = RateLimiter::new();
        for _ in 0..MAX_FAILURES {
            limiter.record_failure(ip(4)).await;
        }
        assert!(limiter.is_blocked(ip(4)).await);
        limiter.record_success(ip(4)).await;
        assert!(!limiter.is_blocked(ip(4)).await);
    }

    #[tokio::test]
    async fn success_on_unknown_ip_does_not_panic() {
        let limiter = RateLimiter::new();
        limiter.record_success(ip(5)).await;
        assert!(!limiter.is_blocked(ip(5)).await);
    }
}
