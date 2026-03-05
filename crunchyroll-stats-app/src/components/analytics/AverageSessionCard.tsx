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
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Average Session Length</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">A session is a group of consecutive watches with less than 30 minutes between them.</p>
      </CardHeader>
      <CardContent className="text-center">
        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4">
          <p className="stat-number text-4xl text-primary-400">{display}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">per session</p>
        </div>
      </CardContent>
    </Card>
  );
}
