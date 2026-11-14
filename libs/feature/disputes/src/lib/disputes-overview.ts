import { Component, inject } from '@angular/core';
import { DisputesStore } from '@gscf/disputes-data-access';
import { Button, Icon } from '@gscf/ui-common';
import { DisputesTable } from './disputes-table';

@Component({
  selector: 'gscf-disputes-overview',
  imports: [Button, DisputesTable, Icon],
  providers: [DisputesStore],
  templateUrl: './disputes-overview.html',
})
export class DisputesOverview {
  protected readonly store = inject(DisputesStore);
}
