export const amountErrors = {
  required: 'Enter a dispute amount.',
  invalid: 'Enter a valid dispute amount.',
  nonpositive: 'Enter an amount greater than 0.',
  precision: 'Enter an amount with up to 2 decimals.',
  range: 'Enter a smaller dispute amount.',
} as const;

type AmountResult =
  | { readonly valid: true; readonly minorUnits: number }
  | { readonly valid: false; readonly error: keyof typeof amountErrors };

const amountPattern = /^(-?)(?:(\d+)(?:\.(\d*))?|\.(\d+))$/;

function validateAmountPrecision(fraction: string): 'precision' | undefined {
  return fraction.length > 2 ? 'precision' : undefined;
}

export function validateAmount(value: string): AmountResult {
  if (value === '') return { valid: false, error: 'required' };
  const match = amountPattern.exec(value);
  if (!match) return { valid: false, error: 'invalid' };

  const [, sign, whole = '0', decimals, leadingDecimals] = match;
  const fraction = decimals ?? leadingDecimals ?? '';
  if (sign === '-' || !/[1-9]/.test(whole + fraction)) {
    return { valid: false, error: 'nonpositive' };
  }
  const precisionError = validateAmountPrecision(fraction);
  if (precisionError) return { valid: false, error: precisionError };

  const minorUnits = Number(whole + fraction.padEnd(2, '0'));
  return Number.isSafeInteger(minorUnits)
    ? { valid: true, minorUnits }
    : { valid: false, error: 'range' };
}
