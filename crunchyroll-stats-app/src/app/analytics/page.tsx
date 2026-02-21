'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { TopNavMenu } from '@/components/TopNavMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
          <TopNavMenu />

          <div className="flex items-center justify-self-center gap-3">
            <BrandLogoIcon size="sm" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">CrunchyTracker</h1>
          </div>

          <div className="justify-self-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Analytics view is ready. Add charts and deeper insights here.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
