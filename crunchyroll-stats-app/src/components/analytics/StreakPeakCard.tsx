'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface StreakPeakCardProps {
  longestStreakDays: number;
  peakDayDate: string | null;
  peakDayHours: number;
}

function formatPeakDate(date: string | null): string {
  if (!date) return 'N/A';
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatHours(hours: number): string {
  if (hours >= 100) return `${hours.toFixed(0)} Hours`;
  return `${hours.toFixed(1)} Hours`;
}

export function StreakPeakCard({ longestStreakDays, peakDayDate, peakDayHours }: StreakPeakCardProps) {
  return (
    <Card className="group relative h-full border-primary-500/25 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-primary-500/5 transition-all duration-300 hover:border-primary-500/45 hover:shadow-[0_0_60px_rgba(249,115,22,0.2)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 text-center pt-6">
        <CardTitle>Consistency & Peak Activity</CardTitle>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track your longest run and biggest single day.</p>
      </CardHeader>
      <CardContent className="text-center">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700/90 dark:text-primary-300">
              Longest Streak
            </p>
            <p className="stat-number mt-2 text-3xl text-primary-600 dark:text-primary-400">{longestStreakDays}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              day{longestStreakDays !== 1 ? 's' : ''} in a row
            </p>
          </div>

          <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700/90 dark:text-primary-300">
              Peak Day
            </p>
            <p className="stat-number mt-2 text-xl text-primary-600 dark:text-primary-400">{formatPeakDate(peakDayDate)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatHours(peakDayHours)} watched</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
