'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WatchHistoryTable } from '@/components/WatchHistoryTable';
import { FilterBar } from '@/components/FilterBar';
import { StatsOverview } from '@/components/StatsOverview';
import { ExportButton } from '@/components/ExportButton';
import { useTheme } from '@/components/ThemeProvider';
import { WatchHistoryResponse } from '@/types/watch-history';
import { Profile } from '@/types/auth';
import { Tv, RefreshCw, LogOut, Sun, Moon } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<WatchHistoryResponse | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);

      const [historyRes, profileRes] = await Promise.all([
        fetch('/api/watch-history'),
        fetch('/api/profile'),
      ]);

      if (historyRes.status === 401) {
        router.push('/login');
        return;
      }

      if (!historyRes.ok) {
        const errorData = await historyRes.json();
        throw new Error(errorData.error || 'Failed to fetch watch history');
      }

      const historyResult = await historyRes.json();
      setData(historyResult);

      if (profileRes.ok) {
        const profileResult = await profileRes.json();
        setProfile(profileResult);
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your watch history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchData}>Try Again</Button>
              <Button variant="outline" onClick={handleLogout}>Back to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tv className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CrunchyTracker</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Anime Watch History</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile && (
                <div className="flex items-center gap-2 mr-2">
                  {profile.avatar && (
                    <Image
                      src={profile.avatar}
                      alt={profile.username}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile.username}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="flex items-center gap-2"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                onClick={fetchData}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {data?.stats && <StatsOverview stats={data.stats} />}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Watch History ({data?.total || 0})</CardTitle>
              {data?.data && <ExportButton data={data.data} />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              {data?.data && (
                <WatchHistoryTable data={data.data} searchQuery={searchQuery} />
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
