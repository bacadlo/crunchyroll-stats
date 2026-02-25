'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { month: string; hours: number }[];
}

export function MonthlyTrendChart({ data }: Props) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = data.length > 0 ? totalHours / data.length : 0;
  const peakMonth = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0] ?? { month: 'N/A', hours: 0 });

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Monthly Watch Trend</CardTitle>
        <p className="mt-1 text-sm text-gray-400">
          {data.length} months tracked. Avg: {avgHours.toFixed(1)}h/month. Peak: {peakMonth.month} ({peakMonth.hours.toFixed(1)}h).
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#d1d5db' }} stroke="#555">
              <Label value="Month" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: '#9ca3af' }} />
            </XAxis>
            <YAxis tick={{ fontSize: 12, fill: '#d1d5db' }} stroke="#555">
              <Label value="Hours" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: '#9ca3af', textAnchor: 'middle' }} />
            </YAxis>
            <ReferenceLine y={avgHours} stroke="#1976d2" strokeDasharray="6 4" strokeWidth={1.5} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: 8, color: '#f3f4f6' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value?: number) => [`${(value ?? 0).toFixed(1)} hours`, 'Watch Time']}
            />
            <Line type="monotone" dataKey="hours" stroke="#f47521" strokeWidth={2.5} dot={{ r: 4, fill: '#f47521', stroke: '#ff863e', strokeWidth: 1 }} activeDot={{ r: 7, fill: '#ff5a8f', stroke: '#f47521', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
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
