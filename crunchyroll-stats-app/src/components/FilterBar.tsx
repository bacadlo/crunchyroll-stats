'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { NormalizedMediaType } from '@/lib/media-type';

export type MediaTypeFilter = 'all' | NormalizedMediaType;

const ALWAYS_SHOWN_MEDIA_TYPES: { value: NormalizedMediaType; label: string }[] = [
  { value: 'episode', label: 'Episodes' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
];

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  mediaType: MediaTypeFilter;
  onMediaTypeChange: (value: MediaTypeFilter) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  mediaType,
  onMediaTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <label htmlFor="filter-search" className="sr-only">
          Search watch history
        </label>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-faint)] w-5 h-5" />
        <input
          id="filter-search"
          type="text"
          placeholder="Search by anime title or episode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_minmax(13rem,1fr)_minmax(13rem,1fr)_auto]">
        <label htmlFor="filter-media-type" className="sr-only">
          Filter by media type
        </label>
        <select
          id="filter-media-type"
          value={mediaType}
          onChange={(e) => onMediaTypeChange(e.target.value as MediaTypeFilter)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <option value="all">All media types</option>
          {ALWAYS_SHOWN_MEDIA_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-[3rem_1fr] items-center gap-2">
          <label
            htmlFor="filter-date-from"
            className="text-right text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]"
          >
            From
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-[3rem_1fr] items-center gap-2">
          <label
            htmlFor="filter-date-to"
            className="text-right text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]"
          >
            To
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          aria-label="Clear all active filters"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};
