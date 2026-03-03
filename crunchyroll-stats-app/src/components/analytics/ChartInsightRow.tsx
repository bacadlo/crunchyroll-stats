'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { ChartInsights } from '@/lib/chart-insights';
import { CalendarDays, Clock3, Sparkles, TrendingUp } from 'lucide-react';

interface Props {
  insights: ChartInsights;
}

const labels = [
  { key: 'monthlyTrend' as const, title: 'Monthly Trend', icon: TrendingUp },
  { key: 'activeDay' as const, title: 'Most Active Day', icon: CalendarDays },
  { key: 'peakHours' as const, title: 'Peak Hours', icon: Clock3 },
  { key: 'completionSession' as const, title: 'Session Quality', icon: Sparkles },
];

export function ChartInsightRow({ insights }: Props) {
  return (
    <section className="space-y-3" aria-label="Quick chart insights">
      <div className="px-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-300">Quick Insights</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Short summaries from your watch history.
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {labels.map(({ key, title, icon: Icon }) => {
        const { headline, detail } = insights[key];
        return (
          <Card
            key={key}
            className="group relative border-primary-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-500/45"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
            <CardContent className="flex min-h-[136px] flex-col items-center justify-between pt-4 pb-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-900/35 text-primary-300 ring-1 ring-primary-500/30">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {title}
                </p>
              </div>
              <p className="mt-3 text-sm font-medium leading-5 text-primary-400">{headline}</p>
              <p className="mt-2 min-h-[1.5rem] text-xs leading-5 text-primary-300">
                {detail || ' '}
              </p>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </section>
  );
}
