import { describe, expect, it } from 'vitest';
import { formatAmount, validateAmount } from './dispute-amount';

describe('Dispute amount', () => {
  it.each([
    ['', 'required'],
    ['1e3', 'invalid'],
    ['1,250.00', 'invalid'],
    ['-12.345', 'nonpositive'],
    ['0.000', 'nonpositive'],
    ['1.230', 'precision'],
    ['90071992547409.92', 'range'],
  ])('rejects %j as %s', (input, error) => {
    expect(validateAmount(input)).toEqual({ valid: false, error });
  });

  it.each([
    ['1250', 125000, '1,250.00'],
    ['1250.5', 125050, '1,250.50'],
    ['.01', 1, '0.01'],
    ['90071992547409.91', Number.MAX_SAFE_INTEGER, '90,071,992,547,409.91'],
  ])('stores %j as exactly %s cents', (input, minorUnits, formatted) => {
    expect(validateAmount(input)).toEqual({ valid: true, minorUnits });
    expect(formatAmount(minorUnits)).toBe(formatted);
  });
});
