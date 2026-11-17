import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';
import { requiredNonEmpty } from '@gscf/core';
import { describe, expect, it, vi } from 'vitest';
import {
  CreateDisputeForm,
  disputeSchema,
  visibleError,
  type DisputeFormValue,
} from './create-dispute-form.component';

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

describe('CreateDisputeForm submission', () => {
  it('submits validated values from an inline form without a dialog or store', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatIconRegistry, useClass: FakeMatIconRegistry }],
    });
    const fixture = TestBed.createComponent(InlineFormHost);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector<HTMLInputElement>('input[type="number"]')?.step).toBe('0.01');
    const submit = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(
      Array.from(element.querySelectorAll<HTMLInputElement>('input[type="radio"]')).every(
        (input) => !input.checked && input.required,
      ),
    ).toBe(true);

    submit.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.save).not.toHaveBeenCalled();
    expect(element.querySelector('#inline-dispute-buyer-error')?.textContent).toBe(
      'Enter a buyer name.',
    );

    for (const [field, value] of [
      ['buyer', '  Buyer  '],
      ['reason', '  Freight charge  '],
      ['amount', '12.300'],
    ]) {
      const input = element.querySelector<HTMLInputElement>(`#inline-dispute-${field}`)!;
      input.value = value;
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
    await fixture.whenStable();
    submit.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.save).not.toHaveBeenCalled();
    expect(element.ownerDocument.activeElement).toBe(
      element.querySelector<HTMLInputElement>('input[value="USD"]'),
    );
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
});

function createForm(overrides: Partial<DisputeFormValue> = {}) {
  const $draft = signal<DisputeFormValue>({
    buyer: 'Buyer',
    reason: 'Invoice issue',
    amount: 12.3,
    currency: 'USD',
    ...overrides,
  });
  return TestBed.runInInjectionContext(() => form($draft, disputeSchema));
}

describe('Dispute form schema', () => {
  it.each([null, undefined, '', ' \t\n'])('requires nonblank text for %j', (text) => {
    const $draft = signal<string | null | undefined>(text);
    const $form = TestBed.runInInjectionContext(() =>
      form($draft, (path) => requiredNonEmpty(path, 'Enter text.')),
    );
    const field = $form();
    expect(field.required()).toBe(true);
    expect(field.errors()).toMatchObject([{ kind: 'required', message: 'Enter text.' }]);
    expect(field.value()).toBe(text);

    field.value.set('  Buyer  ');
    expect(field.valid()).toBe(true);
  });

  it('rejects whitespace-only text and missing currency until each field is corrected', () => {
    const $form = createForm({ buyer: '  ', reason: '\t', currency: null });
    expect($form().invalid()).toBe(true);
    expect($form.buyer().errors()).toMatchObject([{ message: 'Enter a buyer name.' }]);
    expect($form.reason().errors()).toMatchObject([{ message: 'Enter a dispute reason.' }]);
    expect($form.currency().errors()).toMatchObject([{ message: 'Select a currency.' }]);

    $form.buyer().value.set('Buyer');
    expect($form.buyer().valid()).toBe(true);
    expect($form.reason().invalid()).toBe(true);
    $form.reason().value.set('Reason');
    $form.currency().value.set('EUR');
    expect($form().valid()).toBe(true);
  });

  it.each([
    { amount: null, message: 'Enter a dispute amount.' },
    { amount: -12.345, message: 'Enter an amount greater than 0.' },
    { amount: 0, message: 'Enter an amount greater than 0.' },
    { amount: 1.203, message: 'Enter an amount with up to 2 decimals.' },
    { amount: 0.001, message: 'Enter an amount with up to 2 decimals.' },
    { amount: Infinity, message: 'Enter a smaller dispute amount.' },
  ])('reports only $message for amount $amount', ({ amount, message }) => {
    const $form = createForm({ amount });
    expect($form.amount().errors()).toMatchObject([{ message }]);
  });

  it('clears the precision error when the amount fits in two decimal places', () => {
    const $form = createForm({ amount: 1.203 });
    expect($form.amount().errors()).toMatchObject([{ kind: 'precision' }]);

    $form.amount().value.set(1.23);
    expect($form.amount().valid()).toBe(true);
  });

  it('reveals an error after touch and clears it as soon as the field becomes valid', () => {
    const $form = createForm({ buyer: '', reason: '' });
    expect(visibleError($form.buyer())).toBeNull();
    $form.buyer().markAsTouched();
    $form.reason().markAsTouched();
    expect(visibleError($form.buyer())).toBe('Enter a buyer name.');

    $form.buyer().value.set('Buyer');
    expect(visibleError($form.buyer())).toBeNull();
    expect(visibleError($form.reason())).toBe('Enter a dispute reason.');
  });
});
