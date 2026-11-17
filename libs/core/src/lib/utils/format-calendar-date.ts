const englishDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatCalendarDate(value: string): string {
  return englishDate.format(new Date(`${value}T00:00:00Z`)).replace('Sept', 'Sep');
}
