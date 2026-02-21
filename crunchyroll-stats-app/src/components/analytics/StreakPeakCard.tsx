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
  if (hours >= 100) return `${hours.toFixed(0)}h`;
  return `${hours.toFixed(1)}h`;
}

export function StreakPeakCard({ longestStreakDays, peakDayDate, peakDayHours }: StreakPeakCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consistency & Peak Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
            <p className="stat-number mt-1 text-3xl text-primary-600">{longestStreakDays}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              day{longestStreakDays !== 1 ? 's' : ''} in a row
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Peak Day</p>
            <p className="stat-number mt-1 text-xl text-gray-900 dark:text-white">{formatPeakDate(peakDayDate)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatHours(peakDayHours)} watched</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
