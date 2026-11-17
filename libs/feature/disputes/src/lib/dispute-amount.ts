import { hasAtMostDecimalPlaces } from '@gscf/core';

const amountDecimalPlaces = 2;

export const amountErrors = {
  required: 'Enter a dispute amount.',
  invalid: 'Enter a valid dispute amount.',
  nonpositive: 'Enter an amount greater than 0.',
  precision: `Enter an amount with up to ${amountDecimalPlaces} decimals.`,
  range: 'Enter a smaller dispute amount.',
} as const;

type AmountResult =
  | { readonly valid: true; readonly amount: number }
  | { readonly valid: false; readonly error: keyof typeof amountErrors };

const amountPattern = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;

export function validateAmount(value: string): AmountResult {
  if (value === '') return { valid: false, error: 'required' };
  if (!amountPattern.test(value)) return { valid: false, error: 'invalid' };

  if (value.startsWith('-') || !/[1-9]/.test(value)) {
    return { valid: false, error: 'nonpositive' };
  }
  if (!hasAtMostDecimalPlaces(value, amountDecimalPlaces)) {
    return { valid: false, error: 'precision' };
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? { valid: true, amount } : { valid: false, error: 'range' };
}
