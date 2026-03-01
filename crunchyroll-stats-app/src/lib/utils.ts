import { HistoryEntry, WatchHistoryStats } from '@/types/watch-history';

type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [className: string]: unknown }
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const add = (value: ClassValue): void => {
    if (!value) return;

    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      for (const v of value) add(v);
      return;
    }

    if (typeof value === 'object') {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) classes.push(key);
      }
    }
  };

  for (const input of inputs) add(input);
  return classes.join(' ');
}

export function getCompletionPercent(item: HistoryEntry): number {
  if (!item.progressMs || !item.durationMs || item.durationMs === 0) return 0;
  return Math.min(100, Math.round((item.progressMs / item.durationMs) * 100));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatTotalWatchTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

export function calculateStats(allHistory: HistoryEntry[]): WatchHistoryStats {
  const watchHistory = allHistory;
  const totalEpisodes = watchHistory.length;
  const totalWatchTime = watchHistory.reduce((acc, item) => {
    const progressMs = item.progressMs || 0;
    return acc + progressMs / 60000;
  }, 0);

  const animeData = new Map<string, { count: number; thumbnail?: string }>();
  watchHistory.forEach(item => {
    const existing = animeData.get(item.title);
    if (existing) {
      existing.count += 1;
      if (!existing.thumbnail && item.thumbnail) {
        existing.thumbnail = item.thumbnail;
      }
    } else {
      animeData.set(item.title, { count: 1, thumbnail: item.thumbnail });
    }
  });

  const topAnime = Array.from(animeData.entries())
    .map(([title, data]) => ({ title, count: data.count, thumbnail: data.thumbnail }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const averageCompletion = watchHistory.length > 0
    ? watchHistory.reduce((acc, item) => acc + getCompletionPercent(item), 0) / watchHistory.length
    : 0;

  const recentlyWatched = [...watchHistory]
    .sort((a, b) => {
      const dateA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
      const dateB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return {
    totalEpisodes,
    totalWatchTime: Math.round(totalWatchTime),
    topAnime,
    averageCompletion: Math.round(averageCompletion),
    recentlyWatched,
  };
}

function sanitizeCsvValue(value: string): string {
  // Prevent CSV injection: prefix dangerous leading characters with a single quote
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  // Escape double quotes within the value
  return value.replace(/"/g, '""');
}

export function exportToCSV(data: HistoryEntry[]): string {
  const headers = ['Title', 'Episode', 'Date Watched', 'Completion %', 'Duration'];
  const rows = data.map(item => [
    item.title,
    item.episodeTitle || '',
    item.watchedAt ? formatDate(item.watchedAt) : '',
    getCompletionPercent(item).toString(),
    item.durationMs ? formatDuration(item.durationMs) : '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${sanitizeCsvValue(cell)}"`).join(',')),
  ].join('\n');
}

export function exportToJSON(data: HistoryEntry[]): string {
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
