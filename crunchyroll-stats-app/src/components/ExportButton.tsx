'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
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

    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full sm:w-auto', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 sm:w-auto"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 z-20 mt-2 w-44 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg sm:left-auto sm:right-0 sm:w-48">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-t-lg transition-colors"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-b-lg transition-colors"
            >
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};
