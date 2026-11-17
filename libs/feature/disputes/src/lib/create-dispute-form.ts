import { Component, computed, input, output, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  required,
  schema,
  validate,
  type FieldState,
} from '@angular/forms/signals';
import { hasAtMostDecimalPlaces, requiredNonEmpty } from '@gscf/core';
import type { Currency, Dispute } from '@gscf/disputes-data-access';
import { FieldFrame, RadioInput, TextInput } from '@gscf/ui-form';
import { AmountField, type AmountDraft } from './amount-field';

const amountDecimalPlaces = 2;

const amountErrors = {
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

export function initialDisputeFormValue(): Pick<Dispute, 'buyer' | 'reason'> & {
  amount: AmountDraft;
  currency: Currency | '';
} {
  return {
    buyer: '',
    reason: '',
    amount: { raw: '', badInput: false },
    currency: '',
  };
}

export const disputeSchema = schema<ReturnType<typeof initialDisputeFormValue>>((path) => {
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

@Component({
  selector: 'gscf-create-dispute-form',
  imports: [AmountField, FieldFrame, FormField, FormRoot, RadioInput, TextInput],
  templateUrl: './create-dispute-form.html',
})
export class CreateDisputeForm {
  /** Unique ID for the native form, its controls, and any external submit button. */
  readonly $formId = input.required<string>({ alias: 'formId' });
  /** Locks form editing and submission while the host saves the dispute. */
  readonly $busy = input(false, { alias: 'busy' });
  /** Emits validated values with the amount as a decimal number. */
  readonly submitted = output<Partial<Dispute>>();

  private readonly $formValue = signal(initialDisputeFormValue());

  protected readonly $form = form(this.$formValue, disputeSchema, {
    submission: {
      onInvalid: (field) => {
        const fields = [field.buyer, field.reason, field.amount, field.currency];
        fields
          .find((field) => field().invalid())?.()
          .focusBoundControl();
      },
      action: async () => {
        if (this.$busy()) return;
        const { buyer, reason, amount, currency } = this.$formValue();
        if (currency !== 'USD' && currency !== 'EUR') return;

        const parsedAmount = validateAmount(amount.raw);
        if (amount.badInput || !parsedAmount.valid) return;

        this.submitted.emit({
          buyer: buyer.trim(),
          reason: reason.trim(),
          amount: parsedAmount.amount,
          currency,
        });
      },
    },
  });

  protected readonly $buyerError = computed(() => visibleError(this.$form.buyer()));
  protected readonly $reasonError = computed(() => visibleError(this.$form.reason()));
  protected readonly $amountError = computed(() => visibleError(this.$form.amount()));
  protected readonly $currencyError = computed(() => visibleError(this.$form.currency()));
}
