'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { formatDate, getCompletionPercent } from '@/lib/utils';

export default function AnalyticsPage() {
  const { historyData } = useAuthenticatedApp();

  if (!historyData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-600 dark:text-gray-400">
          No analytics available yet.
        </CardContent>
      </Card>
    );
  }

  const completedEpisodes = historyData.data.filter((entry) => getCompletionPercent(entry) >= 95).length;
  const inProgressEpisodes = historyData.data.filter((entry) => {
    const completion = getCompletionPercent(entry);
    return completion > 0 && completion < 95;
  }).length;
  const completionRate = historyData.total > 0
    ? Math.round((completedEpisodes / historyData.total) * 100)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Completion Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completed Episodes</span>
              <span className="stat-number text-xl text-gray-900 dark:text-white">{completedEpisodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="stat-number text-xl text-gray-900 dark:text-white">{inProgressEpisodes}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-gray-700 dark:text-gray-300">Completion Rate</span>
              <span className="stat-number text-2xl text-primary-600">{completionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historyData.stats.recentlyWatched.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{entry.title}</p>
                  <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                    {entry.episodeTitle || 'Unknown episode'}
                  </p>
                </div>
                <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                  {entry.watchedAt ? formatDate(entry.watchedAt) : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
