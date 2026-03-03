import { HistoryEntry } from '@/types/watch-history';

let idCounter = 0;

/**
 * Factory for creating HistoryEntry objects with sensible defaults.
 * Override any field by passing partial data.
 */
export function createEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  idCounter += 1;
  return {
    id: `test-${idCounter}`,
    mediaType: 'episode',
    contentId: `content-${idCounter}`,
    seriesId: 'series-1',
    title: 'My Anime',
    episodeTitle: `Episode ${idCounter}`,
    watchedAt: '2025-06-15T14:00:00.000Z',
    progressMs: 24 * 60 * 1000, // 24 minutes
    durationMs: 24 * 60 * 1000,
    thumbnail: 'https://example.com/thumb.jpg',
    genres: ['Action', 'Adventure'],
    ...overrides,
  };
}

/** Create N entries for the same series, spread across consecutive days. */
export function createSeriesRun(
  count: number,
  overrides: Partial<HistoryEntry> = {},
): HistoryEntry[] {
  const baseDate = new Date('2025-06-01T18:00:00.000Z');
  return Array.from({ length: count }, (_, i) => {
    const watchDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    return createEntry({
      contentId: `ep-${i}`,
      episodeTitle: `Episode ${i + 1}`,
      watchedAt: watchDate.toISOString(),
      ...overrides,
    });
  });
}

/** Create entries that form a binge session (same day, same series, 3+ episodes). */
export function createBingeSession(
  episodeCount: number,
  overrides: Partial<HistoryEntry> = {},
): HistoryEntry[] {
  const baseDate = new Date('2025-06-15T10:00:00.000Z');
  return Array.from({ length: episodeCount }, (_, i) => {
    const watchDate = new Date(baseDate.getTime() + i * 25 * 60 * 1000); // 25 min apart
    return createEntry({
      contentId: `binge-ep-${i}`,
      episodeTitle: `Episode ${i + 1}`,
      watchedAt: watchDate.toISOString(),
      ...overrides,
    });
  });
}

/** Create a movie entry. */
export function createMovie(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return createEntry({
    mediaType: 'movie',
    title: 'Anime Movie',
    episodeTitle: undefined,
    seriesId: undefined,
    progressMs: 120 * 60 * 1000, // 2 hours
    durationMs: 120 * 60 * 1000,
    genres: ['Drama', 'Fantasy'],
    ...overrides,
  });
}

/** Reset the ID counter between test suites if needed. */
export function resetIdCounter(): void {
  idCounter = 0;
}
