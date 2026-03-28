'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AccessibleChartRegion } from '@/components/analytics/AccessibleChartRegion';
import { StateMessage } from '@/components/ui/StateMessage';

interface Props {
  data: { month: string; [genre: string]: number | string }[];
}

const GENRE_COLORS = ['#1976d2', '#bd66cb', '#ff5a8f', '#ff863e', '#ffa600'];

export function GenreOverTimeChart({ data }: Props) {
  const genres = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== 'month');
  }, [data]);

  const summaryItems = useMemo(() => {
    if (genres.length === 0) {
      return ['Not enough genre data is available to generate a summary.'];
    }

    const totals = genres.map((genre) => {
      const total = data.reduce((sum, row) => sum + Number(row[genre] ?? 0), 0);
      return { genre, total };
    }).sort((a, b) => b.total - a.total);

    const topGenres = totals.slice(0, 3).map((entry) => `${entry.genre}: ${entry.total.toFixed(1)} hours`);
    return [
      `${data.length} month${data.length === 1 ? '' : 's'} are plotted.`,
      `Top genre overall is ${totals[0]?.genre ?? 'N/A'} at ${(totals[0]?.total ?? 0).toFixed(1)} hours.`,
      ...topGenres.map((line) => `Top genre ${line}.`),
    ];
  }, [data, genres]);

  if (genres.length === 0) {
    return (
      <Card tier="standard" accent>
        <CardHeader className="pb-3 pt-6 text-center">
          <CardTitle>Genre Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <StateMessage
            title="Not enough genre data to chart over time."
            description="Watch more titles across genres to unlock this view."
            className="py-6"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card tier="standard" accent>
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Genre Trends Over Time</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Top {genres.length} genres by hours watched per month. Stacked to show total and proportions.
        </p>
      </CardHeader>
      <CardContent>
        <AccessibleChartRegion
          title="Genre trends over time chart"
          description="Stacked area chart showing hours watched per genre by month."
          summaryItems={summaryItems}
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
                <Label value="Month" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: 'var(--chart-label)' }} />
              </XAxis>
              <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
                <Label value="Hours" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: 'var(--chart-label)', textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444444', borderRadius: 8, color: '#f0f0f0' }}
                labelStyle={{ color: '#f0f0f0' }}
                formatter={(value, name) => [`${Number(value ?? 0).toFixed(1)}h`, String(name ?? '')]}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'var(--chart-tick)' }}>{value}</span>}
                iconType="circle"
              />
              {genres.map((genre, i) => (
                <Area
                  key={genre}
                  type="monotone"
                  dataKey={genre}
                  stackId="1"
                  stroke={GENRE_COLORS[i % GENRE_COLORS.length]}
                  fill={GENRE_COLORS[i % GENRE_COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </AccessibleChartRegion>
      </CardContent>
    </Card>
  );
}
