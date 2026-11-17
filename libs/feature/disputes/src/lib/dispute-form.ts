import { required, schema, validate, type FieldState } from '@angular/forms/signals';
import type { Currency } from '@gscf/disputes-data-access';
import type { AmountDraft } from './amount-field';
import { amountErrors, validateAmount } from './dispute-amount';
import { requiredNonEmpty } from './validators/required-non-empty';

export interface DisputeDraft {
  buyer: string;
  reason: string;
  amount: AmountDraft;
  currency: Currency | '';
}

export const disputeSchema = schema<DisputeDraft>((path) => {
  requiredNonEmpty(path.buyer, 'Enter a buyer name.');
  requiredNonEmpty(path.reason, 'Enter a dispute reason.');
  validate(path.amount, ({ value }) => {
    const { raw, badInput } = value();
    const result = validateAmount(raw);
    if (badInput) return { kind: 'invalid', message: amountErrors.invalid };
    return result.valid ? undefined : { kind: result.error, message: amountErrors[result.error] };
  });
  required(path.currency, { message: 'Select a currency.' });
});

export function visibleError(
  field: Pick<FieldState<unknown>, 'touched' | 'errors'>,
): string | null {
  return field.touched() ? (field.errors()[0]?.message ?? null) : null;
}
