import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className }) => {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="stat-number text-3xl text-gray-900 dark:text-white">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
