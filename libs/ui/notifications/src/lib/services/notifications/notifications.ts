import { Service, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessNotification } from '../../components/success-notification/success-notification';

@Service()
export class Notifications {
  private readonly snackBar = inject(MatSnackBar);

  success(title: string, message: string): void {
    this.snackBar.openFromComponent(SuccessNotification, {
      data: { title, message },
      duration: 5_000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: 'gscf-success-toast',
      announcementMessage: `${title}. ${message}`,
      politeness: 'polite',
    });
  }
}
