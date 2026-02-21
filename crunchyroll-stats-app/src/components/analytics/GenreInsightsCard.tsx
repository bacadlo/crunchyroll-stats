'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GenreMetric } from '@/lib/analytics';

interface GenreInsightsCardProps {
  totalGenres: number;
  topGenres: GenreMetric[];
}

function formatHours(value: number): string {
  if (value >= 100) return `${value.toFixed(0)}h`;
  return `${value.toFixed(1)}h`;
}

export function GenreInsightsCard({ totalGenres, topGenres }: GenreInsightsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Genre Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Genres Watched</p>
          <p className="stat-number mt-1 text-3xl text-gray-900 dark:text-white">{totalGenres}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Top 3 Genres</p>
          <div className="space-y-2">
            {topGenres.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No genre data available.</p>
            )}
            {topGenres.map((genre, index) => (
              <div
                key={`${genre.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {index + 1}. {genre.name}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {formatHours(genre.hours)} - {genre.count} title{genre.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
