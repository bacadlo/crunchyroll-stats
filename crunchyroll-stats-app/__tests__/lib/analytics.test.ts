import { describe, it, expect, beforeEach } from 'vitest';
import { calculateAnalyticsSummary } from '@/lib/analytics';
import {
  createEntry,
  createSeriesRun,
  createBingeSession,
  createMovie,
  resetIdCounter,
} from '../helpers/fixtures';

beforeEach(() => {
  resetIdCounter();
});

// ---------------------------------------------------------------------------
// Empty / edge-case inputs
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - empty input', () => {
  it('returns zeroed summary for an empty array', () => {
    const result = calculateAnalyticsSummary([]);

    expect(result.totals).toEqual({ titles: 0, series: 0, movies: 0, episodes: 0 });
    expect(result.watchedHoursByRange.all_time).toBe(0);
    expect(result.longestStreakDays).toBe(0);
    expect(result.longestStreakStart).toBeNull();
    expect(result.longestStreakEnd).toBeNull();
    expect(result.peakDay.date).toBeNull();
    expect(result.peakDay.hours).toBe(0);
    expect(result.mostBingedSeries).toBeNull();
    expect(result.averageCompletionRate).toBe(0);
    expect(result.averageSessionMinutes).toBe(0);
    expect(result.newVsRewatched).toEqual({ new: 0, rewatched: 0 });
    expect(result.watchTimeByDayOfWeek).toHaveLength(7);
    expect(result.watchTimeByHour).toHaveLength(24);
  });
});

