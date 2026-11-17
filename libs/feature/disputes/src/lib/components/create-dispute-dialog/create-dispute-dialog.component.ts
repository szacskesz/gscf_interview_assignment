import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Button, DialogFrame } from '@gscf/ui-common';
import { CreateDisputeForm } from '../create-dispute-form/create-dispute-form.component';

@Component({
  selector: 'gscf-create-dispute-dialog',
  imports: [Button, CreateDisputeForm, DialogFrame],
  templateUrl: './create-dispute-dialog.component.html',
})
export class CreateDisputeDialog {
  private readonly dialog = inject<DialogRef<Dispute>>(DialogRef);
  private readonly store = inject(DisputesStore);

  protected readonly formId = 'dispute';
  protected readonly $busy = this.store.$pending;
  protected readonly $failure = signal<string | null>(null);

  protected async save(draft: Partial<Dispute>): Promise<void> {
    if (this.$busy()) return;

    this.$failure.set(null);
    this.dialog.disableClose = true;
    try {
      const result = await this.store.create(draft);
      if (result.ok) {
        this.dialog.close(result.value);
      } else {
        this.$failure.set(result.error.message);
      }
    } finally {
      this.dialog.disableClose = false;
    }
  }

  protected dismiss(): void {
    if (!this.$busy()) this.dialog.close();
  }
}
