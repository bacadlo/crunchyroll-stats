'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AnalyticsSummary } from '@/lib/analytics';

interface MostBingedSeriesCardProps {
  data: AnalyticsSummary['mostBingedSeries'];
}

function formatHours(value: number): string {
  if (value >= 100) return `${value.toFixed(0)} Hours`;
  if (value >= 10) return `${value.toFixed(1)} Hours`;
  return `${value.toFixed(2)} Hours`;
}

export function MostBingedSeriesCard({ data }: MostBingedSeriesCardProps) {
  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 text-center pt-6">
        <CardTitle>Most Binged Series</CardTitle>
        <p className="mt-1 text-sm text-gray-400">Episodes, hours, and days for your biggest binge.</p>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {data ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">
              {data.name}
            </p>
            <p className="stat-number text-3xl text-primary-400">
              {data.episodes} episode{data.episodes !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gray-400">Total Hours</p>
                <p className="mt-1 text-lg font-semibold text-primary-400">{formatHours(data.hours)}</p>
              </div>
              <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gray-400">Days Watched</p>
                <p className="mt-1 text-lg font-semibold text-primary-400">
                  {data.days} day{data.days !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-5">
            <p className="text-sm text-gray-400">No binge data captured yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
