'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { name: string; watched: number; total: number }[];
}

const BAR_COLORS = ['#1976d2', '#7f70d6', '#bd66cb', '#ec5bb1', '#ff5a8f', '#ff6a67', '#ff863e', '#ffa600', '#1976d2', '#7f70d6'];

export function SeriesCompletionChart({ data }: Props) {
  const totalEpisodes = data.reduce((sum, d) => sum + d.watched, 0);

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Top Series by Episodes Watched</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Top 10 series. {totalEpisodes} total episodes across these series.
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
