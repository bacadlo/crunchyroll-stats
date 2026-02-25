'use client';

import { useEffect, useRef, useState } from 'react';
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
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all sm:gap-2.5 sm:px-4 sm:text-base',
          'border-[var(--border)] text-gray-100 hover:border-primary-500/60 hover:text-primary-400'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Menu size={20} />
        Menu
      </button>

      <div
        className={cn(
          'absolute left-0 top-full z-20 mt-3 w-[min(18rem,calc(100vw-2rem))] origin-top-left rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-sm transition-all duration-200',
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
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-900/30 text-primary-300 shadow-[inset_0_0_20px_rgba(255,106,0,0.08)]'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
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
