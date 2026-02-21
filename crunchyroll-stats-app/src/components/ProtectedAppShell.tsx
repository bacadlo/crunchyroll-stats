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
        <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{loadingMessage}</p>
          </div>
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
