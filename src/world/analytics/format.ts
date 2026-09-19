import { dateTime, monthEnd } from '../model/dates.js';
import type { ActivityMonth } from '../../core/activity-types.js';
import type { ContributionBucket } from './types.js';

export const numberText = (value: number | null | undefined): string =>
  value === null || value === undefined ? 'Not available' : value.toLocaleString('en-US');

const monthFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
export const monthText = (month: string): string => monthFormat.format(dateTime(`${month}-01`));

export function bucketText(bucket: ContributionBucket): string {
  const amount =
    bucket.total === null
      ? 'No observations'
      : `${numberText(bucket.total)} observed contributions`;
  return `${bucket.label}: ${amount}; ${bucket.observedDays} observed days, ${bucket.missingDays} missing days${bucket.partial ? '; partial period' : ''}.`;
}

export function activityPeriod(activity: ActivityMonth): string {
  const partial =
    Date.parse(activity.from) !== dateTime(`${activity.month}-01`) ||
    Math.floor(Date.parse(activity.to) / 1000) !==
      Math.floor(Date.parse(`${monthEnd(activity.month)}T23:59:59.999Z`) / 1000);
  return `${activity.from} – ${activity.to}${partial ? ' · Partial month' : ''}`;
}
