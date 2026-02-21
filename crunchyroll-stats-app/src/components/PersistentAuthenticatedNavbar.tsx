'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { TopNavMenu } from '@/components/TopNavMenu';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Profile } from '@/types/auth';
import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

function getProfileDisplayName(profile: Profile): string {
  const profileName = profile.profileName?.trim();
  return profileName && profileName.length > 0 ? profileName : 'Profile';
}

function getAvatarUrl(avatar: string): string | null {
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
}

export function PersistentAuthenticatedNavbar() {
  const { profile, logout } = useAuthenticatedApp();
  const { theme, toggleTheme } = useTheme();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [profile?.avatar]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', onDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, [isMenuOpen]);

  const profileDisplayName = profile ? getProfileDisplayName(profile) : '';
  const profileAvatarUrl = profile ? getAvatarUrl(profile.avatar) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 sm:py-4">
        <TopNavMenu />

        <div className="flex min-w-0 items-center justify-self-center gap-2 sm:gap-3">
          <BrandLogoIcon size="sm" />
          <h1 className="truncate text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600 sm:text-2xl">
            CrunchyStats
          </h1>
        </div>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          {profile && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 pr-2 transition-colors hover:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                {profileAvatarUrl && !avatarLoadFailed ? (
                  <div className="relative h-9 w-9 overflow-hidden rounded-full sm:h-10 sm:w-10">
                    <Image
                      src={profileAvatarUrl}
                      alt={profileDisplayName}
                      fill
                      sizes="40px"
                      unoptimized
                      className="object-cover"
                      onError={() => {
                        setAvatarLoadFailed(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 sm:h-10 sm:w-10">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {profileDisplayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-gray-800 dark:text-gray-200 md:block">
                  {profileDisplayName}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-gray-500 transition-transform dark:text-gray-400',
                    isMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              <div
                className={cn(
                  'absolute right-0 top-full z-30 mt-2 w-64 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-[0_16px_32px_rgba(15,23,42,0.2)] transition-all',
                  isMenuOpen
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-1 opacity-0'
                )}
                role="menu"
              >
                <div className="border-b border-[var(--border)] px-2 py-2">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{profileDisplayName}</p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="mt-2 flex w-full items-center justify-start gap-2 px-3 py-2 text-sm"
                  role="menuitem"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await logout();
                  }}
                  className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
