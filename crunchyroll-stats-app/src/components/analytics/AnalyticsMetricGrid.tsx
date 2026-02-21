'use client';

import { Card, CardContent } from '@/components/ui/Card';

interface AnalyticsMetricGridProps {
  totals: {
    titles: number;
    series: number;
    movies: number;
    episodes: number;
  };
}

const METRICS = [
  { key: 'titles', label: 'Total Titles Watched' },
  { key: 'series', label: 'Total Series Watched' },
  { key: 'movies', label: 'Total Movies Watched' },
  { key: 'episodes', label: 'Total Episodes Watched' },
] as const;

export function AnalyticsMetricGrid({ totals }: AnalyticsMetricGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((metric) => (
        <Card key={metric.key}>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
              <p className="stat-number mt-2 text-3xl text-gray-900 dark:text-white">
                {totals[metric.key]}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
