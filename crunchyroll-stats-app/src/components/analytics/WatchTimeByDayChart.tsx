'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { day: string; hours: number }[];
}

const DAY_COLORS: Record<string, string> = {
  Mon: '#1976d2',
  Tue: '#7f70d6',
  Wed: '#bd66cb',
  Thu: '#ec5bb1',
  Fri: '#ff5a8f',
  Sat: '#ff863e',
  Sun: '#ffa600',
};

export function WatchTimeByDayChart({ data }: Props) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const peakDay = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0]);

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Watch Time by Day of Week</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Total: {totalHours.toFixed(1)}h across all days. Peak day: {peakDay?.day ?? 'N/A'} ({peakDay?.hours.toFixed(1) ?? 0}h).
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
              <Label value="Day of Week" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: 'var(--chart-label)' }} />
            </XAxis>
            <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
              <Label value="Hours" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: 'var(--chart-label)', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-tooltip-text)' }}
              labelStyle={{ color: 'var(--chart-tooltip-text)' }}
              formatter={(value?: number) => [`${(value ?? 0).toFixed(1)} hours`, 'Watch Time']}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} shape={(props: any) => {
              const { x, y, width, height, payload } = props as { x: number; y: number; width: number; height: number; payload: { day: string } };
              const color = DAY_COLORS[payload.day] ?? '#ffa600';
              return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={color} fillOpacity={0.6} />;
            }} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
          {Object.entries(DAY_COLORS).map(([day, color]) => (
            <div key={day} className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span>{day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
