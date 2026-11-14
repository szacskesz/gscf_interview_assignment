import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Icon } from '@gscf/ui-common';

interface NotificationData {
  title: string;
  message: string;
}

@Component({
  selector: 'gscf-success-notification',
  imports: [Icon],
  template: `
    <div class="flex gap-3">
      <gscf-icon class="mt-0.5 text-success" name="check" />
      <div>
        <p class="font-semibold">{{ data.title }}</p>
        <p>{{ data.message }}</p>
      </div>
    </div>
  `,
})
export class SuccessNotification {
  protected readonly data: NotificationData = inject(MAT_SNACK_BAR_DATA);
}
