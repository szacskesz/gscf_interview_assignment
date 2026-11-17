export type AmountError = 'required' | 'invalid' | 'nonpositive' | 'precision' | 'range';

export type AmountResult =
  | { readonly valid: true; readonly minorUnits: number }
  | { readonly valid: false; readonly error: AmountError };
