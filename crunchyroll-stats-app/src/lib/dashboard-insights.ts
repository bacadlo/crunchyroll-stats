import { HistoryEntry } from '@/types/watch-history';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export type TrendDirection = 'up' | 'down' | 'flat';

export interface DashboardInsightSummary {
  currentWeekHours: number;
  activeDays: number;
  topGenre: string | null;
  topTitle: string | null;
  trendDirection: TrendDirection;
  trendText: string;
  headline: string;
  detail: string;
}

function parseWatchedAt(dateString?: string): number | null {
  if (!dateString) return null;
  const parsed = new Date(dateString).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function formatHours(hours: number): string {
  return hours >= 10 ? `${hours.toFixed(1)}h` : `${hours.toFixed(2)}h`;
}

function toUtcDayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function calculateDashboardInsight(
  entries: HistoryEntry[],
  nowMs = Date.now()
): DashboardInsightSummary {
  const currentWeekStart = nowMs - WEEK_MS;
  const previousWeekStart = currentWeekStart - WEEK_MS;

  let currentWeekHours = 0;
  let previousWeekHours = 0;
  const currentWeekDays = new Set<string>();
  const genreHours = new Map<string, number>();
  const titleCounts = new Map<string, number>();

  for (const entry of entries) {
    const watchedAt = parseWatchedAt(entry.watchedAt);
    if (watchedAt === null) continue;

    const progressHours = Math.max(0, entry.progressMs ?? 0) / HOUR_MS;
    if (progressHours <= 0) continue;

    if (watchedAt >= currentWeekStart && watchedAt <= nowMs) {
      currentWeekHours += progressHours;
      currentWeekDays.add(toUtcDayKey(watchedAt));

      const title = entry.title.trim();
      if (title) {
        titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
      }

      const rawGenres = Array.isArray(entry.genres) ? entry.genres : [];
      const uniqueGenres = Array.from(
        new Set(
          rawGenres
            .map((genre) => genre.trim())
            .filter((genre) => genre.length > 0)
        )
      );

      if (uniqueGenres.length > 0) {
        const weightedHours = progressHours / uniqueGenres.length;
        for (const genre of uniqueGenres) {
          genreHours.set(genre, (genreHours.get(genre) ?? 0) + weightedHours);
        }
      }
    } else if (watchedAt >= previousWeekStart && watchedAt < currentWeekStart) {
      previousWeekHours += progressHours;
    }
  }

  const topGenre = Array.from(genreHours.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topTitle = Array.from(titleCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const activeDays = currentWeekDays.size;

  let trendDirection: TrendDirection = 'flat';
  let trendText = 'new activity this week';
  if (currentWeekHours === 0 && previousWeekHours === 0) {
    trendText = 'no activity in the last 14 days';
  } else if (currentWeekHours === 0 && previousWeekHours > 0) {
    trendDirection = 'down';
    trendText = `down from ${formatHours(previousWeekHours)} last week`;
  } else if (previousWeekHours > 0 && currentWeekHours > 0) {
    const deltaPercent = ((currentWeekHours - previousWeekHours) / previousWeekHours) * 100;
    const roundedDelta = Math.round(deltaPercent);
    if (roundedDelta > 0) trendDirection = 'up';
    if (roundedDelta < 0) trendDirection = 'down';
    trendText = `${roundedDelta >= 0 ? '+' : ''}${roundedDelta}% vs last week`;
  }

  const headline = currentWeekHours > 0
    ? `You watched ${formatHours(currentWeekHours)} this week`
    : 'No watch activity in the last 7 days';

  const detail = currentWeekHours > 0
    ? `Active on ${activeDays} day${activeDays !== 1 ? 's' : ''}${topGenre ? `, mostly ${topGenre}` : ''}${topTitle ? `. Top title: ${topTitle}.` : '.'}`
    : 'Watch an episode this week to restart your momentum.';

  return {
    currentWeekHours,
    activeDays,
    topGenre,
    topTitle,
    trendDirection,
    trendText,
    headline,
    detail,
  };
}
