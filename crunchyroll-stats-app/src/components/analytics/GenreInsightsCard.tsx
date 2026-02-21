'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GenreMetric } from '@/lib/analytics';

interface GenreInsightsCardProps {
  totalGenres: number;
  topGenres: GenreMetric[];
}

function formatHours(value: number): string {
  if (value >= 100) return `${value.toFixed(0)} Hours`;
  return `${value.toFixed(1)} Hours`;
}

export function GenreInsightsCard({ totalGenres, topGenres }: GenreInsightsCardProps) {
  return (
    <Card className="group relative h-full border-primary-500/25 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-primary-500/5 transition-all duration-300 hover:border-primary-500/45 hover:shadow-[0_0_60px_rgba(249,115,22,0.2)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 text-center pt-6">
        <CardTitle>Genre Insights</CardTitle>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">See what genres dominate your watch time.</p>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700/90 dark:text-primary-300">
            Total Genres Watched
          </p>
          <p className="stat-number mt-2 text-3xl text-primary-600 dark:text-primary-400">{totalGenres}</p>
        </div>

        <div className="mx-auto w-full max-w-sm text-left">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Top 3 Genres</p>
          <div className="space-y-2">
            {topGenres.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No genre data available.</p>
            )}
            {topGenres.map((genre, index) => (
              <div
                key={`${genre.name}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)]/70 px-3 py-2 shadow-inner"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {index + 1}. {genre.name}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {formatHours(genre.hours)}
                  </span>
                  {' - '}
                  {genre.titles} {genre.titles === 1 ? 'Title' : 'Titles'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
