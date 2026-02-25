'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { new: number; rewatched: number };
}

const COLORS = ['#1976d2', '#ffa600'];

export function NewVsRewatchedChart({ data }: Props) {
  const total = data.new + data.rewatched;
  const newPct = total > 0 ? ((data.new / total) * 100).toFixed(1) : '0';
  const chartData = [
    { name: 'New', value: data.new },
    { name: 'Rewatched', value: data.rewatched },
  ];

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>New vs Rewatched</CardTitle>
        <p className="mt-1 text-sm text-gray-400">
          {total} total entries. {newPct}% unique content, {data.rewatched} rewatched entries.
        </p>
      </CardHeader>
      <CardContent>
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
              labelLine={{ stroke: '#9ca3af' }}
              stroke="#000"
              strokeWidth={2}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} fillOpacity={0.6} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: 8, color: '#f3f4f6' }}
              formatter={(value?: number, name?: string) => [`${value ?? 0} entries`, name ?? '']}
            />
            <Legend
              formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
