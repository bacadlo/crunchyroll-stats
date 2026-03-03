'use client';

import { useMemo } from 'react';
import { Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { WatchHistoryStats, HistoryEntry } from '@/types/watch-history';
import { calculateDashboardInsight } from '@/lib/dashboard-insights';
import { Card, CardContent } from '@/components/ui/Card';

interface DashboardInsightHeaderProps {
  stats: WatchHistoryStats;
  entries: HistoryEntry[];
  displayName: string;
}

export function DashboardInsightHeader({ stats: preservedStats, entries, displayName }: DashboardInsightHeaderProps) {
  void preservedStats;
  const summary = useMemo(() => calculateDashboardInsight(entries), [entries]);

  let trendStyle = 'text-primary-400';
  let TrendIcon = Sparkles;
  if (summary.trendDirection === 'up') {
    trendStyle = 'text-emerald-400';
    TrendIcon = TrendingUp;
  } else if (summary.trendDirection === 'down') {
    trendStyle = 'text-rose-400';
    TrendIcon = TrendingDown;
  }

  const userName = displayName.trim() || 'Viewer';

  return (
    <Card className="group relative border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardContent className="px-6 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary-500/10 p-2 text-primary-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold text-[var(--text)]">
              Welcome back, <span className="text-primary-400">{userName}</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{summary.headline}</p>
            <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${trendStyle}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{summary.trendText}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
