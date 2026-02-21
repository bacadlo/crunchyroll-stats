import { HistoryEntry } from '@/types/watch-history';

export type WatchTimeRange = 'all_time' | 'last_year' | 'last_month' | 'last_week' | 'last_day';

export interface GenreMetric {
  name: string;
  hours: number;
  count: number;
}

export interface AnalyticsSummary {
  watchedHoursByRange: Record<WatchTimeRange, number>;
  totals: {
    titles: number;
    series: number;
    movies: number;
    episodes: number;
  };
  genres: {
    total: number;
    top3: GenreMetric[];
  };
  longestStreakDays: number;
  peakDay: {
    date: string | null;
    hours: number;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_DAYS: Record<WatchTimeRange, number | null> = {
  all_time: null,
  last_year: 365,
  last_month: 30,
  last_week: 7,
  last_day: 1,
};

function parseDate(dateString?: string): Date | null {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hoursFromMs(ms: number): number {
  return ms / (1000 * 60 * 60);
}

function getEntryProgressMs(entry: HistoryEntry): number {
  return Math.max(0, entry.progressMs ?? 0);
}

function createDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function calculateAnalyticsSummary(entries: HistoryEntry[]): AnalyticsSummary {
  const now = Date.now();
  const watchedHoursByRange: Record<WatchTimeRange, number> = {
    all_time: 0,
    last_year: 0,
    last_month: 0,
    last_week: 0,
    last_day: 0,
  };

  const titles = new Set<string>();
  const series = new Set<string>();
  const movies = new Set<string>();
  const episodes = new Set<string>();
  const genresByKey = new Map<string, GenreMetric>();
  const dayWatchMs = new Map<string, number>();
  const watchedDays = new Set<string>();

  for (const entry of entries) {
    const progressMs = getEntryProgressMs(entry);
    const watchedDate = parseDate(entry.watchedAt);
    const watchedMs = watchedDate?.getTime() ?? null;

    for (const [range, rangeDays] of Object.entries(RANGE_DAYS) as Array<[WatchTimeRange, number | null]>) {
      if (rangeDays === null) {
        watchedHoursByRange[range] += hoursFromMs(progressMs);
        continue;
      }

      if (watchedMs === null) continue;
      if (watchedMs >= now - (rangeDays * DAY_MS)) {
        watchedHoursByRange[range] += hoursFromMs(progressMs);
      }
    }

    const normalizedTitle = entry.title.trim().toLowerCase();
    if (normalizedTitle) {
      titles.add(normalizedTitle);
    }

    const inferredMediaType: 'episode' | 'movie' | 'unknown' = entry.mediaType
      ?? (entry.episodeTitle ? 'episode' : 'movie');

    if (inferredMediaType === 'episode') {
      const seriesKey = (entry.seriesId ?? entry.title).trim().toLowerCase();
      if (seriesKey) series.add(seriesKey);

      const episodeKey = (entry.contentId ?? `${entry.title}::${entry.episodeTitle ?? ''}`)
        .trim()
        .toLowerCase();
      if (episodeKey) episodes.add(episodeKey);
    }

    if (inferredMediaType === 'movie') {
      const movieKey = (entry.contentId ?? entry.movieListingId ?? entry.title).trim().toLowerCase();
      if (movieKey) movies.add(movieKey);
    }

    const uniqueGenres = Array.from(new Set((entry.genres ?? []).map((genre) => genre.trim()).filter(Boolean)));
    for (const genre of uniqueGenres) {
      const key = genre.toLowerCase();
      const existing = genresByKey.get(key);
      if (existing) {
        existing.hours += hoursFromMs(progressMs);
        existing.count += 1;
      } else {
        genresByKey.set(key, {
          name: genre,
          hours: hoursFromMs(progressMs),
          count: 1,
        });
      }
    }

    if (watchedDate) {
      const dayKey = createDayKey(watchedDate);
      watchedDays.add(dayKey);
      dayWatchMs.set(dayKey, (dayWatchMs.get(dayKey) ?? 0) + progressMs);
    }
  }

  const sortedDays = Array.from(watchedDays).sort();
  let longestStreakDays = 0;
  let currentStreak = 0;
  let previousDayMs: number | null = null;

  for (const day of sortedDays) {
    const dayMs = new Date(`${day}T00:00:00.000Z`).getTime();
    if (previousDayMs === null || dayMs - previousDayMs !== DAY_MS) {
      currentStreak = 1;
    } else {
      currentStreak += 1;
    }
    longestStreakDays = Math.max(longestStreakDays, currentStreak);
    previousDayMs = dayMs;
  }

  let peakDayDate: string | null = null;
  let peakDayMs = 0;
  for (const [day, ms] of dayWatchMs.entries()) {
    if (
      ms > peakDayMs
      || (ms === peakDayMs && peakDayDate !== null && day > peakDayDate)
      || peakDayDate === null
    ) {
      peakDayDate = day;
      peakDayMs = ms;
    }
  }

  const top3Genres = Array.from(genresByKey.values())
    .sort((a, b) => b.hours - a.hours || b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 3);

  return {
    watchedHoursByRange,
    totals: {
      titles: titles.size,
      series: series.size,
      movies: movies.size,
      episodes: episodes.size,
    },
    genres: {
      total: genresByKey.size,
      top3: top3Genres,
    },
    longestStreakDays,
    peakDay: {
      date: peakDayDate,
      hours: hoursFromMs(peakDayMs),
    },
  };
}
