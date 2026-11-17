import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
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
import { AmountField, FieldFrame, RadioInput, TextInput } from '@gscf/ui-form';

const amountDecimalPlaces = 2;

const amountErrors = {
  required: 'Enter a dispute amount.',
  invalid: 'Enter a valid dispute amount.',
  nonpositive: 'Enter an amount greater than 0.',
  precision: `Enter an amount with up to ${amountDecimalPlaces} decimals.`,
  range: 'Enter a smaller dispute amount.',
} as const;

export interface DisputeFormValue {
  buyer: string;
  reason: string;
  amount: number | null;
  currency: Currency | null;
}

export const disputeSchema = schema<DisputeFormValue>((path) => {
  requiredNonEmpty(path.buyer, 'Enter a buyer name.');
  requiredNonEmpty(path.reason, 'Enter a dispute reason.');
  required(path.amount, { message: amountErrors.required });
  validate(path.amount, ({ value }) => {
    const amount = value();
    if (amount === null || Number.isNaN(amount)) return undefined;
    if (amount <= 0) return { kind: 'nonpositive', message: amountErrors.nonpositive };
    if (!Number.isFinite(amount)) return { kind: 'range', message: amountErrors.range };
    if (!hasAtMostDecimalPlaces(amount, amountDecimalPlaces)) {
      return { kind: 'precision', message: amountErrors.precision };
    }
    return undefined;
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
  templateUrl: './create-dispute-form.component.html',
})
export class CreateDisputeForm {
  /** Unique ID for the native form, its controls, and any external submit button. */
  readonly $formId = input.required<string>({ alias: 'formId' });
  /** Locks form editing and submission while the host saves the dispute. */
  readonly $busy = input(false, { alias: 'busy' });
  /** Emits validated values with the amount as a decimal number. */
  readonly submitted = output<Partial<Dispute>>();

  private readonly $formValue = signal<DisputeFormValue>({
    buyer: '',
    reason: '',
    amount: null,
    currency: null,
  });

  private readonly $currencyControl =
    viewChild.required<ElementRef<HTMLInputElement>>('currencyControl');

  protected readonly $form = form(this.$formValue, disputeSchema, {
    submission: {
      onInvalid: (field) => {
        const fields = [field.buyer, field.reason, field.amount, field.currency];
        const invalidField = fields.find((field) => field().invalid());
        if (invalidField === field.currency) {
          this.$currencyControl().nativeElement.focus();
        } else {
          invalidField?.().focusBoundControl();
        }
      },
      action: async () => {
        if (this.$busy()) return;
        const { buyer, reason, amount, currency } = this.$formValue();
        if (amount === null || (currency !== 'USD' && currency !== 'EUR')) return;

        this.submitted.emit({
          buyer: buyer.trim(),
          reason: reason.trim(),
          amount,
          currency,
        });
      },
    },
  });

  protected readonly $buyerError = computed(() => visibleError(this.$form.buyer()));
  protected readonly $reasonError = computed(() => visibleError(this.$form.reason()));
  protected readonly $amountError = computed(() => {
    const amount = this.$form.amount();
    if (amount.touched() && amount.errors().some((error) => error.kind === 'parse')) {
      return amountErrors.invalid;
    }
    return visibleError(amount);
  });
  protected readonly $currencyError = computed(() => visibleError(this.$form.currency()));
}
