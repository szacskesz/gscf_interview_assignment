import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import type { Dispute } from '@gscf/disputes-data-access';
import { FieldFrame, RadioInput, TextInput } from '@gscf/ui-form';
import { AmountField } from './amount-field';
import { validateAmount } from './dispute-amount';
import { disputeSchema, visibleError, type DisputeDraft } from './dispute-form';

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
  readonly submitted = output<Pick<Dispute, 'buyer' | 'reason' | 'amount' | 'currency'>>();

  private readonly $draft = signal<DisputeDraft>({
    buyer: '',
    reason: '',
    amount: { raw: '', badInput: false },
    currency: '',
  });

  protected readonly $form = form(this.$draft, disputeSchema, {
    submission: {
      onInvalid: (field) => {
        const fields = [field.buyer, field.reason, field.amount, field.currency];
        fields
          .find((field) => field().invalid())?.()
          .focusBoundControl();
      },
      action: async () => {
        if (this.$busy()) return;
        const { buyer, reason, amount, currency } = this.$draft();
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
