import React from 'react';
import { cn } from '@/lib/utils';

export type CardTier = 'hero' | 'standard' | 'quiet';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tier?: CardTier;
  accent?: boolean;
}

const CARD_TIER_CLASSES: Record<CardTier, string> = {
  hero: 'border-primary-500/25 shadow-[var(--card-shadow-hero)] hover:border-primary-500/45',
  standard: 'border-[var(--border)] shadow-[var(--card-shadow-standard)] hover:border-primary-500/35',
  quiet: 'border-[var(--border)] bg-[var(--card-quiet-bg)] shadow-[var(--card-shadow-quiet)] hover:border-primary-500/25',
};

const CARD_ACCENT_CLASSES: Record<CardTier, string> = {
  hero: 'h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80',
  standard: 'h-[3px] bg-gradient-to-r from-primary-500/25 via-primary-500/45 to-primary-600/55',
  quiet: 'h-[2px] bg-gradient-to-r from-primary-500/12 via-primary-500/22 to-primary-600/30',
};

interface CardAccentProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: CardTier;
}

export const CardAccent = React.forwardRef<HTMLDivElement, CardAccentProps>(
  ({ tier = 'standard', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-x-0 top-0', CARD_ACCENT_CLASSES[tier], className)}
        {...props}
      />
    );
  }
);

CardAccent.displayName = 'CardAccent';

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, tier = 'standard', accent = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-xl border bg-[var(--card)] ring-1 ring-[var(--border)]/60 transition-all duration-300',
          CARD_TIER_CLASSES[tier],
          className
        )}
        {...props}
      >
        {accent ? <CardAccent tier={tier} /> : null}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-4 py-4 border-b border-[var(--border)] sm:px-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-4 py-4 sm:px-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3 ref={ref} className={cn('text-lg font-semibold text-[var(--text)]', className)} {...props}>
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';