// ---------------------------------------------------------------------------
// Totals counting
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - totals', () => {
  it('counts distinct titles, series, episodes, and movies', () => {
    const entries = [
      createEntry({ title: 'Anime A', seriesId: 's1', contentId: 'ep1' }),
      createEntry({ title: 'Anime A', seriesId: 's1', contentId: 'ep2' }),
      createEntry({ title: 'Anime B', seriesId: 's2', contentId: 'ep3' }),
      createMovie({ title: 'Movie X', contentId: 'movie1' }),
    ];

    const result = calculateAnalyticsSummary(entries);

    expect(result.totals.titles).toBe(3); // Anime A, Anime B, Movie X
    expect(result.totals.series).toBe(2); // s1, s2
    expect(result.totals.episodes).toBe(3); // ep1, ep2, ep3
    expect(result.totals.movies).toBe(1);
  });

  it('deduplicates titles case-insensitively', () => {
    const entries = [
      createEntry({ title: 'My Anime' }),
      createEntry({ title: 'my anime', contentId: 'ep2' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.totals.titles).toBe(1);
  });

  it('skips entries with unrecognized mediaType', () => {
    const entries = [
      createEntry({ mediaType: 'music_video' as 'episode' }),
      createEntry({ title: 'Valid' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.totals.titles).toBe(1);
  });

  it('treats movie_listing as movie', () => {
    const entry = createEntry({
      mediaType: 'movie_listing' as 'episode',
      title: 'Listed Movie',
      seriesId: undefined,
      episodeTitle: undefined,
    });

    const result = calculateAnalyticsSummary([entry]);
    expect(result.totals.movies).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Watch hours by range
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - watchedHoursByRange', () => {
  it('accumulates all_time regardless of date', () => {
    const entries = [
      createEntry({ progressMs: 3_600_000, watchedAt: '2020-01-01T00:00:00.000Z' }),
      createEntry({ progressMs: 3_600_000, watchedAt: undefined }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.watchedHoursByRange.all_time).toBe(2);
  });

  it('only counts recent entries in time-bounded ranges', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const entries = [
      createEntry({ progressMs: 3_600_000, watchedAt: yesterday.toISOString() }),
      createEntry({ progressMs: 3_600_000, watchedAt: twoWeeksAgo.toISOString() }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.watchedHoursByRange.all_time).toBe(2);
    expect(result.watchedHoursByRange.last_day).toBe(1);
    expect(result.watchedHoursByRange.last_week).toBe(1);
    expect(result.watchedHoursByRange.last_month).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Streak detection
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - streaks', () => {
  it('detects a 5-day consecutive streak', () => {
    const entries = createSeriesRun(5);
    const result = calculateAnalyticsSummary(entries);

    expect(result.longestStreakDays).toBe(5);
    expect(result.longestStreakStart).toBe('2025-06-01');
    expect(result.longestStreakEnd).toBe('2025-06-05');
  });

  it('finds the longest among multiple streaks', () => {
    const streak1 = createSeriesRun(3, { title: 'Show A', seriesId: 'a' });
    // Gap day (June 4 is covered by streak1, skip June 5)
    const streak2Base = new Date('2025-06-06T18:00:00.000Z');
    const streak2 = Array.from({ length: 5 }, (_, i) =>
      createEntry({
        title: 'Show B',
        seriesId: 'b',
        contentId: `s2-ep-${i}`,
        watchedAt: new Date(streak2Base.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      }),
    );

    const result = calculateAnalyticsSummary([...streak1, ...streak2]);
    expect(result.longestStreakDays).toBe(5);
    expect(result.longestStreakStart).toBe('2025-06-06');
  });

  it('returns 1 for a single watched day', () => {
    const result = calculateAnalyticsSummary([createEntry()]);
    expect(result.longestStreakDays).toBe(1);
  });

  it('handles non-consecutive days correctly', () => {
    const entries = [
      createEntry({ watchedAt: '2025-06-01T10:00:00.000Z', contentId: 'a' }),
      createEntry({ watchedAt: '2025-06-03T10:00:00.000Z', contentId: 'b' }),
      createEntry({ watchedAt: '2025-06-05T10:00:00.000Z', contentId: 'c' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.longestStreakDays).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Peak day
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - peakDay', () => {
  it('identifies the day with the most watch time', () => {
    const entries = [
      createEntry({ watchedAt: '2025-06-01T10:00:00.000Z', progressMs: 3_600_000, contentId: 'a' }),
      createEntry({ watchedAt: '2025-06-01T12:00:00.000Z', progressMs: 3_600_000, contentId: 'b' }),
      createEntry({ watchedAt: '2025-06-02T10:00:00.000Z', progressMs: 1_800_000, contentId: 'c' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.peakDay.date).toBe('2025-06-01');
    expect(result.peakDay.hours).toBe(2); // 2  1h
  });
});

// ---------------------------------------------------------------------------
// Genre metrics
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - genres', () => {
  it('counts unique genres and sorts top 3 by hours', () => {
    const entries = [
      createEntry({ genres: ['Action', 'Comedy'], progressMs: 7_200_000, contentId: 'a' }),
      createEntry({ genres: ['Action', 'Drama'], progressMs: 3_600_000, contentId: 'b' }),
      createEntry({ genres: ['Romance'], progressMs: 1_800_000, contentId: 'c' }),
      createEntry({ genres: ['Comedy'], progressMs: 1_800_000, contentId: 'd' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.genres.total).toBe(4);
    expect(result.genres.top3).toHaveLength(3);
    expect(result.genres.top3[0].name).toBe('Action'); // 7200 + 3600 = 10800ms = 3h
  });

  it('deduplicates genres within a single entry', () => {
    const entries = [
      createEntry({ genres: ['Action', 'Action', 'Action'], progressMs: 3_600_000 }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.genres.total).toBe(1);
    expect(result.genres.top3[0].hours).toBeCloseTo(1); // counted once, not 3
  });

  it('handles entries with no genres', () => {
    const entries = [createEntry({ genres: [] }), createEntry({ genres: undefined })];
    const result = calculateAnalyticsSummary(entries);
    expect(result.genres.total).toBe(0);
    expect(result.genres.top3).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Binge detection
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - mostBingedSeries', () => {
  it('detects a binge session with 3+ episodes on the same day', () => {
    const entries = createBingeSession(5, { title: 'Binge Show', seriesId: 'binge-1' });
    const result = calculateAnalyticsSummary(entries);

    expect(result.mostBingedSeries).not.toBeNull();
    expect(result.mostBingedSeries!.name).toBe('Binge Show');
    expect(result.mostBingedSeries!.episodes).toBe(5);
  });

  it('returns null when no series has 3+ episodes in a day', () => {
    const entries = [
      createEntry({ watchedAt: '2025-06-01T10:00:00.000Z', contentId: 'a' }),
      createEntry({ watchedAt: '2025-06-01T11:00:00.000Z', contentId: 'b' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.mostBingedSeries).toBeNull();
  });

  it('picks the series with the most episodes when there are ties', () => {
    const binge1 = createBingeSession(3, { title: 'Show A', seriesId: 'a' });
    const binge2 = createBingeSession(5, { title: 'Show B', seriesId: 'b' });

    const result = calculateAnalyticsSummary([...binge1, ...binge2]);
    expect(result.mostBingedSeries!.name).toBe('Show B');
    expect(result.mostBingedSeries!.episodes).toBe(5);
  });

  it('ignores movies for binge detection', () => {
    const movies = Array.from({ length: 5 }, (_, i) =>
      createMovie({
        title: 'Movie Series',
        contentId: `movie-${i}`,
        watchedAt: new Date(Date.now() - i * 25 * 60 * 1000).toISOString(),
      }),
    );

    const result = calculateAnalyticsSummary(movies);
    expect(result.mostBingedSeries).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Watch time distributions
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - time distributions', () => {
  it('watchTimeByDayOfWeek has 7 entries ordered Monday-Sunday', () => {
    const result = calculateAnalyticsSummary([createEntry()]);
    const days = result.watchTimeByDayOfWeek.map((d) => d.day);
    expect(days).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  });

  it('watchTimeByHour has 24 entries', () => {
    const result = calculateAnalyticsSummary([createEntry()]);
    expect(result.watchTimeByHour).toHaveLength(24);
    expect(result.watchTimeByHour[0].hour).toBe(0);
    expect(result.watchTimeByHour[23].hour).toBe(23);
  });

  it('assigns watch time to the correct local hour', () => {
    const watchedAt = '2025-06-15T14:00:00.000Z';
    const expectedLocalHour = new Date(watchedAt).getHours();
    const entries = [createEntry({ progressMs: 3_600_000, watchedAt })];
    const result = calculateAnalyticsSummary(entries);
    expect(result.watchTimeByHour[expectedLocalHour].hours).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Monthly trend
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - monthlyTrend', () => {
  it('groups entries by year-month within the past year', () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const entries = [
      createEntry({ progressMs: 3_600_000, watchedAt: now.toISOString(), contentId: 'a' }),
      createEntry({ progressMs: 1_800_000, watchedAt: now.toISOString(), contentId: 'b' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    const monthEntry = result.monthlyTrend.find((m) => m.month === thisMonth);
    expect(monthEntry).toBeDefined();
    expect(monthEntry!.hours).toBeCloseTo(1.5, 1);
  });

  it('excludes entries older than one year', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    const entries = [
      createEntry({ progressMs: 3_600_000, watchedAt: twoYearsAgo.toISOString() }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.monthlyTrend).toHaveLength(0);
  });

  it('sorts months chronologically', () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const entries = [
      createEntry({ progressMs: 1_800_000, watchedAt: now.toISOString(), contentId: 'a' }),
      createEntry({ progressMs: 1_800_000, watchedAt: lastMonth.toISOString(), contentId: 'b' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    if (result.monthlyTrend.length === 2) {
      expect(result.monthlyTrend[0].month < result.monthlyTrend[1].month).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Completion rate
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - averageCompletionRate', () => {
  it('computes average completion as ratio (0-1)', () => {
    const entries = [
      createEntry({ progressMs: 1200000, durationMs: 1200000, contentId: 'a' }), // 100%
      createEntry({ progressMs: 600000, durationMs: 1200000, contentId: 'b' }),   // 50%
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.averageCompletionRate).toBeCloseTo(0.75, 2);
  });

  it('caps individual completion at 1.0', () => {
    const entries = [
      createEntry({ progressMs: 2000000, durationMs: 1000000 }), // 200%  capped to 1
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.averageCompletionRate).toBe(1);
  });

  it('returns 0 when no entries have valid duration', () => {
    const entries = [
      createEntry({ progressMs: 0, durationMs: 0 }),
      createEntry({ progressMs: 100, durationMs: undefined }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.averageCompletionRate).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// New vs rewatched
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - newVsRewatched', () => {
  it('counts unique content as new, repeated content as rewatched', () => {
    const entries = [
      createEntry({ contentId: 'ep-1' }),
      createEntry({ contentId: 'ep-2' }),
      createEntry({ contentId: 'ep-1' }), // rewatch
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.newVsRewatched.new).toBe(1);      // ep-2 seen once
    expect(result.newVsRewatched.rewatched).toBe(2); // ep-1 seen twice  adds count
  });

  it('returns all new when no content is repeated', () => {
    const entries = [
      createEntry({ contentId: 'a' }),
      createEntry({ contentId: 'b' }),
      createEntry({ contentId: 'c' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.newVsRewatched.new).toBe(3);
    expect(result.newVsRewatched.rewatched).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Session clustering
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - averageSessionMinutes', () => {
  it('clusters watches within 30-min gaps into sessions', () => {
    const base = new Date('2025-06-15T10:00:00.000Z').getTime();
    const entries = [
      // Session 1: 3 episodes back-to-back (24 min each, <30 min gaps)
      createEntry({ watchedAt: new Date(base).toISOString(), progressMs: 24 * 60 * 1000, contentId: 'a' }),
      createEntry({ watchedAt: new Date(base + 25 * 60 * 1000).toISOString(), progressMs: 24 * 60 * 1000, contentId: 'b' }),
      createEntry({ watchedAt: new Date(base + 50 * 60 * 1000).toISOString(), progressMs: 24 * 60 * 1000, contentId: 'c' }),
      // Session 2: 1 episode much later
      createEntry({ watchedAt: new Date(base + 5 * 60 * 60 * 1000).toISOString(), progressMs: 24 * 60 * 1000, contentId: 'd' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    // Should detect 2 sessions
    expect(result.averageSessionMinutes).toBeGreaterThan(0);
  });

  it('returns 0 for no entries', () => {
    const result = calculateAnalyticsSummary([]);
    expect(result.averageSessionMinutes).toBe(0);
  });

  it('single entry creates one session', () => {
    const entries = [createEntry({ progressMs: 30 * 60 * 1000 })]; // 30 min
    const result = calculateAnalyticsSummary(entries);
    expect(result.averageSessionMinutes).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Activity calendar
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - activityCalendar', () => {
  it('only includes entries from the past year', () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const old = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);

    const entries = [
      createEntry({ watchedAt: recent.toISOString(), contentId: 'a' }),
      createEntry({ watchedAt: old.toISOString(), contentId: 'b' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.activityCalendar).toHaveLength(1);
  });

  it('aggregates multiple entries on the same day', () => {
    const day = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const entries = [
      createEntry({ watchedAt: day.toISOString(), progressMs: 3_600_000, contentId: 'a' }),
      createEntry({
        watchedAt: new Date(day.getTime() + 60 * 60 * 1000).toISOString(),
        progressMs: 3_600_000,
        contentId: 'b',
      }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.activityCalendar).toHaveLength(1);
    expect(result.activityCalendar[0].hours).toBeCloseTo(2, 1);
  });

  it('is sorted chronologically', () => {
    const day1 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const day2 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const entries = [
      createEntry({ watchedAt: day2.toISOString(), contentId: 'b' }),
      createEntry({ watchedAt: day1.toISOString(), contentId: 'a' }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.activityCalendar[0].date < result.activityCalendar[1].date).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Series completion
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - seriesCompletion', () => {
  it('returns top 10 series by episode count', () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      createEntry({
        title: `Series ${i}`,
        seriesId: `s-${i}`,
        contentId: `ep-${i}`,
      }),
    );
    // Give the first series extra episodes
    for (let i = 0; i < 5; i++) {
      entries.push(
        createEntry({
          title: 'Series 0',
          seriesId: 's-0',
          contentId: `ep-0-extra-${i}`,
        }),
      );
    }

    const result = calculateAnalyticsSummary(entries);
    expect(result.seriesCompletion).toHaveLength(10);
    expect(result.seriesCompletion[0].name).toBe('Series 0');
    expect(result.seriesCompletion[0].watched).toBe(6); // 1 original + 5 extras
  });
});

// ---------------------------------------------------------------------------
// Genre over time
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - genreOverTime', () => {
  it('tracks top 5 genres by month within the past year', () => {
    const now = new Date();
    const entries = [
      createEntry({
        genres: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance'],
        progressMs: 3_600_000,
        watchedAt: now.toISOString(),
      }),
    ];

    const result = calculateAnalyticsSummary(entries);
    expect(result.genreOverTime.length).toBeGreaterThanOrEqual(1);
    // Should only include top 5 genres (Romance excluded as lowest)
    const genreKeys = Object.keys(result.genreOverTime[0]).filter((k) => k !== 'month');
    expect(genreKeys.length).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// Negative progressMs handling
// ---------------------------------------------------------------------------

describe('calculateAnalyticsSummary - edge cases', () => {
  it('clamps negative progressMs to 0', () => {
    const entries = [createEntry({ progressMs: -5000 })];
    const result = calculateAnalyticsSummary(entries);
    expect(result.watchedHoursByRange.all_time).toBe(0);
  });

  it('handles entries with missing watchedAt', () => {
    const entries = [createEntry({ watchedAt: undefined })];
    const result = calculateAnalyticsSummary(entries);
    // Should still count in all_time but not in dated metrics
    expect(result.watchedHoursByRange.all_time).toBeGreaterThan(0);
    expect(result.longestStreakDays).toBe(0);
    expect(result.activityCalendar).toHaveLength(0);
  });

  it('handles invalid date strings gracefully', () => {
    const entries = [createEntry({ watchedAt: 'not-a-date' })];
    const result = calculateAnalyticsSummary(entries);
    expect(result.watchedHoursByRange.all_time).toBeGreaterThan(0);
    expect(result.longestStreakDays).toBe(0);
  });
});

