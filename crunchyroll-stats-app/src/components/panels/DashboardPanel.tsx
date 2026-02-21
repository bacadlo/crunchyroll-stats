'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WatchHistoryTable } from '@/components/WatchHistoryTable';
import { FilterBar } from '@/components/FilterBar';
import { ExportButton } from '@/components/ExportButton';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';

export function DashboardPanel() {
  const { historyData } = useAuthenticatedApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!historyData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-600 dark:text-gray-400">
          No watch history available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Watch History ({historyData.total})</CardTitle>
          <ExportButton data={historyData.data} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <WatchHistoryTable data={historyData.data} searchQuery={searchQuery} />
        </div>
      </CardContent>
    </Card>
  );
}
