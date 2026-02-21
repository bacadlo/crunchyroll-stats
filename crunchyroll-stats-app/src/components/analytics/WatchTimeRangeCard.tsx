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

interface WatchTimeRangeCardProps {
  hoursByRange: Record<WatchTimeRange, number>;
}

function formatHours(value: number): string {
  if (value >= 1000) return `${value.toFixed(0)}h`;
  if (value >= 100) return `${value.toFixed(1)}h`;
  return `${value.toFixed(2)}h`;
}

export function WatchTimeRangeCard({ hoursByRange }: WatchTimeRangeCardProps) {
  const [selectedRange, setSelectedRange] = useState<WatchTimeRange>('all_time');

  const selectedHours = useMemo(() => hoursByRange[selectedRange] ?? 0, [hoursByRange, selectedRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watch Time by Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(RANGE_LABELS) as WatchTimeRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                selectedRange === range
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-[var(--border)] bg-[var(--bg)] text-gray-700 hover:border-primary-500/60 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              )}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {RANGE_LABELS[selectedRange]}
          </p>
          <p className="stat-number mt-1 text-3xl text-primary-600">{formatHours(selectedHours)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
