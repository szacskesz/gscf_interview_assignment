import { Component, inject } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, screen } from 'storybook/test';
import { Notifications } from '../../services/notifications/notifications.service';

@Component({
  selector: 'gscf-story-notification',
  template: '<button type="button" (click)="notify()">Show notification</button>',
})
class NotificationStory {
  private readonly notifications = inject(Notifications);

  protected notify(): void {
    this.notifications.success('Dispute created', 'Dispute 6229 has been created.');
  }
}

const meta = {
  title: 'Notifications/Success',
  component: NotificationStory,
} satisfies Meta<NotificationStory>;
export default meta;

export const Created: StoryObj<NotificationStory> = {
  async play({ canvas, userEvent }) {
    const button = canvas.getByRole('button', { name: 'Show notification' });
    await userEvent.click(button);
    await expect(await screen.findByText('Dispute 6229 has been created.')).toBeVisible();
    await expect(button).toHaveFocus();
  },
};
