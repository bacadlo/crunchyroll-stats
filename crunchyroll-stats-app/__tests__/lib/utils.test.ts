import { describe, it, expect, beforeEach } from 'vitest';
import { cn, calculateStats } from '@/lib/utils';
import {
  getCompletionPercent,
  formatDate,
  formatDuration,
  formatTotalWatchTime,
  exportToCSV,
  exportToJSON,
} from '@/lib/analytics';
import { createEntry, createMovie, resetIdCounter } from '../helpers/fixtures';

beforeEach(() => {
  resetIdCounter();
});

// ---------------------------------------------------------------------------
// cn (className utility)
// ---------------------------------------------------------------------------

describe('cn', () => {
  it('joins string arguments', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', null, undefined, false, '', 'bar')).toBe('foo bar');
  });

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('handles nested arrays', () => {
    expect(cn('a', ['b', ['c']])).toBe('a b c');
  });

  it('handles numbers', () => {
    expect(cn('a', 0, 1)).toBe('a 1');
  });

  it('returns empty string for no input', () => {
    expect(cn()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getCompletionPercent
// ---------------------------------------------------------------------------

describe('getCompletionPercent', () => {
  it('returns 0 when progressMs is missing', () => {
    expect(getCompletionPercent(createEntry({ progressMs: undefined }))).toBe(0);
  });

  it('returns 0 when durationMs is 0', () => {
    expect(getCompletionPercent(createEntry({ progressMs: 100, durationMs: 0 }))).toBe(0);
  });

  it('returns correct percentage', () => {
    expect(getCompletionPercent(createEntry({ progressMs: 600000, durationMs: 1200000 }))).toBe(50);
  });

  it('caps at 100%', () => {
    expect(getCompletionPercent(createEntry({ progressMs: 2000000, durationMs: 1000000 }))).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(getCompletionPercent(createEntry({ progressMs: 333, durationMs: 1000 }))).toBe(33);
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats an ISO date string to en-US locale', () => {
    const result = formatDate('2025-06-15T14:00:00.000Z');
    // Output varies by runtime locale settings, but should contain month/day/year
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });
});

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(5 * 60 * 1000)).toBe('5m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90 * 60 * 1000)).toBe('1h 30m');
  });

  it('formats exact hours', () => {
    expect(formatDuration(2 * 60 * 60 * 1000)).toBe('2h 0m');
  });

  it('returns 0m for 0ms', () => {
    expect(formatDuration(0)).toBe('0m');
  });
});

// ---------------------------------------------------------------------------
// formatTotalWatchTime
// ---------------------------------------------------------------------------

describe('formatTotalWatchTime', () => {
  it('formats minutes only when < 1 hour', () => {
    expect(formatTotalWatchTime(45)).toBe('45m');
  });

  it('formats hours and minutes when < 1 day', () => {
    expect(formatTotalWatchTime(150)).toBe('2h 30m');
  });

  it('formats days and hours', () => {
    expect(formatTotalWatchTime(26 * 60)).toBe('1d 2h');
  });
});

// ---------------------------------------------------------------------------
// calculateStats
// ---------------------------------------------------------------------------

describe('calculateStats', () => {
  it('returns correct totals', () => {
    const entries = [
      createEntry({ progressMs: 1_200_000, title: 'Anime A' }),
      createEntry({ progressMs: 600_000, title: 'Anime A' }),
      createEntry({ progressMs: 1_800_000, title: 'Anime B' }),
    ];

    const stats = calculateStats(entries);
    expect(stats.totalEpisodes).toBe(3);
    expect(stats.totalWatchTime).toBe(60); // (1200000+600000+1800000) / 60000 = 60
  });

  it('returns top 5 anime sorted by count', () => {
    const entries = [
      ...Array.from({ length: 10 }, (_, i) => createEntry({ title: 'Popular', contentId: `p${i}` })),
      ...Array.from({ length: 5 }, (_, i) => createEntry({ title: 'Second', contentId: `s${i}` })),
      ...Array.from({ length: 4 }, (_, i) => createEntry({ title: 'Third', contentId: `t${i}` })),
      ...Array.from({ length: 3 }, (_, i) => createEntry({ title: 'Fourth', contentId: `f${i}` })),
      ...Array.from({ length: 2 }, (_, i) => createEntry({ title: 'Fifth', contentId: `v${i}` })),
      createEntry({ title: 'Sixth', contentId: 'x1' }),
    ];

    const stats = calculateStats(entries);
    expect(stats.topAnime).toHaveLength(5);
    expect(stats.topAnime[0].title).toBe('Popular');
    expect(stats.topAnime[0].count).toBe(10);
  });

  it('returns recently watched sorted by date descending', () => {
    const entries = [
      createEntry({ watchedAt: '2025-01-01T00:00:00.000Z', title: 'Old', contentId: 'a' }),
      createEntry({ watchedAt: '2025-06-15T00:00:00.000Z', title: 'New', contentId: 'b' }),
      createEntry({ watchedAt: '2025-03-01T00:00:00.000Z', title: 'Mid', contentId: 'c' }),
    ];

    const stats = calculateStats(entries);
    expect(stats.recentlyWatched[0].title).toBe('New');
    expect(stats.recentlyWatched[2].title).toBe('Old');
  });

  it('handles empty input', () => {
    const stats = calculateStats([]);
    expect(stats.totalEpisodes).toBe(0);
    expect(stats.totalWatchTime).toBe(0);
    expect(stats.topAnime).toHaveLength(0);
    expect(stats.averageCompletion).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// exportToCSV
// ---------------------------------------------------------------------------

describe('exportToCSV', () => {
  it('produces header row and data rows', () => {
    const entries = [
      createEntry({ title: 'My Show', episodeTitle: 'Ep 1', watchedAt: '2025-06-15T00:00:00.000Z' }),
    ];

    const csv = exportToCSV(entries);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Title,Episode,Date Watched,Completion %,Duration');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('My Show');
  });

  it('sanitizes CSV injection characters', () => {
    const entries = [
      createEntry({ title: '=HYPERLINK("evil")', episodeTitle: '+cmd' }),
    ];

    const csv = exportToCSV(entries);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+cmd");
  });

  it('escapes double quotes in values', () => {
    const entries = [createEntry({ title: 'Show "Quoted"' })];
    const csv = exportToCSV(entries);
    expect(csv).toContain('Show ""Quoted""');
  });

  it('handles empty episode title', () => {
    const entries = [createMovie({ episodeTitle: undefined })];
    const csv = exportToCSV(entries);
    expect(csv).toContain('""'); // empty episode field
  });
});

// ---------------------------------------------------------------------------
// exportToJSON
// ---------------------------------------------------------------------------

describe('exportToJSON', () => {
  it('produces valid JSON', () => {
    const entries = [createEntry()];
    const json = exportToJSON(entries);
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].title).toBe('My Anime');
  });

  it('is pretty-printed with 2 spaces', () => {
    const entries = [createEntry()];
    const json = exportToJSON(entries);
    expect(json).toContain('\n  ');
  });
});
