/** Checks the precision of a plain decimal string, counting trailing zeroes. */
export function hasAtMostDecimalPlaces(value: string, maximum: number): boolean {
  const separator = value.indexOf('.');
  return separator === -1 || value.length - separator - 1 <= maximum;
}
