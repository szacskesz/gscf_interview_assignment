import { describe, expect, it } from 'vitest';
import { validateAmount } from './dispute-amount';

describe('Dispute amount', () => {
  it.each([
    ['', 'required'],
    ['1e3', 'invalid'],
    ['1,250.00', 'invalid'],
    ['-12.345', 'nonpositive'],
    ['0.000', 'nonpositive'],
    ['1.230', 'precision'],
    ['9'.repeat(309), 'range'],
  ])('rejects %j as %s', (input, error) => {
    expect(validateAmount(input)).toEqual({ valid: false, error });
  });

  it.each([
    ['1250', 1250],
    ['1250.5', 1250.5],
    ['.01', 0.01],
    ['100000000000000', 100_000_000_000_000],
  ])('parses %j as the decimal amount %s', (input, amount) => {
    expect(validateAmount(input)).toEqual({ valid: true, amount });
  });
});
