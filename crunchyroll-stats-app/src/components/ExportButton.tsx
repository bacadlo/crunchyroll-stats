'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { HistoryEntry } from '@/types/watch-history';
import { cn, exportToCSV, exportToJSON, downloadFile } from '@/lib/utils';
import { Download, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  data: HistoryEntry[];
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu(true);
      }
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onDocumentClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, [isOpen]);

  const handleExport = (format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `crunchyroll-watch-history-${timestamp}`;

    if (format === 'csv') {
      const csvContent = exportToCSV(data);
      downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    } else {
      const jsonContent = exportToJSON(data);
      downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }

    closeMenu(false);
  };

  return (
    <div ref={menuRef} className={cn('relative w-full sm:w-auto', className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 sm:w-auto"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => closeMenu(false)}
          />
          <div
            id={menuId}
            className="absolute left-0 z-20 mt-2 w-44 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg sm:left-auto sm:right-0 sm:w-48"
            role="menu"
            aria-label="Export options"
          >
            <button
              type="button"
              onClick={() => handleExport('csv')}
              role="menuitem"
              className="w-full rounded-t-lg px-4 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Export as CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('json')}
              role="menuitem"
              className="w-full rounded-b-lg px-4 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};
