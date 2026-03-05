'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { HistoryEntry, WatchHistoryStats } from '@/types/watch-history';
import { StatCard } from './ui/Stats';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { calculateAnalyticsSummary, formatTotalWatchTime, getCompletionPercent } from '@/lib/analytics';
import { Tv, Clock, TrendingUp, BarChart3, Film, Library } from 'lucide-react';
import { ActivityCalendar } from '@/components/analytics/ActivityCalendar';

interface StatsOverviewProps {
  stats: WatchHistoryStats;
  entries: HistoryEntry[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, entries }) => {
  const analyticsEntries = useMemo(() => {
    return entries.filter((entry) => !!entry.watchedAt);
  }, [entries]);

  const summary = useMemo(() => {
    return calculateAnalyticsSummary(analyticsEntries);
  }, [analyticsEntries]);

  const totals = summary.totals;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Titles Watched"
          value={totals.series + totals.movies}
          subtitle="Series and movies combined"
          icon={<Library className="w-6 h-6" />}
        />
        <StatCard
          title="Total Watch Time"
          value={formatTotalWatchTime(Math.round(summary.watchedHoursByRange.all_time * 60))}
          subtitle={`${Math.round(summary.watchedHoursByRange.all_time)} hours total`}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="Average Completion"
          value={`${Math.round(summary.averageCompletionRate * 100)}%`}
          subtitle="Across all entries"
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Episodes Watched"
          value={summary.totals.episodes}
          subtitle="Individual episodes completed"
          icon={<Tv className="w-6 h-6" />}
        />
        <StatCard
          title="Series Watched"
          value={totals.series}
          subtitle="Distinct shows in your history"
          icon={<BarChart3 className="w-6 h-6" />}
        />
        <StatCard
          title="Movies Watched"
          value={totals.movies}
          subtitle="Feature-length entries tracked"
          icon={<Film className="w-6 h-6" />}
        />
      </div>

      <ActivityCalendar data={summary.activityCalendar} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card tier="standard" accent>
          <CardHeader className="pb-3 pt-6 text-center">
            <CardTitle>Top 5 Most Watched Anime</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {stats.topAnime.map((anime, index) => (
                <div
                  key={anime.title}
                  className="group flex items-center gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  <span className="text-lg font-bold text-primary-400 w-6 flex-shrink-0">
                    #{index + 1}
                  </span>
                  {anime.thumbnail ? (
                    <div className="relative w-16 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-900/30 via-[var(--surface)] to-purple-900/20 ring-1 ring-primary-800/40 shadow-sm">
                      <Image
                        src={anime.thumbnail}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-10 rounded-md bg-gradient-to-br from-primary-900/30 to-purple-900/20 flex items-center justify-center flex-shrink-0 ring-1 ring-primary-800/40">
                      <Tv className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">
                      {anime.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {anime.count} episode{anime.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
              {stats.topAnime.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No top anime yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card tier="standard" accent>
          <CardHeader className="pb-3 pt-6 text-center">
            <CardTitle>Recently Watched</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Most recent entries in your watch history.</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {stats.recentlyWatched.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  <span className="text-lg font-bold text-primary-400 w-6 flex-shrink-0">
                    #{index + 1}
                  </span>
                  {item.thumbnail ? (
                    <div className="relative w-16 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-900/30 via-[var(--surface)] to-purple-900/20 ring-1 ring-primary-800/40 shadow-sm">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-10 rounded-md bg-gradient-to-br from-primary-900/30 to-purple-900/20 flex items-center justify-center flex-shrink-0 ring-1 ring-primary-800/40">
                      <Tv className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                      {item.episodeTitle || 'Unknown'}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] ml-2 flex-shrink-0">
                    {getCompletionPercent(item)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
