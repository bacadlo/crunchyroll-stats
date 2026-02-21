import { HistoryEntry } from '@/types/watch-history';

export type WatchTimeRange = 'all_time' | 'last_year' | 'last_month' | 'last_week' | 'last_day';

export interface GenreMetric {
  name: string;
  hours: number;
  titles: number;
}

interface GenreAccumulator {
  name: string;
  hours: number;
  titles: Set<string>;
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
  mostBingedSeries: {
    name: string;
    episodes: number;
    hours: number;
    days: number;
  } | null;
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

type AnalyticsMediaType = 'episode' | 'movie' | 'season' | 'series';

interface BingeSessionState {
  name: string;
  episodes: number;
  totalMs: number;
  firstWatch: Date | null;
  lastWatch: Date | null;
}

function normalizeAnalyticsMediaType(entry: HistoryEntry): AnalyticsMediaType | null {
  const mediaType = typeof entry.mediaType === 'string'
    ? entry.mediaType.toLowerCase()
    : '';

  if (mediaType === 'episode' || mediaType === 'movie' || mediaType === 'season' || mediaType === 'series') {
    return mediaType;
  }

  // Treat API movie listing payloads as movies for analytics purposes.
  if (mediaType === 'movie_listing') {
    return 'movie';
  }

  // Backward-compatible fallback when mediaType is missing from older payloads.
  if (!mediaType) {
    return entry.episodeTitle ? 'episode' : 'movie';
  }

  return null;
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
  const genresByKey = new Map<string, GenreAccumulator>();
  const dayWatchMs = new Map<string, number>();
  const watchedDays = new Set<string>();
  const bingeSessions = new Map<string, BingeSessionState>();

  for (const entry of entries) {
    const analyticsMediaType = normalizeAnalyticsMediaType(entry);
    if (!analyticsMediaType) {
      continue;
    }

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

    if (analyticsMediaType === 'episode') {
      const seriesKey = (entry.seriesId ?? entry.title).trim().toLowerCase();
      if (seriesKey) series.add(seriesKey);

      const episodeKey = (entry.contentId ?? `${entry.title}::${entry.episodeTitle ?? ''}`)
        .trim()
        .toLowerCase();
      if (episodeKey) episodes.add(episodeKey);
    }

    if (analyticsMediaType === 'movie') {
      const movieKey = (entry.contentId ?? entry.movieListingId ?? entry.title).trim().toLowerCase();
      if (movieKey) movies.add(movieKey);
    }

    if (analyticsMediaType === 'season' || analyticsMediaType === 'series') {
      const seriesKey = (entry.seriesId ?? entry.contentId ?? entry.title).trim().toLowerCase();
      if (seriesKey) series.add(seriesKey);
    }

    if (analyticsMediaType === 'episode' || analyticsMediaType === 'season' || analyticsMediaType === 'series') {
      if (watchedDate) {
        const rawSeries = (entry.seriesId ?? entry.contentId ?? entry.title ?? '').trim();
        const seriesKey = rawSeries.toLowerCase();
        if (seriesKey) {
          const dateKey = createDayKey(watchedDate);
          const sessionKey = `${dateKey}|${seriesKey}`;
          const existing = bingeSessions.get(sessionKey);
          const displayName = entry.seriesTitle?.trim() || entry.title?.trim() || 'Untitled Series';
          const nextSession: BingeSessionState = existing ?? {
            name: displayName,
            episodes: 0,
            totalMs: 0,
            firstWatch: watchedDate,
            lastWatch: watchedDate,
          };

          nextSession.name = displayName || nextSession.name;
          nextSession.episodes += 1;
          nextSession.totalMs += progressMs;
          if (!nextSession.firstWatch || watchedDate < nextSession.firstWatch) {
            nextSession.firstWatch = watchedDate;
          }
          if (!nextSession.lastWatch || watchedDate > nextSession.lastWatch) {
            nextSession.lastWatch = watchedDate;
          }

          bingeSessions.set(sessionKey, nextSession);
        }
      }
    }

    const uniqueGenres = Array.from(new Set((entry.genres ?? []).map((genre) => genre.trim()).filter(Boolean)));
    const entryTitle =
      analyticsMediaType === 'episode'
        ? (entry.seriesTitle ?? entry.title ?? '').trim()
        : (entry.title ?? '').trim();
    const titleKey = entryTitle ? entryTitle.toLowerCase() : null;

    for (const genre of uniqueGenres) {
      const key = genre.toLowerCase();
      const existing = genresByKey.get(key);
      const titleAccumulator: GenreAccumulator = existing ?? {
        name: genre,
        hours: 0,
        titles: new Set(),
      };
      titleAccumulator.hours += hoursFromMs(progressMs);
      if (titleKey) {
        titleAccumulator.titles.add(titleKey);
      }
      genresByKey.set(key, titleAccumulator);
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
    .map<GenreMetric>((genre) => ({
      name: genre.name,
      hours: genre.hours,
      titles: genre.titles.size,
    }))
    .sort(
      (a, b) =>
        b.hours - a.hours
        || b.titles - a.titles
        || a.name.localeCompare(b.name)
    )
    .slice(0, 3);

  let mostBingedSeries: AnalyticsSummary['mostBingedSeries'] = null;
  for (const session of bingeSessions.values()) {
    if (session.episodes < 3) continue;

    const firstMs = session.firstWatch?.getTime() ?? null;
    const lastMs = session.lastWatch?.getTime() ?? null;
    const days = firstMs !== null && lastMs !== null
      ? Math.max(1, Math.floor((lastMs - firstMs) / DAY_MS) + 1)
      : 1;

    const candidate = {
      name: session.name,
      episodes: session.episodes,
      hours: hoursFromMs(session.totalMs),
      days,
    };

    if (
      !mostBingedSeries
      || candidate.episodes > mostBingedSeries.episodes
      || (candidate.episodes === mostBingedSeries.episodes && candidate.hours > mostBingedSeries.hours)
    ) {
      mostBingedSeries = candidate;
    }
  }

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
    mostBingedSeries,
  };
}
