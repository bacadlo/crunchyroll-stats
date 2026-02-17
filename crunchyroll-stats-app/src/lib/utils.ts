import { WatchHistoryItem, WatchHistoryStats } from '@/types/watch-history';

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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
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

export function calculateStats(watchHistory: WatchHistoryItem[]): WatchHistoryStats {
  const totalEpisodes = watchHistory.length;
  const totalWatchTime = watchHistory.reduce((acc, item) => {
    const duration = item.duration || 0;
    const watched = (duration * item.completionPercent) / 100;
    return acc + watched / 60;
  }, 0);

  const animeData = new Map<string, { count: number; thumbnail?: string }>();
  watchHistory.forEach(item => {
    const existing = animeData.get(item.animeTitle);
    if (existing) {
      existing.count += 1;
      if (!existing.thumbnail && item.thumbnail) {
        existing.thumbnail = item.thumbnail;
      }
    } else {
      animeData.set(item.animeTitle, { count: 1, thumbnail: item.thumbnail });
    }
  });

  const topAnime = Array.from(animeData.entries())
    .map(([title, data]) => ({ title, count: data.count, thumbnail: data.thumbnail }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const averageCompletion = watchHistory.length > 0
    ? watchHistory.reduce((acc, item) => acc + item.completionPercent, 0) / watchHistory.length
    : 0;

  const recentlyWatched = watchHistory
    .sort((a, b) => new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime())
    .slice(0, 5);

  return {
    totalEpisodes,
    totalWatchTime: Math.round(totalWatchTime),
    topAnime,
    averageCompletion: Math.round(averageCompletion),
    recentlyWatched,
  };
}

export function exportToCSV(data: WatchHistoryItem[]): string {
  const headers = ['Anime Title', 'Episode Number', 'Episode Name', 'Date Watched', 'Completion %', 'Duration'];
  const rows = data.map(item => [
    item.animeTitle,
    item.episodeNumber || '',
    item.episodeName,
    formatDate(item.dateWatched),
    item.completionPercent.toString(),
    item.duration ? formatDuration(item.duration) : '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
}

export function exportToJSON(data: WatchHistoryItem[]): string {
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