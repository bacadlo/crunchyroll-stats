'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WatchHistoryTable } from '@/components/WatchHistoryTable';
import { FilterBar, MediaTypeFilter } from '@/components/FilterBar';
import { ExportButton } from '@/components/ExportButton';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';


export function DashboardPanel() {
  const { historyData } = useAuthenticatedApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const accentCardClass =
    'group relative border-primary-500/25 transition-all duration-300 hover:border-primary-500/45';
  const accentBar = 'absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80';
  const hasActiveFilters =
    searchQuery.trim().length > 0
    || mediaType !== 'all'
    || dateFrom.length > 0
    || dateTo.length > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setMediaType('all');
    setDateFrom('');
    setDateTo('');
  };

  if (!historyData) {
    return (
      <Card className={accentCardClass}>
        <div className={accentBar} />
      <CardContent className="pt-10 pb-10 text-center text-[var(--text-muted)]">
          No watch history available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={accentCardClass}>
      <div className={accentBar} />
      <CardHeader className="pb-3 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Watch History ({historyData.data.length})</CardTitle>
          <ExportButton data={historyData.data} className="w-full sm:w-auto" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
          <WatchHistoryTable
            data={historyData.data}
            searchQuery={searchQuery}
            mediaTypeFilter={mediaType}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </div>
      </CardContent>
    </Card>
  );
}
