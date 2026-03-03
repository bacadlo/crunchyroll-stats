import { HistoryEntry } from '@/types/watch-history';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export type TrendDirection = 'up' | 'down' | 'flat';

export interface DashboardInsightSummary {
  currentWeekHours: number;
  trendDirection: TrendDirection;
  trendText: string;
  headline: string;
}

function parseWatchedAt(dateString?: string): number | null {
  if (!dateString) return null;
  const parsed = new Date(dateString).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function formatHours(hours: number): string {
  return hours >= 10 ? `${hours.toFixed(1)}h` : `${hours.toFixed(2)}h`;
}

export function calculateDashboardInsight(
  entries: HistoryEntry[],
  nowMs = Date.now()
): DashboardInsightSummary {
  const currentWeekStart = nowMs - WEEK_MS;
  const previousWeekStart = currentWeekStart - WEEK_MS;

  let currentWeekHours = 0;
  let previousWeekHours = 0;

  for (const entry of entries) {
    const watchedAt = parseWatchedAt(entry.watchedAt);
    if (watchedAt === null) continue;

    const progressHours = Math.max(0, entry.progressMs ?? 0) / HOUR_MS;
    if (progressHours <= 0) continue;

    if (watchedAt >= currentWeekStart && watchedAt <= nowMs) {
      currentWeekHours += progressHours;
    } else if (watchedAt >= previousWeekStart && watchedAt < currentWeekStart) {
      previousWeekHours += progressHours;
    }
  }

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

  return {
    currentWeekHours,
    trendDirection,
    trendText,
    headline,
  };
}
