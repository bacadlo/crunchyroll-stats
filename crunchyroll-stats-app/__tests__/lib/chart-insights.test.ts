import { describe, it, expect } from 'vitest';
import { buildChartInsights } from '@/lib/chart-insights';
import { AnalyticsSummary } from '@/lib/analytics';

function makeSummary(overrides: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    watchedHoursByRange: { all_time: 0, last_year: 0, last_month: 0, last_week: 0, last_day: 0 },
    totals: { titles: 0, series: 0, movies: 0, episodes: 0 },
    genres: { total: 0, top3: [] },
    longestStreakDays: 0,
    longestStreakStart: null,
    longestStreakEnd: null,
    peakDay: { date: null, hours: 0 },
    mostBingedSeries: null,
    watchTimeByDayOfWeek: [],
    watchTimeByHour: [],
    monthlyTrend: [],
    averageCompletionRate: 0,
    seriesCompletion: [],
    newVsRewatched: { new: 0, rewatched: 0 },
    averageSessionMinutes: 0,
    activityCalendar: [],
    genreOverTime: [],
    ...overrides,
  };
}

describe('buildChartInsights', () => {
  describe('monthlyTrend', () => {
    it('returns fallback with < 2 months', () => {
      const result = buildChartInsights(makeSummary({ monthlyTrend: [{ month: '2025-01', hours: 10 }] }));
      expect(result.monthlyTrend.headline).toContain('Not enough data');
    });

    it('returns fallback with empty data', () => {
      const result = buildChartInsights(makeSummary({ monthlyTrend: [] }));
      expect(result.monthlyTrend.headline).toContain('Not enough data');
    });

    it('identifies peak month and rising trend', () => {
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 10 },
          { month: '2025-02', hours: 20 },
          { month: '2025-03', hours: 42.3 },
        ],
      }));
      expect(result.monthlyTrend.headline).toBe('March was your peak at 42.3h');
      expect(result.monthlyTrend.detail).toContain('Trending up');
    });

    it('uses static month name map (not locale)', () => {
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-11', hours: 5 },
          { month: '2025-12', hours: 20 },
        ],
      }));
      expect(result.monthlyTrend.headline).toContain('December');
    });

    it('detects steady at exactly +5% boundary', () => {
      // 100 -> 105 is exactly 5%, should be steady
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 100 },
          { month: '2025-02', hours: 105 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Steady');
    });

    it('detects steady at exactly -5% boundary', () => {
      // 100 -> 95 is exactly -5%, should be steady
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 100 },
          { month: '2025-02', hours: 95 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Steady');
    });

    it('detects rising just above +5% boundary', () => {
      // 100 -> 105.1 is >5%
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 100 },
          { month: '2025-02', hours: 105.1 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Trending up');
    });

    it('detects falling just below -5% boundary', () => {
      // 100 -> 94.9 is <-5%
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 100 },
          { month: '2025-02', hours: 94.9 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Trending down');
    });

    it('handles previous month 0h and current 0h as steady', () => {
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 0 },
          { month: '2025-02', hours: 0 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Steady');
    });

    it('handles previous month 0h and current > 0 as rising without percent', () => {
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 0 },
          { month: '2025-02', hours: 15 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Rising');
      expect(result.monthlyTrend.detail).toContain('0h last month');
      expect(result.monthlyTrend.detail).not.toContain('%');
    });

    it('detects falling trend', () => {
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-01', hours: 10 },
          { month: '2025-02', hours: 50 },
          { month: '2025-03', hours: 30 },
        ],
      }));
      expect(result.monthlyTrend.detail).toContain('Trending down');
      expect(result.monthlyTrend.detail).toContain('40%');
    });

    it('tie-breaks peak month by first chronologically', () => {
      const result = buildChartInsights(makeSummary({
        monthlyTrend: [
          { month: '2025-03', hours: 20 },
          { month: '2025-06', hours: 20 },
        ],
      }));
      expect(result.monthlyTrend.headline).toContain('March');
    });
  });

  describe('activeDay', () => {
    it('returns fallback when empty', () => {
      const result = buildChartInsights(makeSummary({ watchTimeByDayOfWeek: [] }));
      expect(result.activeDay.headline).toContain('Not enough data');
    });

    it('returns fallback when all zeros', () => {
      const data = [{ day: 'Monday', hours: 0 }, { day: 'Tuesday', hours: 0 }];
      const result = buildChartInsights(makeSummary({ watchTimeByDayOfWeek: data }));
      expect(result.activeDay.headline).toContain('Not enough data');
    });

    it('picks day with most hours', () => {
      const data = [
        { day: 'Monday', hours: 5 },
        { day: 'Saturday', hours: 12.4 },
        { day: 'Sunday', hours: 8 },
      ];
      const result = buildChartInsights(makeSummary({ watchTimeByDayOfWeek: data }));
      expect(result.activeDay.headline).toBe('Saturday is your most active day');
      expect(result.activeDay.detail).toBe('12.4h total watch time');
    });

    it('tie-breaks by first in array order (Mon before Fri)', () => {
      const data = [
        { day: 'Monday', hours: 10 },
        { day: 'Friday', hours: 10 },
      ];
      const result = buildChartInsights(makeSummary({ watchTimeByDayOfWeek: data }));
      expect(result.activeDay.headline).toContain('Monday');
    });
  });

  describe('peakHours', () => {
    it('returns fallback when empty', () => {
      const result = buildChartInsights(makeSummary({ watchTimeByHour: [] }));
      expect(result.peakHours.headline).toContain('Not enough data');
    });

    it('returns fallback when all zeros', () => {
      const data = [{ hour: 0, hours: 0 }, { hour: 1, hours: 0 }];
      const result = buildChartInsights(makeSummary({ watchTimeByHour: data }));
      expect(result.peakHours.headline).toContain('Not enough data');
    });

    it('formats hour window correctly', () => {
      const data = [{ hour: 21, hours: 15 }, { hour: 10, hours: 3 }];
      const result = buildChartInsights(makeSummary({ watchTimeByHour: data }));
      expect(result.peakHours.headline).toBe('You watch most around 9 PM - 10 PM');
    });

    it('handles midnight crossover (hour 23)', () => {
      const data = [{ hour: 23, hours: 10 }];
      const result = buildChartInsights(makeSummary({ watchTimeByHour: data }));
      expect(result.peakHours.headline).toContain('11 PM - 12 AM');
    });

    it('tie-breaks by first in array order', () => {
      const data = [
        { hour: 8, hours: 10 },
        { hour: 14, hours: 10 },
      ];
      const result = buildChartInsights(makeSummary({ watchTimeByHour: data }));
      expect(result.peakHours.headline).toContain('8 AM');
    });
  });

  describe('completionSession', () => {
    it('returns fallback when both zero', () => {
      const result = buildChartInsights(makeSummary());
      expect(result.completionSession.headline).toContain('Not enough data');
      expect(result.completionSession.detail).toBe('');
    });

    it('leads with completion rate when >= 85%', () => {
      const result = buildChartInsights(makeSummary({
        averageSessionMinutes: 83,
        averageCompletionRate: 0.872,
      }));
      expect(result.completionSession.headline).toContain('87.2%');
      expect(result.completionSession.detail).toContain('1h 23m');
    });

    it('leads with session length when completion < 85%', () => {
      const result = buildChartInsights(makeSummary({
        averageSessionMinutes: 83,
        averageCompletionRate: 0.70,
      }));
      expect(result.completionSession.headline).toContain('1h 23m');
      expect(result.completionSession.detail).toContain('70.0%');
    });

    it('leads with completion at exactly 85% boundary', () => {
      const result = buildChartInsights(makeSummary({
        averageSessionMinutes: 60,
        averageCompletionRate: 0.85,
      }));
      expect(result.completionSession.headline).toContain('85.0%');
      expect(result.completionSession.detail).toContain('1h');
    });

    it('formats sub-hour session', () => {
      const result = buildChartInsights(makeSummary({
        averageSessionMinutes: 45,
        averageCompletionRate: 0.5,
      }));
      expect(result.completionSession.headline).toContain('45m');
    });
  });
});

