'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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

function createDayKeyLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ActivityCalendar({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; hours: number; x: number; y: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent, date: string, hours: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ date, hours, x: rect.left + rect.width / 2, y: rect.top });
  }, []);
  const handleMouseLeave = useCallback(() => setTooltip(null), []);

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
      const key = createDayKeyLocal(d);
      result.push({ date: key, hours: hoursMap.get(key) ?? 0 });
    }
    return { cells: result, maxHours: max || 1, activeDays: active, totalHours: total };
  }, [data]);

  return (
    <Card tier="standard" accent>
      <CardHeader className="pb-3 pt-6 text-center">
        <CardTitle>Activity Calendar</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {activeDays} active days tracked. {totalHours.toFixed(1)} total hours.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex gap-[2px] sm:gap-[3px]">
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
                    className={`h-2.5 w-2.5 rounded-[2px] sm:h-3 sm:w-3 sm:rounded-sm cursor-pointer transition-transform duration-150 ${getColor(cell.hours, maxHours)} hover:scale-[1.6] hover:z-10 hover:ring-1 hover:ring-[var(--text-muted)]/50`}
                    onMouseEnter={(e) => handleMouseEnter(e, cell.date, cell.hours)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
              {tooltip && createPortal(
                <div
                  ref={tooltipRef}
                  className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md bg-[var(--card)] px-2.5 py-1.5 text-[11px] text-[var(--text)] shadow-lg border border-[var(--border)]"
                  style={{ left: tooltip.x, top: tooltip.y - 8, transform: 'translate(-50%, -100%)' }}
                >
                  <div className="font-medium">{tooltip.date}</div>
                  <div className="text-[var(--text-muted)]">{tooltip.hours.toFixed(1)}h watched</div>
                </div>,
                document.body
              )}
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
