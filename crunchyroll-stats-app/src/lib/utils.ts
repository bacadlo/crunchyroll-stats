import { HistoryEntry, WatchHistoryStats } from '@/types/watch-history';
import { getCompletionPercent } from '@/lib/analytics';

// Re-export so existing API route imports don't break
export { getCompletionPercent, formatDate, formatDuration, formatTotalWatchTime, exportToCSV, exportToJSON, downloadFile } from '@/lib/analytics';

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
