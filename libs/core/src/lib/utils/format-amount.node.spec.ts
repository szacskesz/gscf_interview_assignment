import { expect, it } from 'vitest';
import { formatAmount } from './format-amount';

it.each([
  [125000, '1,250.00'],
  [125050, '1,250.50'],
  [1, '0.01'],
  [Number.MAX_SAFE_INTEGER, '90,071,992,547,409.91'],
])('formats %d cents as %s', (minorUnits, formatted) => {
  expect(formatAmount(minorUnits)).toBe(formatted);
});
