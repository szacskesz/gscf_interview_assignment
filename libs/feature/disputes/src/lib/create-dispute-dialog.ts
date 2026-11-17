import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Button, DialogFrame } from '@gscf/ui-common';
import { FieldFrame, RadioInput, TextInput } from '@gscf/ui-form';
import { AmountField } from './amount-field';
import { validateAmount } from './dispute-amount';
import { disputeSchema, visibleError, type DisputeDraft } from './dispute-form';

@Component({
  selector: 'gscf-create-dispute-dialog',
  imports: [
    AmountField,
    Button,
    DialogFrame,
    FieldFrame,
    FormField,
    FormRoot,
    RadioInput,
    TextInput,
  ],
  templateUrl: './create-dispute-dialog.html',
})
export class CreateDisputeDialog {
  private readonly dialog = inject<DialogRef<Dispute>>(DialogRef);
  private readonly store = inject(DisputesStore);
  private readonly $draft = signal<DisputeDraft>({
    buyer: '',
    reason: '',
    amount: { raw: '', badInput: false },
    currency: '',
  });

  protected readonly $busy = this.store.$pending;
  protected readonly $failure = signal<string | null>(null);
  protected readonly $form = form(this.$draft, disputeSchema, {
    submission: {
      onInvalid: (field) => {
        const fields = [field.buyer, field.reason, field.amount, field.currency];
        fields
          .find((field) => field().invalid())?.()
          .focusBoundControl();
      },
      action: async () => {
        if (this.$busy()) return undefined;
        const { buyer, reason, amount, currency } = this.$draft();
        if (currency !== 'USD' && currency !== 'EUR') return undefined;

        const parsedAmount = validateAmount(amount.raw);
        if (amount.badInput || !parsedAmount.valid) return undefined;

        this.$failure.set(null);
        this.dialog.disableClose = true;
        try {
          const result = await this.store.create({
            buyer: buyer.trim(),
            reason: reason.trim(),
            amount: parsedAmount.amount,
            currency,
          });
          if (result.ok) {
            this.dialog.close(result.value);
          } else {
            this.$failure.set(result.error.message);
          }
        } finally {
          this.dialog.disableClose = false;
        }
      },
    },
  });

  protected readonly $buyerError = computed(() => visibleError(this.$form.buyer()));
  protected readonly $reasonError = computed(() => visibleError(this.$form.reason()));
  protected readonly $amountError = computed(() => visibleError(this.$form.amount()));
  protected readonly $currencyError = computed(() => visibleError(this.$form.currency()));

  protected dismiss(): void {
    if (!this.$busy()) this.dialog.close();
  }
}
