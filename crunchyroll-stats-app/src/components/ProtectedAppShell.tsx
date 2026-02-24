'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AuthenticatedAppProvider, useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { PersistentAuthenticatedNavbar } from '@/components/PersistentAuthenticatedNavbar';
import { DashboardPanel } from '@/components/panels/DashboardPanel';
import { AnalyticsPanel } from '@/components/panels/AnalyticsPanel';
import { StatsOverview } from '@/components/StatsOverview';


function SkeletonPulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

function DashboardSkeleton({ message }: { message: string }) {
  const cardClass =
    'group relative rounded-xl border border-primary-500/25 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-primary-500/5';
  const accentBar = 'absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-primary-500/35 via-primary-500/70 to-primary-600/80';

  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cardClass}>
            <div className={accentBar} />
            <div className="p-5 space-y-3">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Watch history table skeleton */}
      <div className={cardClass}>
        <div className={accentBar} />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <SkeletonPulse className="h-6 w-40" />
            <SkeletonPulse className="h-9 w-24" />
          </div>
          <SkeletonPulse className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonPulse className="h-12 w-20 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-4 w-3/4" />
                <SkeletonPulse className="h-3 w-1/2" />
              </div>
              <SkeletonPulse className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtectedAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { historyData, isLoading, loadingMessage, error, refreshData, logout } = useAuthenticatedApp();
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isAnalyticsRoute = pathname === '/analytics' || pathname.startsWith('/analytics/');
  const isKnownPersistentRoute = isDashboardRoute || isAnalyticsRoute;

  if (isLoading) {
    return (
      <>
        <PersistentAuthenticatedNavbar />
        <div className="min-h-screen">
          <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
            <DashboardSkeleton message={loadingMessage} />
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PersistentAuthenticatedNavbar />
        <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 sm:px-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={refreshData}>Try Again</Button>
                <Button variant="outline" onClick={logout}>Back to Login</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PersistentAuthenticatedNavbar />
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
          {isDashboardRoute && historyData?.stats && <StatsOverview stats={historyData.stats} />}
          {isDashboardRoute && <DashboardPanel />}
          {isAnalyticsRoute && <AnalyticsPanel />}
          {!isKnownPersistentRoute ? children : null}
        </main>
      </div>
    </>
  );
}

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedAppProvider>
      <ProtectedAppFrame>{children}</ProtectedAppFrame>
    </AuthenticatedAppProvider>
  );
}
