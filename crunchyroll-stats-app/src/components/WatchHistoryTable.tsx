'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { HistoryEntry } from '@/types/watch-history';
import { formatDate, formatDuration, getCompletionPercent } from '@/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
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
  if (percent >= 90) return 'text-green-400 bg-green-900/30';
  if (percent >= 50) return 'text-yellow-400 bg-yellow-900/30';
  return 'text-red-400 bg-red-900/30';
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
      <div className="space-y-3 md:hidden">
        {paginatedData.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No watch history found matching your search.
          </div>
        ) : (
        paginatedData.map((item, index) => {
          const completion = getCompletionPercent(item);
          const globalIndex = startIndex + index + 1;
          return (
              <article
                key={item.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3.5 shadow-sm"
              >
              <div className="flex items-start gap-3">
                <span className="text-lg font-semibold text-primary-600">
                  #{globalIndex}
                </span>
                {item.thumbnail ? (
                    <div className="group relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary-900/30 via-[var(--surface)] to-purple-900/20 ring-1 ring-primary-800/40">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary-900/30 to-purple-900/20 ring-1 ring-primary-800/40">
                      <Tv className="h-4 w-4 text-primary-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text)]">{item.title}</p>
                    <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                      {item.episodeTitle || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-primary-400 min-[380px]:grid-cols-2">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-[var(--text-faint)]">Date</span>
                    <span>{item.watchedAt ? formatDate(item.watchedAt) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-[var(--text-faint)]">Duration</span>
                    <span>{item.durationMs ? formatDuration(item.durationMs) : 'N/A'}</span>
                  </div>
                  <div className="min-[380px]:col-span-2">
                    <span className="mr-2 text-[11px] uppercase tracking-wide text-[var(--text-faint)]">Completion</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCompletionColor(completion)}`}
                    >
                      {completion}%
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left font-semibold text-[var(--text)]">#</th>
              <th className="w-20 px-4 py-3 text-left font-semibold text-[var(--text)]">Thumbnail</th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 font-semibold text-[var(--text)] transition-colors hover:text-primary-400"
                >
                  Title
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--text)]">Episode</th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('watchedAt')}
                  className="flex items-center gap-2 font-semibold text-[var(--text)] transition-colors hover:text-primary-400"
                >
                  Date Watched
                  <SortIcon field="watchedAt" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('completion')}
                  className="flex items-center gap-2 font-semibold text-[var(--text)] transition-colors hover:text-primary-400"
                >
                  Completion
                  <SortIcon field="completion" sortField={sortField} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--text)]">Duration</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No watch history found matching your search.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const completion = getCompletionPercent(item);
                const globalIndex = startIndex + index + 1;
                return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface)]"
                    >
                    <td className="px-4 py-4 font-semibold text-primary-400">
                      #{globalIndex}
                    </td>
                    <td className="px-4 py-4">
                      {item.thumbnail ? (
                        <div className="group relative h-10 w-16 overflow-hidden rounded-md bg-gradient-to-br from-primary-900/30 via-[var(--surface)] to-purple-900/20 ring-1 ring-primary-800/40 shadow-sm">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded-md bg-gradient-to-br from-primary-900/30 to-purple-900/20 ring-1 ring-primary-800/40">
                          <Tv className="h-4 w-4 text-primary-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--text)]">{item.title}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs truncate text-sm text-[var(--text-muted)]">
                        {item.episodeTitle || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-primary-400">
                      {item.watchedAt ? formatDate(item.watchedAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCompletionColor(completion)}`}
                      >
                        {completion}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-primary-400">
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-sm text-[var(--text-muted)] sm:flex-row sm:gap-4">
            <span>
              Showing {startIndex + 1}-{endIndex} of {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-[var(--text-muted)]">
                Per page:
              </label>
              <select
                id="page-size"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            <>
              <div className="flex items-center gap-2 sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[var(--text-secondary)]">
                  Page {safeCurrentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="hidden items-center gap-1 sm:flex">
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
                    <span key={`ellipsis-${idx}`} className="px-2 text-[var(--text-faint)]">
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
