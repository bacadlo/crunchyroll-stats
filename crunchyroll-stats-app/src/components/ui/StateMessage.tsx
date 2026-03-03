'use client';

import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type StateTone = 'neutral' | 'error';

interface StateMessageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  tone?: StateTone;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function StateMessage({
  title,
  description,
  actionLabel,
  onAction,
  tone = 'neutral',
  icon: Icon,
  className,
}: StateMessageProps) {
  const EffectiveIcon = Icon ?? (tone === 'error' ? AlertCircle : Inbox);
  const accentClass = tone === 'error' ? 'text-red-400 ring-red-500/25 bg-red-900/20' : 'text-primary-400 ring-primary-500/30 bg-primary-900/25';

  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-10 text-center', className)}>
      <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-full ring-1', accentClass)}>
        <EffectiveIcon className="h-5 w-5" />
      </div>
      <p className="text-base font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">{description}</p>
      {actionLabel && onAction && (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void onAction()}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
