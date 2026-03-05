'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WatchHistoryTable } from '@/components/WatchHistoryTable';
import { FilterBar, MediaTypeFilter } from '@/components/FilterBar';
import { ExportButton } from '@/components/ExportButton';
import { StateMessage } from '@/components/ui/StateMessage';
import { DataWindowHint } from '@/components/ui/DataWindowHint';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { Tv } from 'lucide-react';


export function DashboardPanel() {
  const { historyData, refreshData } = useAuthenticatedApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
      <Card tier="hero" accent>
        <CardContent>
          <StateMessage
            title="No watch history available yet"
            description="Sign in and watch something on Crunchyroll in the last 12 months, then come back to see your stats."
            icon={Tv}
            actionLabel="Try refresh"
            onAction={refreshData}
          />
        </CardContent>
      </Card>
    );
  }

  if (historyData.data.length === 0) {
    return (
      <Card tier="hero" accent>
        <CardHeader className="pb-3 pt-6">
          <CardTitle>Watch History (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            <DataWindowHint />
          </div>
          <StateMessage
            title="No watch history found"
            description="We could not find any watch activity in the last 12 months. Try refreshing after watching something on Crunchyroll."
            actionLabel="Refresh now"
            onAction={refreshData}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card tier="hero" accent>
      <CardHeader className="pb-3 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Watch History ({historyData.data.length})</CardTitle>
          <ExportButton data={historyData.data} className="w-full sm:w-auto" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <DataWindowHint />
          </div>
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
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </CardContent>
    </Card>
  );
}
