'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WatchTimeRange } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const RANGE_LABELS: Record<WatchTimeRange, string> = {
  all_time: 'All Time',
  last_year: 'Last Year',
  last_month: 'Last Month',
  last_week: 'Last Week',
  last_day: 'Last Day',
};

const RANGE_ORDER: WatchTimeRange[] = ['last_day', 'last_week', 'last_month', 'last_year'];

interface WatchTimeRangeCardProps {
  hoursByRange: Record<WatchTimeRange, number>;
}

function formatHours(value: number): string {
  if (value >= 1000) return `${value.toFixed(0)} Hours`;
  if (value >= 100) return `${value.toFixed(1)} Hours`;
  return `${value.toFixed(2)} Hours`;
}

export function WatchTimeRangeCard({ hoursByRange }: WatchTimeRangeCardProps) {
  const [selectedRange, setSelectedRange] = useState<WatchTimeRange>('last_year');

  const selectedHours = useMemo(() => hoursByRange[selectedRange] ?? 0, [hoursByRange, selectedRange]);

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 text-center pt-6">
        <CardTitle>Watch Time</CardTitle>
        <p className="mt-1 text-sm text-gray-400">Switch ranges to compare total hours.</p>
      </CardHeader>
      <CardContent className="space-y-5 text-center">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 justify-items-center">
          {RANGE_ORDER.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-200',
                selectedRange === range
                  ? 'border-primary-600 bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                  : 'border-[var(--border)] bg-[var(--bg)] text-gray-300 hover:border-primary-500/60 hover:bg-primary-500/5 hover:text-primary-400'
              )}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] px-4 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">
            {RANGE_LABELS[selectedRange]}
          </p>
          <p className="stat-number mt-2 text-3xl text-primary-400">{formatHours(selectedHours)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
