const MONTH_FORMATTERS = {
  long: new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }),
  short: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }),
} as const;

export function monthLabel(date: string, width: 'long' | 'short' = 'long'): string {
  return MONTH_FORMATTERS[width].format(new Date(`${date.slice(0, 7)}-01T00:00:00Z`));
}
