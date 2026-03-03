import { HistoryEntry } from '@/types/watch-history';

export type NormalizedMediaType = 'episode' | 'movie' | 'series' | 'season';

const MEDIA_TYPE_ORDER: readonly NormalizedMediaType[] = ['episode', 'movie', 'series', 'season'];

export function normalizeMediaType(mediaType?: HistoryEntry['mediaType']): NormalizedMediaType | 'other' {
  const value = typeof mediaType === 'string' ? mediaType.toLowerCase() : '';
  if (value === 'movie_listing' || value === 'movie') return 'movie';
  if (value === 'episode' || value === 'series' || value === 'season') return value;
  return 'other';
}

export function getAvailableMediaTypes(entries: HistoryEntry[]): NormalizedMediaType[] {
  const seen = new Set<NormalizedMediaType>();

  for (const entry of entries) {
    const mediaType = normalizeMediaType(entry.mediaType);
    if (mediaType !== 'other') {
      seen.add(mediaType);
    }
  }

  return MEDIA_TYPE_ORDER.filter((mediaType) => seen.has(mediaType));
}
