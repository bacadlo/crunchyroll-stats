'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AccessibleChartRegion } from '@/components/analytics/AccessibleChartRegion';

interface Props {
  data: { month: string; hours: number }[];
}

export function MonthlyTrendChart({ data }: Props) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = data.length > 0 ? totalHours / data.length : 0;
  const peakMonth = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0] ?? { month: 'N/A', hours: 0 });
  const recentMonths = data.slice(-2);
  const trendDelta = recentMonths.length === 2
    ? recentMonths[1].hours - recentMonths[0].hours
    : 0;
  const trendDirection = trendDelta > 0 ? 'up' : trendDelta < 0 ? 'down' : 'flat';
  const summaryItems = [
    `${data.length} month${data.length === 1 ? '' : 's'} are currently plotted.`,
    `Average monthly watch time is ${avgHours.toFixed(1)} hours.`,
    `Highest month is ${peakMonth.month} at ${peakMonth.hours.toFixed(1)} hours.`,
    recentMonths.length === 2
      ? `Recent trend is ${trendDirection}, changing by ${Math.abs(trendDelta).toFixed(1)} hours between the last two months.`
      : 'Not enough months to detect a trend between recent months.',
  ];

  return (
    <Card tier="standard" accent className="h-full">
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Monthly Watch Trend</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {data.length} months tracked. Avg: {avgHours.toFixed(1)}h/month. Peak: {peakMonth.month} ({peakMonth.hours.toFixed(1)}h).
        </p>
      </CardHeader>
      <CardContent>
        <AccessibleChartRegion
          title="Monthly watch trend chart"
          description="Line chart showing watch-time hours by month with an average reference line."
          summaryItems={summaryItems}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
                <Label value="Month" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: 'var(--chart-label)' }} />
              </XAxis>
              <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} stroke="var(--chart-axis)">
                <Label value="Hours" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: 'var(--chart-label)', textAnchor: 'middle' }} />
              </YAxis>
              <ReferenceLine y={avgHours} stroke="#1976d2" strokeDasharray="6 4" strokeWidth={1.5} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-tooltip-text)' }}
                labelStyle={{ color: 'var(--chart-tooltip-text)' }}
                itemStyle={{ color: '#000000' }}
                formatter={(value?: number) => [`${(value ?? 0).toFixed(1)} hours`, 'Watch Time']}
              />
              <Line type="monotone" dataKey="hours" stroke="#f47521" strokeWidth={2.5} dot={{ r: 4, fill: '#f47521', stroke: '#ff863e', strokeWidth: 1 }} activeDot={{ r: 7, fill: '#ff5a8f', stroke: '#f47521', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </AccessibleChartRegion>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded" style={{ backgroundColor: '#f47521' }} />
            <span>Monthly hours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded border-t border-dashed" style={{ borderColor: '#1976d2' }} />
            <span style={{ color: '#1976d2' }}>Average ({avgHours.toFixed(1)}h)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
