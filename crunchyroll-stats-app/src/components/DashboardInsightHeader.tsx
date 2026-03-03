'use client';

import { useMemo } from 'react';
import { Sparkles, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { HistoryEntry } from '@/types/watch-history';
import { calculateDashboardInsight } from '@/lib/dashboard-insights';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface DashboardInsightHeaderProps {
  entries: HistoryEntry[];
  displayName: string;
  lastRefreshedAt: number | null;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

function formatLastRefreshed(timestamp: number | null): string {
  if (!timestamp) return 'Not refreshed yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

export function DashboardInsightHeader({
  entries,
  displayName,
  lastRefreshedAt,
  isRefreshing,
  onRefresh,
}: DashboardInsightHeaderProps) {
  const summary = useMemo(() => calculateDashboardInsight(entries), [entries]);
  const refreshedLabel = useMemo(() => formatLastRefreshed(lastRefreshedAt), [lastRefreshedAt]);

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
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="justify-self-start text-xs text-[var(--text-secondary)] sm:text-sm" aria-live="polite">
            Last refreshed: <span className="font-medium text-[var(--text)]">{refreshedLabel}</span>
          </p>
          <h2 className="font-heading text-center text-base font-bold text-[var(--text)] sm:text-xl">
            Welcome back, <span className="text-primary-400">{userName}</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onRefresh()}
            isLoading={isRefreshing}
            disabled={isRefreshing}
            className="justify-self-end"
          >
            {!isRefreshing && <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-sm text-[var(--text-secondary)]">{summary.headline}</p>
          <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${trendStyle}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{summary.trendText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
