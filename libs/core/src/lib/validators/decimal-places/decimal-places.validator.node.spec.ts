import { expect, it } from 'vitest';
import { hasAtMostDecimalPlaces } from './decimal-places.validator';

it.each([
  [1250, 0, true],
  [1.23, 2, true],
  [1.203, 2, false],
  [0.1234, 4, true],
  [0.01, 2, true],
  [1e-7, 2, false],
  [1.2e-7, 7, false],
  [1.2e-7, 8, true],
  [1.23e21, 0, true],
  [Infinity, 2, false],
])('checks %j against a limit of %d decimal places', (value, maximum, expected) => {
  expect(hasAtMostDecimalPlaces(value, maximum)).toBe(expected);
});
