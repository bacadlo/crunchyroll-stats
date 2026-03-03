'use client';

import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataWindowHintProps {
  className?: string;
}

export function DataWindowHint({ className }: DataWindowHintProps) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-primary-500/25 bg-primary-900/20 px-3 py-1.5 text-xs text-primary-300',
        className
      )}
    >
      <CalendarDays className="h-3.5 w-3.5" />
      Data window: last 12 months of watch history.
    </p>
  );
}
