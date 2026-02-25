'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { month: string; [genre: string]: number | string }[];
}

const GENRE_COLORS = ['#1976d2', '#bd66cb', '#ff5a8f', '#ff863e', '#ffa600'];

export function GenreOverTimeChart({ data }: Props) {
  const genres = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== 'month');
  }, [data]);

  if (genres.length === 0) {
    return null;
  }

  return (
    <Card className="group relative border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Genre Trends Over Time</CardTitle>
        <p className="mt-1 text-sm text-gray-400">
          Top {genres.length} genres by hours watched per month (past year). Stacked to show total and proportions.
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#d1d5db' }} stroke="#555">
              <Label value="Month" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: '#9ca3af' }} />
            </XAxis>
            <YAxis tick={{ fontSize: 12, fill: '#d1d5db' }} stroke="#555">
              <Label value="Hours" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: '#9ca3af', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: 8, color: '#f3f4f6' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value?: number, name?: string) => [`${(value ?? 0).toFixed(1)}h`, name ?? '']}
            />
            <Legend
              formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
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
      </CardContent>
    </Card>
  );
}
