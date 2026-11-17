import { expect, it } from 'vitest';
import { formatLocalDate } from './local-date';

it('formats the calendar date from the local clock components', () => {
  expect(formatLocalDate(new Date(2026, 10, 7, 23, 59))).toBe('2026-11-07');
});
