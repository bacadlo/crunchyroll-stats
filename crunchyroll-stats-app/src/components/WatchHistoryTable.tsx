'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { HistoryEntry } from '@/types/watch-history';
import { formatDate, formatDuration, getCompletionPercent } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WatchHistoryTableProps {
  data: HistoryEntry[];
  searchQuery: string;
}

type SortField = 'title' | 'watchedAt' | 'completion';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) {
  if (sortField !== field) {
    return <ArrowUpDown className="w-4 h-4" />;
  }
  return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
}

function getCompletionColor(percent: number) {
  if (percent >= 90) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
  if (percent >= 50) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
  return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
}

export const WatchHistoryTable: React.FC<WatchHistoryTableProps> = ({ data, searchQuery }) => {
  const [sortField, setSortField] = useState<SortField>('watchedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  const prevSearchQueryRef = useRef(searchQuery);
  if (prevSearchQueryRef.current !== searchQuery) {
    prevSearchQueryRef.current = searchQuery;
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }

  const handleSort = (field: SortField) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = data.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.episodeTitle?.toLowerCase().includes(query) ?? false)
      );
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'watchedAt': {
          const dateA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
          const dateB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        case 'completion':
          comparison = getCompletionPercent(a) - getCompletionPercent(b);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, searchQuery, sortField, sortOrder]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    if (safeCurrentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safeCurrentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 w-20">Thumbnail</th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors"
                >
                  Title
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Episode</th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('watchedAt')}
                  className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors"
                >
                  Date Watched
                  <SortIcon field="watchedAt" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('completion')}
                  className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors"
                >
                  Completion
                  <SortIcon field="completion" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Duration</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No watch history found matching your search.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const completion = getCompletionPercent(item);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-4">
                      {item.thumbnail ? (
                        <div className="group relative w-16 h-10 rounded-md overflow-hidden bg-gradient-to-br from-primary-100 via-white to-purple-100 dark:from-primary-900/30 dark:via-gray-900 dark:to-purple-900/20 ring-1 ring-primary-200/60 dark:ring-primary-800/40 shadow-sm">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-10 rounded-md bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/20 flex items-center justify-center ring-1 ring-primary-200/60 dark:ring-primary-800/40">
                          <Tv className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {item.episodeTitle || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.watchedAt ? formatDate(item.watchedAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompletionColor(completion)}`}
                      >
                        {completion}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.durationMs ? formatDuration(item.durationMs) : 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {startIndex + 1}–{endIndex} of {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-gray-600 dark:text-gray-400">
                Per page:
              </label>
              <select
                id="page-size"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {getPageNumbers().map((page, idx) =>
                page === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 dark:text-gray-500">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === safeCurrentPage ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
