'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StateMessage } from '@/components/ui/StateMessage';
import { AuthenticatedAppProvider, useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { PersistentAuthenticatedNavbar } from '@/components/PersistentAuthenticatedNavbar';
import { DashboardPanel } from '@/components/panels/DashboardPanel';
import { AnalyticsPanel } from '@/components/panels/AnalyticsPanel';
import { StatsOverview } from '@/components/StatsOverview';
import { DashboardInsightHeader } from '@/components/DashboardInsightHeader';


function SkeletonPulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--surface-hover)] ${className}`} />;
}

function DashboardSkeleton({ message }: { message: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
        <p className="text-sm text-[var(--text-muted)]">{message}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} tier="standard" accent>
            <div className="p-5 space-y-3">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>

      <Card tier="hero" accent>
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
      </Card>
    </div>
  );
}

function ProtectedAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { historyData, displayEmail, lastRefreshedAt, isLoading, isRefreshing, refreshCooldown, loadingMessage, error, refreshData, logout } = useAuthenticatedApp();
  const isOverviewRoute = pathname === '/overview' || pathname.startsWith('/overview/');
  const isAnalyticsRoute = pathname === '/analytics' || pathname.startsWith('/analytics/');
  const isKnownPersistentRoute = isOverviewRoute || isAnalyticsRoute;

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
          <Card tier="hero" accent className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <StateMessage
                tone="error"
                icon={AlertTriangle}
                title="Error Loading Data"
                description={error}
              />
              <p className="mt-1 text-sm text-[var(--error-text)]">
                This could be a temporary issue with Crunchyroll&apos;s servers.
              </p>
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
          {isOverviewRoute && historyData?.stats && (
            <DashboardInsightHeader
              entries={historyData.data}
              displayName={displayEmail ? displayEmail.split('@')[0] : 'User'}
              lastRefreshedAt={lastRefreshedAt}
              isRefreshing={isRefreshing}
              refreshCooldown={refreshCooldown}
              onRefresh={refreshData}
            />
          )}
          {isOverviewRoute && historyData?.stats && <StatsOverview stats={historyData.stats} entries={historyData.data} />}
          {isOverviewRoute && <DashboardPanel />}
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
