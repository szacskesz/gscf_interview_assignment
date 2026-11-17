const wholeNumberFormat = new Intl.NumberFormat('en-US');

export function formatAmount(minorUnits: number): string {
  const fraction = minorUnits % 100;
  return `${wholeNumberFormat.format((minorUnits - fraction) / 100)}.${String(fraction).padStart(2, '0')}`;
}
