import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Icon } from '../icon/icon.component';

interface NotificationData {
  title: string;
  message: string;
}

@Component({
  selector: 'gscf-success-notification',
  imports: [Icon],
  template: `
    <div class="flex justify-between gap-3">
      <div class="wrap-anywhere">
        <p class="font-semibold">{{ data.title }}</p>
        <p>{{ data.message }}</p>
      </div>
      <gscf-icon class="mt-0.5 text-success" name="check" />
    </div>
  `,
})
export class SuccessNotification {
  protected readonly data: NotificationData = inject(MAT_SNACK_BAR_DATA);
}
