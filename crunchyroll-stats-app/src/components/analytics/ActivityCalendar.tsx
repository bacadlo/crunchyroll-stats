'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  data: { date: string; hours: number }[];
}

function getColor(hours: number, max: number): string {
  if (hours === 0) return 'bg-[var(--calendar-empty)]';
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
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {activeDays} active days in the past year. {totalHours.toFixed(1)} total hours. Tap or hover cells for details.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="w-full overflow-x-auto pb-1">
            <div className="flex gap-[2px] sm:gap-[3px]">
              <div className="mr-1 hidden flex-col gap-[2px] min-[420px]:flex sm:gap-[3px]">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="flex h-2.5 items-center sm:h-3">
                    <span className="text-[9px] text-[var(--text-faint)] w-6 text-right">{label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-[2px] sm:gap-[3px]" style={{ width: 'max-content' }}>
                {cells.map((cell) => (
                  <div
                    key={cell.date}
                    className={`h-2.5 w-2.5 rounded-[2px] sm:h-3 sm:w-3 sm:rounded-sm ${getColor(cell.hours, maxHours)}`}
                    title={`${cell.date}: ${cell.hours.toFixed(1)}h`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-faint)]">
              <span>Less</span>
              <div className="h-2.5 w-2.5 rounded-[2px] bg-[var(--calendar-empty)] sm:h-3 sm:w-3 sm:rounded-sm" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary-900 sm:h-3 sm:w-3 sm:rounded-sm" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary-700 sm:h-3 sm:w-3 sm:rounded-sm" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary-600 sm:h-3 sm:w-3 sm:rounded-sm" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary-500 sm:h-3 sm:w-3 sm:rounded-sm" />
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
