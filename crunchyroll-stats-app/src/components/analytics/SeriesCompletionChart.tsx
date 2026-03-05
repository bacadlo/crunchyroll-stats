'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AccessibleChartRegion } from '@/components/analytics/AccessibleChartRegion';

interface Props {
  data: { name: string; watched: number; total: number }[];
}

const BAR_COLORS = ['#1976d2', '#7f70d6', '#bd66cb', '#ec5bb1', '#ff5a8f', '#ff6a67', '#ff863e', '#ffa600', '#1976d2', '#7f70d6'];

export function SeriesCompletionChart({ data }: Props) {
  const totalEpisodes = data.reduce((sum, d) => sum + d.watched, 0);
  const topThree = data.slice(0, 3).map((item) => `${item.name}: ${item.watched} episodes watched`);
  const summaryItems = [
    `${data.length} series are shown.`,
    `${totalEpisodes} total episodes watched across the listed series.`,
    ...topThree.map((line) => `Top series ${line}.`),
  ];

  return (
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Top Series by Episodes Watched</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Top 10 series. {totalEpisodes} total episodes across these series.
        </p>
      </CardHeader>
      <CardContent>
        <AccessibleChartRegion
          title="Top series by episodes watched chart"
          description="Horizontal bar chart showing episode totals watched for top series."
          summaryItems={summaryItems}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
                <Label value="Episodes Watched" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: 'var(--chart-label)' }} />
              </XAxis>
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--chart-tick)' }}
                stroke="var(--chart-axis)"
                width={120}
                tickFormatter={(v: string) => v.length > 18 ? `${v.slice(0, 16)}...` : v}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-tooltip-text)' }}
                labelStyle={{ color: 'var(--chart-tooltip-text)' }}
                formatter={(value?: number) => [`${value ?? 0} episodes`, 'Watched']}
              />
              <Bar dataKey="watched" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AccessibleChartRegion>
      </CardContent>
    </Card>
  );
}
