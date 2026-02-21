'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { Tv, BarChart3, Download, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="px-4 py-4 sm:px-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <BrandLogoIcon size="sm" />
            <span className="heading-font truncate text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 sm:text-xl">CrunchyStats</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button className="px-3 py-2 text-sm sm:px-4 sm:text-base">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight sm:text-5xl md:text-6xl">
            Track Your Anime Journey with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              CrunchyStats
            </span>
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-10 leading-relaxed sm:text-xl">
            Discover insights about your Crunchyroll watch history. See what you've watched, analyze your viewing patterns, and export your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In with Crunchyroll
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:gap-6 md:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-8">
          <FeatureCard
            icon={<Tv className="w-10 h-10" />}
            title="Watch History"
            description="View your complete Crunchyroll watch history in a beautiful, sortable table."
          />
          <FeatureCard
            icon={<BarChart3 className="w-10 h-10" />}
            title="Analytics"
            description="Get insights on your viewing patterns, most-watched shows, and total watch time."
          />
          <FeatureCard
            icon={<Download className="w-10 h-10" />}
            title="Export Data"
            description="Download your watch history as CSV or JSON for your own analysis."
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10" />}
            title="Secure & Private"
            description="Your credentials are never stored. All data is fetched directly from Crunchyroll."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-primary-500/20 bg-[var(--card)] p-6 shadow-[0_0_45px_rgba(249,115,22,0.14)] ring-1 ring-[var(--border)]/60 transition-shadow hover:shadow-[0_0_55px_rgba(249,115,22,0.2)]">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
