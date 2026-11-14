import { expect, it } from 'vitest';
import { localCalendarDate } from './clock';

it('formats the calendar date from the local clock components', () => {
  expect(localCalendarDate(new Date(2026, 10, 7, 23, 59))).toBe('2026-11-07');
});
