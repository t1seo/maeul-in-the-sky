import type { ContributionDay, ContributionWeek } from './types.js';

const DAY_MS = 86_400_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseContributionDate(date: string): number {
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new Error(`Invalid contribution date: "${date}"`);
  }

  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid contribution date: "${date}"`);
  }

  return timestamp;
}

function formatContributionDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function getContributionDayOfWeek(date: string): number {
  return new Date(parseContributionDate(date)).getUTCDay();
}

export function normalizeContributionWeeks(weeks: ContributionWeek[]): ContributionWeek[] {
  const daysByDate = new Map<string, ContributionDay>();

  for (const week of weeks) {
    for (const day of week.days) {
      parseContributionDate(day.date);
      if (daysByDate.has(day.date)) {
        throw new Error(`Duplicate contribution date: "${day.date}"`);
      }
      daysByDate.set(day.date, day);
    }
  }

  const sortedDays = [...daysByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  const weeksByFirstDay = new Map<string, ContributionDay[]>();

  for (const day of sortedDays) {
    const timestamp = parseContributionDate(day.date);
    const firstDay = formatContributionDate(timestamp - new Date(timestamp).getUTCDay() * DAY_MS);
    const days = weeksByFirstDay.get(firstDay) ?? [];
    days.push(day);
    weeksByFirstDay.set(firstDay, days);
  }

  return [...weeksByFirstDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([firstDay, days]) => ({ firstDay, days }));
}
