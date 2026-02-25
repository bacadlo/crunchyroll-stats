'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  minutes: number;
}

export function AverageSessionCard({ minutes }: Props) {
  const display = minutes >= 60
    ? `${(minutes / 60).toFixed(1)}h`
    : `${minutes.toFixed(0)} min`;

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Average Session Length</CardTitle>
        <p className="mt-1 text-sm text-gray-400">A session is a group of consecutive watches with less than 30 minutes between them.</p>
      </CardHeader>
      <CardContent className="text-center">
        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4">
          <p className="stat-number text-4xl text-primary-400">{display}</p>
          <p className="mt-1 text-xs text-gray-400">per session</p>
        </div>
      </CardContent>
    </Card>
  );
}
