import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';
import { expect, it, vi } from 'vitest';
import { CreateDisputeForm } from './create-dispute-form.component';

@Component({
  imports: [CreateDisputeForm],
  template: `
    <gscf-create-dispute-form formId="inline-dispute" (submitted)="save($event)" />
    <button type="submit" form="inline-dispute">Save</button>
  `,
})
class InlineFormHost {
  readonly save = vi.fn();
}

it('submits validated values from an inline form without a dialog or store', async () => {
  TestBed.configureTestingModule({
    providers: [{ provide: MatIconRegistry, useClass: FakeMatIconRegistry }],
  });
  const fixture = TestBed.createComponent(InlineFormHost);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  const submit = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  submit.click();
  await fixture.whenStable();
  expect(fixture.componentInstance.save).not.toHaveBeenCalled();
  expect(element.querySelector('#inline-dispute-buyer-error')?.textContent).toBe(
    'Enter a buyer name.',
  );

  for (const [field, value] of [
    ['buyer', '  Buyer  '],
    ['reason', '  Freight charge  '],
    ['amount', '12.30'],
  ]) {
    const input = element.querySelector<HTMLInputElement>(`#inline-dispute-${field}`)!;
    input.value = value;
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
  }
  element.querySelector<HTMLInputElement>('input[value="EUR"]')!.click();
  await fixture.whenStable();

  submit.click();
  await fixture.whenStable();
  expect(fixture.componentInstance.save).toHaveBeenCalledExactlyOnceWith({
    buyer: 'Buyer',
    reason: 'Freight charge',
    amount: 12.3,
    currency: 'EUR',
  });
});
