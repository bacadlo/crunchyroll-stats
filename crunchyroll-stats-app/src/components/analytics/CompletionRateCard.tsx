'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  rate: number;
}

export function CompletionRateCard({ rate }: Props) {
  const pct = (rate * 100).toFixed(1);
  return (
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Average Completion Rate</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Average % of each episode/movie watched before moving on. 100% means fully completed.</p>
      </CardHeader>
      <CardContent className="text-center">
        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4">
          <p className="stat-number text-4xl text-primary-400">{pct}%</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">average progress per entry</p>
        </div>
      </CardContent>
    </Card>
  );
}
