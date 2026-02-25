'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  rate: number;
}

export function CompletionRateCard({ rate }: Props) {
  const pct = (rate * 100).toFixed(1);
  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Average Completion Rate</CardTitle>
        <p className="mt-1 text-sm text-gray-400">Average % of each episode/movie watched before moving on. 100% means fully completed.</p>
      </CardHeader>
      <CardContent className="text-center">
        <div className="rounded-xl border border-primary-500/25 bg-gradient-to-br from-primary-500/10 via-[var(--card)] to-[var(--bg)] p-4">
          <p className="stat-number text-4xl text-primary-400">{pct}%</p>
          <p className="mt-1 text-xs text-gray-400">average progress per entry</p>
        </div>
      </CardContent>
    </Card>
  );
}
