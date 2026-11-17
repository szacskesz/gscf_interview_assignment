import { hasAtMostDecimalPlaces } from '@gscf/core/validators';

const amountDecimalPlaces = 2;

export const amountErrors = {
  required: 'Enter a dispute amount.',
  invalid: 'Enter a valid dispute amount.',
  nonpositive: 'Enter an amount greater than 0.',
  precision: `Enter an amount with up to ${amountDecimalPlaces} decimals.`,
  range: 'Enter a smaller dispute amount.',
} as const;

type AmountResult =
  | { readonly valid: true; readonly minorUnits: number }
  | { readonly valid: false; readonly error: keyof typeof amountErrors };

const amountPattern = /^(-?)(?:(\d+)(?:\.(\d*))?|\.(\d+))$/;

export function validateAmount(value: string): AmountResult {
  if (value === '') return { valid: false, error: 'required' };
  const match = amountPattern.exec(value);
  if (!match) return { valid: false, error: 'invalid' };

  const [, sign, whole = '0', decimals, leadingDecimals] = match;
  const fraction = decimals ?? leadingDecimals ?? '';
  if (sign === '-' || !/[1-9]/.test(whole + fraction)) {
    return { valid: false, error: 'nonpositive' };
  }
  if (!hasAtMostDecimalPlaces(value, amountDecimalPlaces)) {
    return { valid: false, error: 'precision' };
  }

  const minorUnits = Number(whole + fraction.padEnd(amountDecimalPlaces, '0'));
  return Number.isSafeInteger(minorUnits)
    ? { valid: true, minorUnits }
    : { valid: false, error: 'range' };
}
