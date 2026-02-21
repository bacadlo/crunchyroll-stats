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
import { ThemeToggle } from '@/components/ThemeToggle';
import { TopNavMenu } from '@/components/TopNavMenu';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { WatchHistoryResponse } from '@/types/watch-history';
import { Profile } from '@/types/auth';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<WatchHistoryResponse | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Fetching your history...');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

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
        console.log('Profile data received:', profileResult);
        console.log('Avatar value:', profileResult.avatar);
        console.log('Avatar type:', typeof profileResult.avatar);
        setProfile(profileResult);
      } else {
        console.error('Profile fetch failed:', profileRes.status, await profileRes.text());
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

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessage('Fetching your history...');
      return;
    }

    const timer = setTimeout(() => {
      setLoadingMessage('Analyzing you stats...');
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [profile?.avatar]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  const getProfileDisplayName = (p: Profile): string => {
    const profileName = p.profileName?.trim();
    return profileName && profileName.length > 0 ? profileName : p.username;
  };

  const getAvatarUrl = (avatar: string): string | null => {
    const value = avatar?.trim();
    if (!value) return null;

    if (/^[\w-]+\.(png|jpg|jpeg|webp|gif|avif)$/i.test(value)) {
      return `https://static.crunchyroll.com/assets/avatar/170x170/${value}`;
    }

    if (value.startsWith('//')) return `https:${value}`;
    if (value.startsWith('/')) return `https://www.crunchyroll.com${value}`;
    if (value.startsWith('http://')) return value.replace('http://', 'https://');
    if (value.startsWith('https://')) return value;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
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

  const profileDisplayName = profile ? getProfileDisplayName(profile) : '';
  const profileAvatarUrl = profile ? getAvatarUrl(profile.avatar) : null;

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <TopNavMenu />

            <div className="flex items-center gap-3 justify-self-center">
              <BrandLogoIcon size="sm" />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">CrunchyTracker</h1>
            </div>

            <div className="flex items-center gap-3 justify-self-end">
              <ThemeToggle />
              {profile && (
                <div className="flex items-stretch gap-3">
                  <div className="flex h-12 flex-col items-start justify-center gap-1">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      {profileDisplayName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="h-auto justify-start gap-1 px-0 py-0 text-xs !text-gray-500 hover:!bg-transparent hover:!text-gray-600 focus:!ring-gray-400 dark:!text-gray-400 dark:hover:!text-gray-300 dark:focus:!ring-gray-500"
                    >
                      <LogOut className="w-3 h-3" />
                      Logout
                    </Button>
                  </div>

                  {profileAvatarUrl && !avatarLoadFailed ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={profileAvatarUrl}
                        alt={profileDisplayName}
                        fill
                        sizes="44px"
                        unoptimized
                        className="object-cover"
                        onError={() => {
                          setAvatarLoadFailed(true);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {profileDisplayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
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
