'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TopNavMenu } from '@/components/TopNavMenu';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { Profile } from '@/types/auth';
import { LogOut } from 'lucide-react';

function getProfileDisplayName(profile: Profile): string {
  const profileName = profile.profileName?.trim();
  return profileName && profileName.length > 0 ? profileName : profile.username;
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
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [profile?.avatar]);

  const profileDisplayName = profile ? getProfileDisplayName(profile) : '';
  const profileAvatarUrl = profile ? getAvatarUrl(profile.avatar) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <TopNavMenu />

        <div className="flex items-center justify-self-center gap-3">
          <BrandLogoIcon size="sm" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
            CrunchyTracker
          </h1>
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
                  onClick={logout}
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
    </header>
  );
}
