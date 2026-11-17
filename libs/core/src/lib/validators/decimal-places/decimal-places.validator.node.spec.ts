import { expect, it } from 'vitest';
import { hasAtMostDecimalPlaces } from './decimal-places.validator';

it.each([
  ['1250', 0, true],
  ['1250.0', 0, false],
  ['1.230', 2, false],
  ['1.230', 3, true],
  ['.1234', 4, true],
])('checks %j against a limit of %d decimal places', (value, maximum, expected) => {
  expect(hasAtMostDecimalPlaces(value, maximum)).toBe(expected);
});
