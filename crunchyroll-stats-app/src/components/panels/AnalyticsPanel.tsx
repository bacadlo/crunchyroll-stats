'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { calculateAnalyticsSummary } from '@/lib/analytics';
import { WatchTimeRangeCard } from '@/components/analytics/WatchTimeRangeCard';
import { AnalyticsMetricGrid } from '@/components/analytics/AnalyticsMetricGrid';
import { GenreInsightsCard } from '@/components/analytics/GenreInsightsCard';
import { StreakPeakCard } from '@/components/analytics/StreakPeakCard';
import { MostBingedSeriesCard } from '@/components/analytics/MostBingedSeriesCard';
import { WatchTimeByDayChart } from '@/components/analytics/WatchTimeByDayChart';
import { WatchTimeByHourChart } from '@/components/analytics/WatchTimeByHourChart';
import { MonthlyTrendChart } from '@/components/analytics/MonthlyTrendChart';
import { CompletionRateCard } from '@/components/analytics/CompletionRateCard';
import { SeriesCompletionChart } from '@/components/analytics/SeriesCompletionChart';
import { NewVsRewatchedChart } from '@/components/analytics/NewVsRewatchedChart';
import { AverageSessionCard } from '@/components/analytics/AverageSessionCard';
import { ActivityCalendar } from '@/components/analytics/ActivityCalendar';
import { GenreOverTimeChart } from '@/components/analytics/GenreOverTimeChart';

export function AnalyticsPanel() {
  const { historyData } = useAuthenticatedApp();
  const analyticsEntries = useMemo(() => {
    return (historyData?.data ?? []).filter((entry) => !!entry.watchedAt);
  }, [historyData]);
  const summary = useMemo(
    () => calculateAnalyticsSummary(analyticsEntries),
    [analyticsEntries]
  );

  if (!historyData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-400">
          No analytics available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsMetricGrid totals={summary.totals} />
      <div className="grid gap-6 md:grid-cols-2">
        <MostBingedSeriesCard data={summary.mostBingedSeries} />
        <StreakPeakCard
          longestStreakDays={summary.longestStreakDays}
          longestStreakStart={summary.longestStreakStart}
          longestStreakEnd={summary.longestStreakEnd}
          peakDayDate={summary.peakDay.date}
          peakDayHours={summary.peakDay.hours}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <WatchTimeRangeCard hoursByRange={summary.watchedHoursByRange} />
        <GenreInsightsCard totalGenres={summary.genres.total} topGenres={summary.genres.top3} />
      </div>

      {/* Activity Calendar - full width */}
      <ActivityCalendar data={summary.activityCalendar} />

      {/* Monthly Trend - full width */}
      <MonthlyTrendChart data={summary.monthlyTrend} />

      {/* Watch patterns */}
      <div className="grid gap-6 md:grid-cols-2">
        <WatchTimeByDayChart data={summary.watchTimeByDayOfWeek} />
        <WatchTimeByHourChart data={summary.watchTimeByHour} />
      </div>

      {/* Stats cards row */}
      <div className="grid gap-6 md:grid-cols-2">
        <CompletionRateCard rate={summary.averageCompletionRate} />
        <AverageSessionCard minutes={summary.averageSessionMinutes} />
      </div>

      {/* Content breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <SeriesCompletionChart data={summary.seriesCompletion} />
        <NewVsRewatchedChart data={summary.newVsRewatched} />
      </div>

      {/* Genre trends - full width */}
      <GenreOverTimeChart data={summary.genreOverTime} />
    </div>
  );
}
