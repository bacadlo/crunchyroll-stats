'use client';

import { LayoutDashboard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type BrandLogoIconSize = 'sm' | 'md';

interface BrandLogoIconProps {
  size?: BrandLogoIconSize;
  className?: string;
}

const SIZE_STYLES: Record<BrandLogoIconSize, {
  wrapper: string;
  icon: string;
  sparkle: string;
  ping: string;
}> = {
  sm: {
    wrapper: 'h-8 w-8',
    icon: 'h-5 w-5',
    sparkle: '-right-0.5 -top-0.5 h-2.5 w-2.5',
    ping: '-bottom-0.5 -left-0.5 h-1.5 w-1.5',
  },
  md: {
    wrapper: 'h-12 w-12',
    icon: 'h-7 w-7',
    sparkle: '-right-1 -top-1 h-3.5 w-3.5',
    ping: '-bottom-1 -left-1 h-2 w-2',
  },
};

export function BrandLogoIcon({ size = 'sm', className }: BrandLogoIconProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-xl bg-primary-500/10 shadow-[0_0_18px_rgba(255,106,0,0.35)]',
        styles.wrapper,
        className
      )}
    >
      <LayoutDashboard className={cn(styles.icon, 'text-primary-600')} />
      <Sparkles className={cn('absolute animate-pulse text-primary-500', styles.sparkle)} />
      <span className={cn('absolute animate-ping rounded-full bg-primary-500/70', styles.ping)} />
    </div>
  );
}
