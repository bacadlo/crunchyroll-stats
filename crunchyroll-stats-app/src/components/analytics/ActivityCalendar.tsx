'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { date: string; hours: number }[];
}

function getColor(hours: number, max: number): string {
  if (hours === 0) return 'bg-gray-800';
  const ratio = hours / max;
  if (ratio < 0.25) return 'bg-primary-900';
  if (ratio < 0.5) return 'bg-primary-700';
  if (ratio < 0.75) return 'bg-primary-600';
  return 'bg-primary-500';
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

export function ActivityCalendar({ data }: Props) {
  const { cells, maxHours, activeDays, totalHours } = useMemo(() => {
    const hoursMap = new Map<string, number>();
    let max = 0;
    let total = 0;
    let active = 0;
    for (const d of data) {
      hoursMap.set(d.date, d.hours);
      if (d.hours > max) max = d.hours;
      total += d.hours;
      if (d.hours > 0) active++;
    }

    const today = new Date();
    const result: { date: string; hours: number }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, hours: hoursMap.get(key) ?? 0 });
    }
    return { cells: result, maxHours: max || 1, activeDays: active, totalHours: total };
  }, [data]);

  return (
    <Card className="group relative border-primary-500/25 transition-all duration-300 hover:border-primary-500/45">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Activity Calendar</CardTitle>
        <p className="mt-1 text-sm text-gray-400">
          {activeDays} active days in the past year. {totalHours.toFixed(1)} total hours. Hover over cells for details.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="overflow-x-auto">
            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-1">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="h-3 flex items-center">
                    <span className="text-[9px] text-gray-500 w-6 text-right">{label}</span>
                  </div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ width: 'max-content' }}>
                {cells.map((cell) => (
                  <div
                    key={cell.date}
                    className={`h-3 w-3 rounded-sm ${getColor(cell.hours, maxHours)}`}
                    title={`${cell.date}: ${cell.hours.toFixed(1)}h`}
                  />
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-gray-800" />
              <div className="h-3 w-3 rounded-sm bg-primary-900" />
              <div className="h-3 w-3 rounded-sm bg-primary-700" />
              <div className="h-3 w-3 rounded-sm bg-primary-600" />
              <div className="h-3 w-3 rounded-sm bg-primary-500" />
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
