'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AccessibleChartRegion } from '@/components/analytics/AccessibleChartRegion';

interface Props {
  data: { day: string; hours: number }[];
}

const DAY_COLORS: Record<string, string> = {
  Monday: '#1976d2',
  Tuesday: '#7f70d6',
  Wednesday: '#bd66cb',
  Thursday: '#ec5bb1',
  Friday: '#ff5a8f',
  Saturday: '#ff863e',
  Sunday: '#ffa600',
};

export function WatchTimeByDayChart({ data }: Props) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const peakDay = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0] ?? { day: 'N/A', hours: 0 });
  const topThree = [...data]
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 3)
    .map((item) => `${item.day}: ${item.hours.toFixed(1)} hours`);
  const summaryItems = [
    `Total watch time across the week is ${totalHours.toFixed(1)} hours.`,
    `Most active day is ${peakDay.day} at ${peakDay.hours.toFixed(1)} hours.`,
    ...topThree.map((line) => `Top day ${line}.`),
  ];

  return (
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Watch Time by Day of Week</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Total: {totalHours.toFixed(1)}h across all days. Peak day: {peakDay?.day ?? 'N/A'} ({peakDay?.hours.toFixed(1) ?? 0}h).
        </p>
      </CardHeader>
      <CardContent>
        <AccessibleChartRegion
          title="Watch time by day of week chart"
          description="Bar chart showing total watch-time hours for each day of the week."
          summaryItems={summaryItems}
        >
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
                formatter={(value) => [`${Number(value ?? 0).toFixed(1)} hours`, 'Watch Time']}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} shape={(props: any) => {
                const { x, y, width, height, payload } = props as { x: number; y: number; width: number; height: number; payload: { day: string } };
                const color = DAY_COLORS[payload.day] ?? '#ffa600';
                return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={color} fillOpacity={0.6} />;
              }} />
            </BarChart>
          </ResponsiveContainer>
        </AccessibleChartRegion>
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
