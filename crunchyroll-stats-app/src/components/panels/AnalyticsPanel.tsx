'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { calculateAnalyticsSummary } from '@/lib/analytics';
import { WatchTimeRangeCard } from '@/components/analytics/WatchTimeRangeCard';
import { AnalyticsMetricGrid } from '@/components/analytics/AnalyticsMetricGrid';
import { GenreInsightsCard } from '@/components/analytics/GenreInsightsCard';
import { StreakPeakCard } from '@/components/analytics/StreakPeakCard';

export function AnalyticsPanel() {
  const { historyData } = useAuthenticatedApp();
  const analyticsEntries = historyData?.data ?? [];
  const summary = useMemo(
    () => calculateAnalyticsSummary(analyticsEntries),
    [analyticsEntries]
  );

  if (!historyData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-600 dark:text-gray-400">
          No analytics available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <WatchTimeRangeCard hoursByRange={summary.watchedHoursByRange} />
      <AnalyticsMetricGrid totals={summary.totals} />
      <GenreInsightsCard totalGenres={summary.genres.total} topGenres={summary.genres.top3} />
      <StreakPeakCard
        longestStreakDays={summary.longestStreakDays}
        peakDayDate={summary.peakDay.date}
        peakDayHours={summary.peakDay.hours}
      />
    </div>
  );
}
