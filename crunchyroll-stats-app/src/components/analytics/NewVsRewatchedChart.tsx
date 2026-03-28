'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AccessibleChartRegion } from '@/components/analytics/AccessibleChartRegion';

interface Props {
  data: { new: number; rewatched: number };
}

const COLORS = ['#1976d2', '#ffa600'];

export function NewVsRewatchedChart({ data }: Props) {
  const total = data.new + data.rewatched;
  const newPct = total > 0 ? ((data.new / total) * 100).toFixed(1) : '0';
  const rewatchedPct = total > 0 ? ((data.rewatched / total) * 100).toFixed(1) : '0';
  const chartData = [
    { name: 'New', value: data.new },
    { name: 'Rewatched', value: data.rewatched },
  ];
  const summaryItems = [
    `${total} total entries are included.`,
    `${data.new} new entries (${newPct} percent).`,
    `${data.rewatched} rewatched entries (${rewatchedPct} percent).`,
  ];

  return (
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>New vs Rewatched</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {total} total entries. {newPct}% unique content, {data.rewatched} rewatched entries.
        </p>
      </CardHeader>
      <CardContent>
        <AccessibleChartRegion
          title="New versus rewatched chart"
          description="Pie chart comparing new entries against rewatched entries."
          summaryItems={summaryItems}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'var(--chart-label)' }}
                stroke="var(--chart-stroke)"
                strokeWidth={2}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} fillOpacity={0.6} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-tooltip-text)' }}
                formatter={(value, name) => [`${value ?? 0} entries`, String(name ?? '')]}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'var(--chart-tick)' }}>{value}</span>}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </AccessibleChartRegion>
      </CardContent>
    </Card>
  );
}
