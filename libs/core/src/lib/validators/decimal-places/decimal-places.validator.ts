/** Checks the decimal places in a finite numeric value. */
export function hasAtMostDecimalPlaces(value: number, maximum: number): boolean {
  if (!Number.isFinite(value)) return false;

  const [coefficient, exponent = '0'] = value.toString().split('e');
  const fractionalDigits = coefficient.split('.')[1]?.length ?? 0;
  return Math.max(0, fractionalDigits - Number(exponent)) <= maximum;
}
