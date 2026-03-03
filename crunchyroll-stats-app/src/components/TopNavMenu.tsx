'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { BarChart3, LayoutDashboard, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function TopNavMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', onDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <nav className="hidden items-center gap-2 md:flex">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isActive
                  ? 'border-primary-500/50 bg-black text-primary-400'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-primary-500/50 hover:text-white'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-semibold transition-all min-[360px]:gap-2 min-[360px]:px-3 sm:gap-2.5 sm:px-4 sm:text-base md:hidden',
          'border-[var(--border)] text-[var(--text)] hover:border-primary-500/60 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
      >
        <Menu size={20} />
        <span className="max-[359px]:sr-only">Menu</span>
      </button>

      <div
        id={menuId}
        className={cn(
          'absolute left-0 top-full z-20 mt-3 w-[min(18rem,calc(100vw-2rem))] origin-top-left rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 shadow-[0_20px_45px_var(--shadow-color)] backdrop-blur-sm transition-all duration-200 md:hidden',
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        )}
      >
        <div className="group/brand inline-flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-4">
          <BrandLogoIcon size="sm" />
          <span className="heading-font text-base font-semibold leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
            CrunchyStats
          </span>
        </div>

        <nav className="space-y-1 px-3 py-3">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:py-3 sm:text-base',
                  isActive
                    ? 'border border-primary-500/50 bg-black text-primary-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-white'
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
