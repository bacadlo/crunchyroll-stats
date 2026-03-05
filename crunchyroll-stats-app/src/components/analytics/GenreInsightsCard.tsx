'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GenreMetric } from '@/lib/analytics';
import { Tag } from 'lucide-react';

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
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 text-center pt-6">
        <CardTitle>Genre Insights</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">See what genres dominate your watch time.</p>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">
            Total Genres Watched
          </p>
          <p className="stat-number mt-2 text-3xl text-primary-400">{totalGenres}</p>
        </div>

        <div className="mx-auto w-full max-w-sm text-left">
          <p className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">Top 3 Genres</p>
          <div className="space-y-2">
            {topGenres.length === 0 && (
              <p className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Tag className="h-4 w-4 text-primary-400" />
                No genre data available.
              </p>
            )}
            {topGenres.map((genre, index) => (
              <div
                key={`${genre.name}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)]/70 px-3 py-2 shadow-inner"
              >
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {index + 1}. {genre.name}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-primary-400">
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
