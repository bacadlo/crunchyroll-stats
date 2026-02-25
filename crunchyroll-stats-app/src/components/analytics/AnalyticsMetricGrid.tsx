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

export function AnalyticsMetricGrid({ totals }: AnalyticsMetricGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {METRICS.map((metric) => (
        <Card
          key={metric.key}
          className="group relative border-primary-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-500/45"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
          <CardContent className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 bg-primary-900/30 text-primary-400 shadow-inner shadow-primary-500/30">
              <metric.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">
              {metric.label}
            </p>
            <p className="stat-number mt-3 text-4xl text-primary-400">
              {totals[metric.key]}
            </p>
            <p className="mt-2 text-xs text-gray-400">{metric.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
