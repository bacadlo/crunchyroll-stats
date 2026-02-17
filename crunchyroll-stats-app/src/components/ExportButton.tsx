'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { WatchHistoryItem } from '@/types/watch-history';
import { exportToCSV, exportToJSON, downloadFile } from '@/lib/utils';
import { Download, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  data: WatchHistoryItem[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
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
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
            >
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};