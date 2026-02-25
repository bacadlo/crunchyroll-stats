'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { hour: number; hours: number }[];
}

const HOUR_COLORS = [
  '#1976d2', '#1976d2', '#1976d2',  // 0-2: Late night (blue)
  '#7f70d6', '#7f70d6', '#7f70d6',  // 3-5: Pre-dawn (indigo)
  '#bd66cb', '#bd66cb', '#bd66cb',  // 6-8: Early morning (purple)
  '#ec5bb1', '#ec5bb1', '#ec5bb1',  // 9-11: Late morning (pink)
  '#ff5a8f', '#ff5a8f', '#ff5a8f',  // 12-14: Early afternoon (rose)
  '#ff6a67', '#ff6a67', '#ff6a67',  // 15-17: Late afternoon (coral)
  '#ff863e', '#ff863e', '#ff863e',  // 18-20: Evening (orange)
  '#ffa600', '#ffa600', '#ffa600',  // 21-23: Night (amber)
];

function getHourColor(hour: number): string {
  return HOUR_COLORS[hour] ?? '#1976d2';
}

export function WatchTimeByHourChart({ data }: Props) {
  const peakHour = data.reduce((max, d) => (d.hours > max.hours ? d : max), data[0]);

  return (
    <Card className="group relative h-full border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Watch Time by Hour of Day</CardTitle>
        <p className="mt-1 text-sm text-gray-400">
          Peak hour: {peakHour?.hour ?? 0}:00 UTC ({peakHour?.hours.toFixed(1) ?? 0}h). Shows when you watch the most.
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#d1d5db' }} stroke="#555" tickFormatter={(h: number) => `${h}:00`}>
              <Label value="Hour of Day (UTC)" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: '#9ca3af' }} />
            </XAxis>
            <YAxis tick={{ fontSize: 12, fill: '#d1d5db' }} stroke="#555">
              <Label value="Hours" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: '#9ca3af', textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: 8, color: '#f3f4f6' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value?: number) => [`${(value ?? 0).toFixed(1)} hours`, 'Watch Time']}
              labelFormatter={(h) => `${h}:00 UTC`}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} shape={(props: any) => {
              const { x, y, width, height, payload } = props as { x: number; y: number; width: number; height: number; payload: { hour: number } };
              const color = getHourColor(payload.hour);
              return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={color} fillOpacity={0.6} />;
            }} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#1976d2' }} /><span>Late Night (0-2)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#7f70d6' }} /><span>Pre-dawn (3-5)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#bd66cb' }} /><span>Morning (6-8)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#ec5bb1' }} /><span>Late AM (9-11)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#ff5a8f' }} /><span>Afternoon (12-14)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#ff6a67' }} /><span>Late PM (15-17)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#ff863e' }} /><span>Evening (18-20)</span></div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#ffa600' }} /><span>Night (21-23)</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
