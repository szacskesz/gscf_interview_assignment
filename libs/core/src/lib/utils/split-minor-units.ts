export function splitMinorUnits(minorUnits: number) {
  // Subtract the cents before dividing to keep the full safe integer range exact.
  const fraction = minorUnits % 100;
  return { whole: (minorUnits - fraction) / 100, fraction };
}
