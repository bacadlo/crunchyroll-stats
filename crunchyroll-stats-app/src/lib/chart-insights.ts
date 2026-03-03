import { AnalyticsSummary } from '@/lib/analytics';

export interface ChartInsight {
  headline: string;
  detail: string;
}

export interface ChartInsights {
  monthlyTrend: ChartInsight;
  activeDay: ChartInsight;
  peakHours: ChartInsight;
  completionSession: ChartInsight;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

function monthName(yyyyMm: string): string {
  const mm = yyyyMm.split('-')[1];
  return MONTH_NAMES[mm] ?? yyyyMm;
}

function formatHourWindow(hour: number): string {
  const startPeriod = hour < 12 ? 'AM' : 'PM';
  const startHour = hour % 12 || 12;
  const end = (hour + 1) % 24;
  const endPeriod = end < 12 ? 'AM' : 'PM';
  const endHour = end % 12 || 12;
  return `${startHour} ${startPeriod} - ${endHour} ${endPeriod}`;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function buildMonthlyTrend(summary: AnalyticsSummary): ChartInsight {
  const data = summary.monthlyTrend;
  if (data.length < 2) {
    return { headline: 'Not enough data yet for trend insights.', detail: '' };
  }

  const peak = data.reduce((best, current) => (current.hours > best.hours ? current : best), data[0]);
  const peakLabel = monthName(peak.month);

  const last = data[data.length - 1].hours;
  const previous = data[data.length - 2].hours;

  let trendDetail = 'Steady - about the same as last month';
  if (previous === 0 && last === 0) {
    trendDetail = 'Steady - no activity in the last two months';
  } else if (previous === 0) {
    trendDetail = 'Rising - from 0h last month';
  } else {
    const delta = (last - previous) / previous;
    const pct = Math.abs(Math.round(delta * 100));

    if (Math.abs(delta) <= 0.05) {
      trendDetail = 'Steady - about the same as last month';
    } else if (delta > 0) {
      trendDetail = `Trending up - ${pct}% more than last month`;
    } else {
      trendDetail = `Trending down - ${pct}% less than last month`;
    }
  }

  return {
    headline: `${peakLabel} was your peak at ${peak.hours.toFixed(1)}h`,
    detail: trendDetail,
  };
}

function buildActiveDay(summary: AnalyticsSummary): ChartInsight {
  const data = summary.watchTimeByDayOfWeek;
  if (data.length === 0 || data.every((d) => d.hours === 0)) {
    return { headline: 'Not enough data yet for daily insights.', detail: '' };
  }

  const best = data.reduce((top, current) => (current.hours > top.hours ? current : top), data[0]);
  return {
    headline: `${best.day} is your most active day`,
    detail: `${best.hours.toFixed(1)}h total watch time`,
  };
}

function buildPeakHours(summary: AnalyticsSummary): ChartInsight {
  const data = summary.watchTimeByHour;
  if (data.length === 0 || data.every((d) => d.hours === 0)) {
    return { headline: 'Not enough data yet for hourly insights.', detail: '' };
  }

  const best = data.reduce((top, current) => (current.hours > top.hours ? current : top), data[0]);
  return {
    headline: `You watch most around ${formatHourWindow(best.hour)}`,
    detail: 'Your local prime-time window',
  };
}

function buildCompletionSession(summary: AnalyticsSummary): ChartInsight {
  const { averageSessionMinutes, averageCompletionRate } = summary;
  if (averageSessionMinutes === 0 && averageCompletionRate === 0) {
    return { headline: 'Not enough data yet for session insights.', detail: '' };
  }

  const completionText = `${(averageCompletionRate * 100).toFixed(1)}% average completion rate`;
  const sessionText = averageSessionMinutes > 0
    ? `Average session: ${formatMinutes(averageSessionMinutes)}`
    : 'No session data available';

  if (averageCompletionRate >= 0.85) {
    return { headline: completionText, detail: sessionText };
  }

  return { headline: sessionText, detail: completionText };
}

export function buildChartInsights(summary: AnalyticsSummary): ChartInsights {
  return {
    monthlyTrend: buildMonthlyTrend(summary),
    activeDay: buildActiveDay(summary),
    peakHours: buildPeakHours(summary),
    completionSession: buildCompletionSession(summary),
  };
}
