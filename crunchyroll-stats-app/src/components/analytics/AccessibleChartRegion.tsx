'use client';

import { ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleChartRegionProps {
  title: string;
  description: string;
  summaryItems: string[];
  className?: string;
  children: ReactNode;
}

export function AccessibleChartRegion({
  title,
  description,
  summaryItems,
  className,
  children,
}: AccessibleChartRegionProps) {
  const titleId = useId();
  const descriptionId = useId();
  const summaryId = useId();

  return (
    <div
      className={cn(className)}
      role="img"
      aria-roledescription="chart"
      aria-labelledby={titleId}
      aria-describedby={`${descriptionId} ${summaryId}`}
    >
      <p id={titleId} className="sr-only">
        {title}
      </p>
      <p id={descriptionId} className="sr-only">
        {description}
      </p>
      <ul id={summaryId} className="sr-only">
        {summaryItems.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
      {children}
    </div>
  );
}
