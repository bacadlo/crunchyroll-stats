'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TopNavMenu } from '@/components/TopNavMenu';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { useAuthenticatedApp } from '@/components/AuthenticatedAppProvider';
import { useTheme } from '@/components/ThemeProvider';
import { ChevronDown, LogOut, Moon, Sun, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PersistentAuthenticatedNavbar() {
  const { displayEmail, logout } = useAuthenticatedApp();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileMenuId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const displayName = displayEmail ? displayEmail.split('@')[0] : 'User';

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

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 sm:py-4">
        <TopNavMenu />

        <div className="flex min-w-0 items-center justify-self-center gap-2 sm:gap-3">
          <BrandLogoIcon size="sm" />
          <h1 className="truncate text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600 min-[380px]:text-lg sm:text-2xl">
            CrunchyStats
          </h1>
        </div>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          <div ref={menuRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 pr-1.5 transition-colors hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-[380px]:gap-2 min-[380px]:pr-2"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls={profileMenuId}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-alt)] sm:h-10 sm:w-10">
                <User className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-[var(--text-secondary)] md:block">
                {displayName}
              </span>
              <ChevronDown
                className={cn(
                  'hidden h-4 w-4 text-[var(--text-muted)] transition-transform min-[360px]:block',
                  isMenuOpen && 'rotate-180'
                )}
              />
            </button>

            <div
              id={profileMenuId}
              className={cn(
                'absolute right-0 top-full z-30 mt-2 w-[min(16rem,calc(100vw-1rem))] origin-top-right rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-[0_16px_32px_var(--shadow-color)] transition-all sm:w-64',
                isMenuOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-1 opacity-0'
              )}
              role="menu"
            >
              <div className="border-b border-[var(--border)] px-2 py-2">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{displayName}</p>
                {displayEmail && (
                  <p className="truncate text-xs text-[var(--text-muted)]">{displayEmail}</p>
                )}
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
                className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
