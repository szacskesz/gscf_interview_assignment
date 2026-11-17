import { required, schema, validate, type FieldState } from '@angular/forms/signals';
import type { Currency } from '@gscf/disputes-data-access';
import type { AmountDraft } from './amount-field';
import { amountErrors, validateAmount } from './dispute-amount';

export interface DisputeDraft {
  buyer: string;
  reason: string;
  amount: AmountDraft;
  currency: Currency | '';
}

export const disputeSchema = schema<DisputeDraft>((path) => {
  const nonblank = ({ value }: { value: () => string }) => value().trim().length > 0;
  required(path.buyer, { message: 'Enter a buyer name.' });
  validate(path.buyer, (context) =>
    context.value() && !nonblank(context)
      ? { kind: 'required', message: 'Enter a buyer name.' }
      : undefined,
  );
  required(path.reason, { message: 'Enter a dispute reason.' });
  validate(path.reason, (context) =>
    context.value() && !nonblank(context)
      ? { kind: 'required', message: 'Enter a dispute reason.' }
      : undefined,
  );
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
