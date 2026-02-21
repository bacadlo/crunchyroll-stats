import React from 'react';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="group relative h-full border-primary-500/25 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-primary-500/5 transition-all duration-300 hover:border-primary-500/45 hover:shadow-[0_0_60px_rgba(249,115,22,0.2)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80" />
      <CardContent className="flex flex-col items-center justify-center gap-2 text-center pt-10">
        {icon && (
          <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-2 text-primary-600 shadow-sm shadow-primary-500/30">
            {icon}
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700/80 dark:text-primary-300">{title}</p>
        <p className="stat-number text-3xl text-primary-600 dark:text-primary-400 sm:text-4xl">{value}</p>
      </CardContent>
    </Card>
  );
};
