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
  longestStreakStart: string | null;
  longestStreakEnd: string | null;
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
  watchTimeByDayOfWeek: { day: string; hours: number }[];
  watchTimeByHour: { hour: number; hours: number }[];
  monthlyTrend: { month: string; hours: number }[];
  averageCompletionRate: number;
  seriesCompletion: { name: string; watched: number; total: number }[];
  newVsRewatched: { new: number; rewatched: number };
  averageSessionMinutes: number;
  activityCalendar: { date: string; hours: number }[];
  genreOverTime: { month: string; [genre: string]: number | string }[];
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

const RANGE_ENTRIES = Object.entries(RANGE_DAYS) as Array<[WatchTimeRange, number | null]>;

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

    for (const [range, rangeDays] of RANGE_ENTRIES) {
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
      const movieKey = (entry.contentId ?? entry.title).trim().toLowerCase();
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
          const displayName = entry.title?.trim() || 'Untitled Series';
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

    const rawGenres = entry.genres ?? [];
    const uniqueGenres: string[] = [];
    const seenGenres = new Set<string>();
    for (const g of rawGenres) {
      const trimmed = g.trim();
      if (trimmed && !seenGenres.has(trimmed)) {
        seenGenres.add(trimmed);
        uniqueGenres.push(trimmed);
      }
    }
    const entryTitle =
      analyticsMediaType === 'episode'
        ? (entry.title ?? '').trim()
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
  let longestStreakStart: string | null = null;
  let longestStreakEnd: string | null = null;
  let currentStreak = 0;
  let currentStreakStart: string | null = null;
  let previousDayMs: number | null = null;

  for (const day of sortedDays) {
    const dayMs = new Date(`${day}T00:00:00.000Z`).getTime();
    if (previousDayMs === null || dayMs - previousDayMs !== DAY_MS) {
      currentStreak = 1;
      currentStreakStart = day;
    } else {
      currentStreak += 1;
    }
    if (currentStreak > longestStreakDays) {
      longestStreakDays = currentStreak;
      longestStreakStart = currentStreakStart;
      longestStreakEnd = day;
    }
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

  // --- New analytics computations ---

  // Watch time by day of week
  const dayOfWeekMs = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Watch time by hour of day
  const hourMs = new Array<number>(24).fill(0);
  // Monthly trend
  const monthlyMs = new Map<string, number>();
  // Completion rate
  let completionSum = 0;
  let completionCount = 0;
  // Series episode counts
  const seriesEpisodeCounts = new Map<string, { name: string; count: number }>();
  // New vs rewatched
  const contentIdSeen = new Map<string, number>();
  // Genre over time
  const genreMonthMs = new Map<string, Map<string, number>>();
  // Collect timestamps for session calculation
  const watchTimestamps: { time: number; progressMs: number }[] = [];

  const oneYearAgo = now - 365 * DAY_MS;

  for (const entry of entries) {
    const analyticsMediaType = normalizeAnalyticsMediaType(entry);
    if (!analyticsMediaType) continue;

    const progressMs = getEntryProgressMs(entry);
    const watchedDate = parseDate(entry.watchedAt);
    if (!watchedDate) continue;
    const watchedMs = watchedDate.getTime();

    // Day of week
    dayOfWeekMs[watchedDate.getUTCDay()] += progressMs;

    // Hour of day
    hourMs[watchedDate.getUTCHours()] += progressMs;

    // Monthly trend (past year)
    if (watchedMs >= oneYearAgo) {
      const monthKey = `${watchedDate.getUTCFullYear()}-${String(watchedDate.getUTCMonth() + 1).padStart(2, '0')}`;
      monthlyMs.set(monthKey, (monthlyMs.get(monthKey) ?? 0) + progressMs);
    }

    // Completion rate
    if (entry.progressMs && entry.durationMs && entry.durationMs > 0) {
      completionSum += Math.min(1, entry.progressMs / entry.durationMs);
      completionCount += 1;
    }

    // Series episode counts
    if (analyticsMediaType === 'episode') {
      const seriesKey = (entry.seriesId ?? entry.title).trim().toLowerCase();
      const displayName = entry.title?.trim() || 'Untitled';
      const existing = seriesEpisodeCounts.get(seriesKey);
      if (existing) {
        existing.count += 1;
      } else {
        seriesEpisodeCounts.set(seriesKey, { name: displayName, count: 1 });
      }
    }

    // New vs rewatched
    const cid = entry.contentId ?? `${entry.title}::${entry.episodeTitle ?? ''}`;
    contentIdSeen.set(cid, (contentIdSeen.get(cid) ?? 0) + 1);

    // Genre over time (past year)
    if (watchedMs >= oneYearAgo) {
      const monthKey = `${watchedDate.getUTCFullYear()}-${String(watchedDate.getUTCMonth() + 1).padStart(2, '0')}`;
      const rawGenres = entry.genres ?? [];
      for (const g of rawGenres) {
        const trimmed = g.trim();
        if (!trimmed) continue;
        if (!genreMonthMs.has(trimmed)) genreMonthMs.set(trimmed, new Map());
        const gMap = genreMonthMs.get(trimmed)!;
        gMap.set(monthKey, (gMap.get(monthKey) ?? 0) + progressMs);
      }
    }

    // Session timestamps
    watchTimestamps.push({ time: watchedMs, progressMs });
  }

  // Build watchTimeByDayOfWeek (reorder Mon-Sun)
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const watchTimeByDayOfWeek = dayOrder.map((i) => ({
    day: dayNames[i],
    hours: parseFloat(hoursFromMs(dayOfWeekMs[i]).toFixed(2)),
  }));

  // Build watchTimeByHour
  const watchTimeByHour = hourMs.map((ms, i) => ({
    hour: i,
    hours: parseFloat(hoursFromMs(ms).toFixed(2)),
  }));

  // Build monthlyTrend sorted chronologically
  const monthlyTrend = Array.from(monthlyMs.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ms]) => ({ month, hours: parseFloat(hoursFromMs(ms).toFixed(2)) }));

  // Average completion rate
  const averageCompletionRate = completionCount > 0 ? completionSum / completionCount : 0;

  // Series completion (top 10)
  const seriesCompletion = Array.from(seriesEpisodeCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((s) => ({ name: s.name, watched: s.count, total: s.count }));

  // New vs rewatched
  let newCount = 0;
  let rewatchedCount = 0;
  for (const count of contentIdSeen.values()) {
    if (count === 1) newCount += 1;
    else rewatchedCount += count;
  }
  const newVsRewatched = { new: newCount, rewatched: rewatchedCount };

  // Average session duration (cluster consecutive watches <30 min gap)
  watchTimestamps.sort((a, b) => a.time - b.time);
  const SESSION_GAP_MS = 30 * 60 * 1000;
  let sessionCount = 0;
  let totalSessionMs = 0;
  let sessionStartMs = 0;
  let sessionEndMs = 0;
  for (let i = 0; i < watchTimestamps.length; i++) {
    const ts = watchTimestamps[i];
    if (i === 0 || ts.time - sessionEndMs > SESSION_GAP_MS) {
      if (i > 0) {
        totalSessionMs += sessionEndMs - sessionStartMs;
        sessionCount += 1;
      }
      sessionStartMs = ts.time;
      sessionEndMs = ts.time + ts.progressMs;
    } else {
      sessionEndMs = Math.max(sessionEndMs, ts.time + ts.progressMs);
    }
  }
  if (watchTimestamps.length > 0) {
    totalSessionMs += sessionEndMs - sessionStartMs;
    sessionCount += 1;
  }
  const averageSessionMinutes = sessionCount > 0
    ? totalSessionMs / sessionCount / (1000 * 60)
    : 0;

  // Activity calendar (past year, sparse)
  const activityCalendar: { date: string; hours: number }[] = [];
  for (const [day, ms] of dayWatchMs.entries()) {
    const dayDate = new Date(`${day}T00:00:00.000Z`).getTime();
    if (dayDate >= oneYearAgo) {
      activityCalendar.push({ date: day, hours: parseFloat(hoursFromMs(ms).toFixed(2)) });
    }
  }
  activityCalendar.sort((a, b) => a.date.localeCompare(b.date));

  // Genre over time (top 5 genres by total hours, hours per month)
  const genreTotals = Array.from(genreMonthMs.entries())
    .map(([genre, monthMap]) => {
      let total = 0;
      for (const ms of monthMap.values()) total += ms;
      return { genre, total, monthMap };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const allMonths = Array.from(new Set(
    genreTotals.flatMap((g) => Array.from(g.monthMap.keys()))
  )).sort();

  const genreOverTime = allMonths.map((month) => {
    const row: { month: string; [genre: string]: number | string } = { month };
    for (const g of genreTotals) {
      row[g.genre] = parseFloat(hoursFromMs(g.monthMap.get(month) ?? 0).toFixed(2));
    }
    return row;
  });

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
    longestStreakStart,
    longestStreakEnd,
    peakDay: {
      date: peakDayDate,
      hours: hoursFromMs(peakDayMs),
    },
    mostBingedSeries,
    watchTimeByDayOfWeek,
    watchTimeByHour,
    monthlyTrend,
    averageCompletionRate,
    seriesCompletion,
    newVsRewatched,
    averageSessionMinutes,
    activityCalendar,
    genreOverTime,
  };
}
