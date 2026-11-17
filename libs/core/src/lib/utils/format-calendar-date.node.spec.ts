import { expect, it } from 'vitest';
import { formatCalendarDate } from './format-calendar-date';

it('accepts real date-only values and preserves the calendar day in display', () => {
  expect(formatCalendarDate('2026-09-18')).toBe('18 Sep 2026');
  expect(formatCalendarDate('2026-04-05')).toBe('5 Apr 2026');
});
