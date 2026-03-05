'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Film, LayoutDashboard, Tv } from 'lucide-react';

interface AnalyticsMetricGridProps {
  totals: {
    series: number;
    movies: number;
    episodes: number;
  };
  metricKeys?: MetricKey[];
}

type MetricKey = 'series' | 'movies' | 'episodes';

const METRICS: Array<{
  key: MetricKey;
  label: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'series',
    label: 'Series Watched',
    helper: 'Distinct shows in your history',
    icon: LayoutDashboard,
  },
  {
    key: 'movies',
    label: 'Movies Watched',
    helper: 'Feature-length entries tracked',
    icon: Film,
  },
  {
    key: 'episodes',
    label: 'Episodes Watched',
    helper: 'Individual episodes completed',
    icon: Tv,
  },
] as const;

export function AnalyticsMetricGrid({ totals, metricKeys }: AnalyticsMetricGridProps) {
  const visibleKeys = metricKeys ?? METRICS.map((metric) => metric.key);
  const visibleMetrics = visibleKeys
    .map((key) => METRICS.find((metric) => metric.key === key))
    .filter((metric): metric is (typeof METRICS)[number] => Boolean(metric));

  const gridColsClass = visibleMetrics.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className={`grid gap-4 ${gridColsClass}`}>
      {visibleMetrics.map((metric) => (
        <Card
          key={metric.key}
          tier="quiet"
          accent
          className="hover:-translate-y-0.5"
        >
          <CardContent className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-900/30 text-primary-400 shadow-inner shadow-primary-500/30">
              <metric.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">
              {metric.label}
            </p>
            <p className="stat-number mt-3 text-4xl text-primary-400">
              {totals[metric.key]}
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{metric.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
