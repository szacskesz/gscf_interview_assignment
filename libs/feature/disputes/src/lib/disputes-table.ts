import { Component, computed, input } from '@angular/core';
import { formatAmount, formatDisputeDate, type Dispute } from '@gscf/disputes-data-access';
import { Badge, Button, Icon } from '@gscf/ui-common';

@Component({
  selector: 'gscf-disputes-table',
  imports: [Badge, Button, Icon],
  templateUrl: './disputes-table.html',
})
export class DisputesTable {
  readonly $rows = input.required<readonly Dispute[]>({ alias: 'rows' });

  protected readonly $displayRows = computed(() =>
    this.$rows().map((row) => ({
      ...row,
      dateLabel: formatDisputeDate(row.disputeDate),
      amountLabel: formatAmount(row.amountMinorUnits),
    })),
  );
}
