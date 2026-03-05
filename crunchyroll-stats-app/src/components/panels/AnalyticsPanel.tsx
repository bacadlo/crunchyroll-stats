'use client';

import { useMemo, type ReactNode } from 'react';
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
import { GenreOverTimeChart } from '@/components/analytics/GenreOverTimeChart';
import { ChartInsightRow } from '@/components/analytics/ChartInsightRow';
import { buildChartInsights } from '@/lib/chart-insights';

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-4">
      <h2 className="text-base font-semibold text-[var(--text)] whitespace-nowrap sm:text-lg">{children}</h2>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

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

      {/* Watching Patterns */}
      <SectionHeading>Watching Patterns</SectionHeading>
      <MonthlyTrendChart data={summary.monthlyTrend} />
      <div className="grid gap-6 md:grid-cols-2">
        <WatchTimeByDayChart data={summary.watchTimeByDayOfWeek} />
        <WatchTimeByHourChart data={summary.watchTimeByHour} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <StreakPeakCard
          longestStreakDays={summary.longestStreakDays}
          longestStreakStart={summary.longestStreakStart}
          longestStreakEnd={summary.longestStreakEnd}
          peakDayDate={summary.peakDay.date}
          peakDayHours={summary.peakDay.hours}
        />
        <AverageSessionCard minutes={summary.averageSessionMinutes} />
      </div>

      {/* Content & Genres */}
      <SectionHeading>Content &amp; Genres</SectionHeading>
      <div className="grid gap-6 md:grid-cols-3">
        <MostBingedSeriesCard data={summary.mostBingedSeries} />
        <GenreInsightsCard totalGenres={summary.genres.total} topGenres={summary.genres.top3} />
        <NewVsRewatchedChart data={summary.newVsRewatched} />
      </div>
      <GenreOverTimeChart data={summary.genreOverTime} />

      {/* Completion */}
      <SectionHeading>Completion</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2">
        <CompletionRateCard rate={summary.averageCompletionRate} />
        <WatchTimeRangeCard hoursByRange={summary.watchedHoursByRange} />
      </div>
      <SeriesCompletionChart data={summary.seriesCompletion} />
    </div>
  );
}
