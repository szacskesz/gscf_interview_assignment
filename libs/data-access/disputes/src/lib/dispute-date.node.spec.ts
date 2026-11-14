import { expect, it } from 'vitest';
import { formatDisputeDate, isCalendarDate } from './dispute-date';

it('accepts real date-only values and preserves the calendar day in display', () => {
  expect(isCalendarDate('2028-02-29')).toBe(true);
  expect(isCalendarDate('2026-02-29')).toBe(false);
  expect(isCalendarDate('2026-09-18T00:00:00Z')).toBe(false);
  expect(formatDisputeDate('2026-09-18')).toBe('18 Sep 2026');
  expect(formatDisputeDate('2026-04-05')).toBe('5 Apr 2026');
});
