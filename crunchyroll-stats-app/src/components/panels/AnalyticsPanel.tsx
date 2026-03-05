'use client';

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { calculateAnalyticsSummary } from '@/lib/analytics';
import { StateMessage } from '@/components/ui/StateMessage';
import { DataWindowHint } from '@/components/ui/DataWindowHint';
import { WatchTimeRangeCard } from '@/components/analytics/WatchTimeRangeCard';
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
import { ChartInsightRow } from '@/components/analytics/ChartInsightRow';
import { buildChartInsights } from '@/lib/chart-insights';

export function AnalyticsPanel() {
  const { historyData } = useAuthenticatedApp();
  const analyticsEntries = useMemo(() => {
    return (historyData?.data ?? []).filter((entry) => !!entry.watchedAt);
  }, [historyData]);
  const summary = useMemo(
    () => calculateAnalyticsSummary(analyticsEntries),
    [analyticsEntries]
  );
  const insights = useMemo(() => buildChartInsights(summary), [summary]);

  if (!historyData) {
    return (
      <Card tier="standard" accent>
        <CardContent>
          <StateMessage
            title="No analytics available yet"
            description="Watch history from the last 12 months is needed to generate analytics."
            icon={BarChart3}
          />
        </CardContent>
      </Card>
    );
  }

  if (analyticsEntries.length === 0) {
    return (
      <Card tier="standard" accent>
        <CardContent>
          <StateMessage
            title="No analyzable watch data yet"
            description="We found account data, but there are no dated watch events in the last 12 months to chart. Watch a title and refresh to populate analytics."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <DataWindowHint />
      </div>
      <ChartInsightRow insights={insights} />
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

      <ActivityCalendar data={summary.activityCalendar} />

      <MonthlyTrendChart data={summary.monthlyTrend} />

      <div className="grid gap-6 md:grid-cols-2">
        <WatchTimeByDayChart data={summary.watchTimeByDayOfWeek} />
        <WatchTimeByHourChart data={summary.watchTimeByHour} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CompletionRateCard rate={summary.averageCompletionRate} />
        <AverageSessionCard minutes={summary.averageSessionMinutes} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SeriesCompletionChart data={summary.seriesCompletion} />
        <NewVsRewatchedChart data={summary.newVsRewatched} />
      </div>

      <GenreOverTimeChart data={summary.genreOverTime} />
    </div>
  );
}
