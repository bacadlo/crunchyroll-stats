interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 60 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function deleteCache(key: string): void {
  cache.delete(key);
}

const REFRESH_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const refreshTimestamps = new Map<string, number>();

export function canRefresh(key: string): boolean {
  const last = refreshTimestamps.get(key);
  if (!last) return true;
  return Date.now() - last >= REFRESH_COOLDOWN_MS;
}

export function recordRefresh(key: string): void {
  refreshTimestamps.set(key, Date.now());
}
