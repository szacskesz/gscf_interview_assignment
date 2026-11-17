import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Button } from './button.directive';

@Component({
  imports: [Button],
  template: `
    <button type="button" gscfButton="secondary" (click)="$active.set(true)">Activate</button>
    @if ($active()) {
      <p role="status">Activated</p>
    }
  `,
})
class ButtonHost {
  protected readonly $active = signal(false);
}

it('preserves the native keyboard activation and keeps focus', async () => {
  const fixture = TestBed.createComponent(ButtonHost);
  await fixture.whenStable();
  const button = page.getByRole('button', { name: 'Activate' });

  await userEvent.tab();
  await expect.element(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect.element(page.getByRole('status')).toHaveTextContent('Activated');
  await expect.element(button).toHaveFocus();
});
