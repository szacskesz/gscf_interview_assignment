import { Dialog } from '@angular/cdk/dialog';
import { Component, ViewContainerRef, inject } from '@angular/core';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Button, Icon } from '@gscf/ui-common';
import { Notifications } from '@gscf/ui-notifications';
import { CreateDisputeDialog } from './create-dispute-dialog';
import { DisputesTable } from './disputes-table';

@Component({
  selector: 'gscf-disputes-overview',
  imports: [Button, DisputesTable, Icon],
  providers: [DisputesStore],
  templateUrl: './disputes-overview.html',
})
export class DisputesOverview {
  private readonly dialog = inject(Dialog);
  private readonly notifications = inject(Notifications);
  private readonly viewContainerRef = inject(ViewContainerRef);
  protected readonly store = inject(DisputesStore);

  protected createDispute(): void {
    if (this.store.$pending() || this.store.$readState() !== 'ready') return;
    this.dialog
      .open<Dispute>(CreateDisputeDialog, {
        width: '36rem',
        maxWidth: 'calc(100vw - 2rem)',
        ariaLabelledBy: 'create-dispute-title',
        ariaDescribedBy: 'create-dispute-description',
        backdropClass: 'gscf-dialog-backdrop',
        autoFocus: '#dispute-buyer',
        viewContainerRef: this.viewContainerRef,
      })
      .closed.subscribe((created) => {
        if (created) {
          this.notifications.success(
            'Dispute created',
            `Dispute ${created.number} has been created.`,
          );
        }
      });
  }
}
