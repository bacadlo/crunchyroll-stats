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
  const accentCardClass =
    'group relative border-primary-500/25 transition-all duration-300 hover:border-primary-500/45';
  const accentBar = 'absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80';

  if (!historyData) {
    return (
      <Card className={accentCardClass}>
        <div className={accentBar} />
      <CardContent className="pt-10 pb-10 text-center text-gray-400">
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
