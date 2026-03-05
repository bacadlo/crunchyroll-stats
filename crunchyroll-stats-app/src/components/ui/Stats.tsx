import React from 'react';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <Card tier="standard" accent className="h-full">
      <CardContent className="flex flex-col items-center justify-center gap-2 text-center pt-10">
        {icon && (
          <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary-900/30 to-primary-800/30 p-2 text-primary-400 shadow-sm shadow-primary-500/30">
            {icon}
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">{title}</p>
        <p className="stat-number text-3xl text-primary-400 sm:text-4xl">{value}</p>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
