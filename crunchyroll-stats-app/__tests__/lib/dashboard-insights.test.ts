import { describe, it, expect } from 'vitest';
import { calculateDashboardInsight } from '@/lib/dashboard-insights';
import { createEntry } from '../helpers/fixtures';

const NOW = Date.parse('2026-03-03T12:00:00.000Z');

describe('calculateDashboardInsight', () => {
  it('returns no-activity messaging when no recent entries exist', () => {
    const summary = calculateDashboardInsight([], NOW);
    expect(summary.currentWeekHours).toBe(0);
    expect(summary.trendDirection).toBe('flat');
    expect(summary.trendText).toBe('no activity in the last 14 days');
    expect(summary.headline).toBe('No watch activity in the last 7 days');
  });

  it('returns positive trend when current week exceeds previous week', () => {
    const entries = [
      createEntry({
        watchedAt: '2026-03-02T11:00:00.000Z',
        progressMs: 2 * 60 * 60 * 1000,
        genres: ['Action'],
        title: 'Current Show',
      }),
      createEntry({
        watchedAt: '2026-02-24T11:00:00.000Z',
        progressMs: 60 * 60 * 1000,
        genres: ['Action'],
        title: 'Previous Show',
      }),
    ];

    const summary = calculateDashboardInsight(entries, NOW);
    expect(summary.currentWeekHours).toBe(2);
    expect(summary.trendDirection).toBe('up');
    expect(summary.trendText).toBe('+100% vs last week');
    expect(summary.topGenre).toBe('Action');
    expect(summary.topTitle).toBe('Current Show');
    expect(summary.activeDays).toBe(1);
  });

  it('returns down trend when prior week had activity and current week has none', () => {
    const entries = [
      createEntry({
        watchedAt: '2026-02-24T10:00:00.000Z',
        progressMs: 3 * 60 * 60 * 1000,
      }),
    ];

    const summary = calculateDashboardInsight(entries, NOW);
    expect(summary.currentWeekHours).toBe(0);
    expect(summary.trendDirection).toBe('down');
    expect(summary.trendText).toBe('down from 3.00h last week');
  });

  it('weights genres and picks top genre/title from current week', () => {
    const entries = [
      createEntry({
        watchedAt: '2026-03-03T02:00:00.000Z',
        progressMs: 60 * 60 * 1000,
        title: 'Show A',
        genres: ['Action', 'Comedy'],
      }),
      createEntry({
        watchedAt: '2026-03-03T03:00:00.000Z',
        progressMs: 60 * 60 * 1000,
        title: 'Show A',
        genres: ['Action'],
      }),
    ];

    const summary = calculateDashboardInsight(entries, NOW);
    expect(summary.topGenre).toBe('Action');
    expect(summary.topTitle).toBe('Show A');
    expect(summary.headline).toContain('You watched');
    expect(summary.detail).toContain('Top title: Show A.');
  });
});
