import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';
import { requiredNonEmpty } from '@gscf/core';
import type { Dispute } from '@gscf/disputes-data-access';
import { describe, expect, it, vi } from 'vitest';
import {
  CreateDisputeForm,
  disputeSchema,
  validateAmount,
  visibleError,
  type DisputeFormControls,
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
});

function createForm(overrides: Partial<Dispute & DisputeFormControls> = {}) {
  const $draft = signal<Partial<Dispute> & DisputeFormControls>({
    buyer: 'Buyer',
    reason: 'Invoice issue',
    amountInput: { raw: '12.30', badInput: false },
    currencyInput: 'USD',
    ...overrides,
  });
  return TestBed.runInInjectionContext(() => form($draft, disputeSchema));
}

describe('Dispute form schema', () => {
  it('accepts dispute properties alongside the controls without replacing their values', () => {
    const $form = createForm({ id: 123, amount: 10, currency: 'EUR' });
    $form.amountInput().value.set({ raw: '12.345', badInput: false });
    $form.currencyInput().value.set('USD');

    expect($form().value()).toMatchObject({ id: 123, amount: 10, currency: 'EUR' });
    expect($form.amountInput().errors()).toMatchObject([{ kind: 'precision' }]);
  });

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
    const $form = createForm({ buyer: '  ', reason: '\t', currencyInput: '' });
    expect($form().invalid()).toBe(true);
    expect($form.buyer!().errors()).toMatchObject([{ message: 'Enter a buyer name.' }]);
    expect($form.reason!().errors()).toMatchObject([{ message: 'Enter a dispute reason.' }]);
    expect($form.currencyInput().errors()).toMatchObject([{ message: 'Select a currency.' }]);

    $form.buyer!().value.set('Buyer');
    expect($form.buyer!().valid()).toBe(true);
    expect($form.reason!().invalid()).toBe(true);
    $form.reason!().value.set('Reason');
    $form.currencyInput().value.set('EUR');
    expect($form().valid()).toBe(true);
  });

  it.each([
    { raw: '', badInput: false, message: 'Enter a dispute amount.' },
    { raw: '-12.345', badInput: false, message: 'Enter an amount greater than 0.' },
    { raw: '0.000', badInput: false, message: 'Enter an amount greater than 0.' },
    { raw: '1.230', badInput: false, message: 'Enter an amount with up to 2 decimals.' },
    { raw: '12.30', badInput: true, message: 'Enter a valid dispute amount.' },
  ])(
    'reports only $message for amount $raw with badInput=$badInput',
    ({ raw, badInput, message }) => {
      const $form = createForm({ amountInput: { raw, badInput } });
      expect($form.amountInput().errors()).toMatchObject([{ message }]);
      expect($form.amountInput().value()).toEqual({ raw, badInput });
    },
  );

  it('clears the precision error when the user removes the extra decimal digit', () => {
    const $form = createForm({ amountInput: { raw: '1.230', badInput: false } });
    expect($form.amountInput().errors()).toMatchObject([{ kind: 'precision' }]);

    $form.amountInput().value.set({ raw: '1.23', badInput: false });
    expect($form.amountInput().valid()).toBe(true);
  });

  it('reveals an error after touch and clears it as soon as the field becomes valid', () => {
    const $form = createForm({ buyer: '', reason: '' });
    expect(visibleError($form.buyer!())).toBeNull();
    $form.buyer!().markAsTouched();
    $form.reason!().markAsTouched();
    expect(visibleError($form.buyer!())).toBe('Enter a buyer name.');

    $form.buyer!().value.set('Buyer');
    expect(visibleError($form.buyer!())).toBeNull();
    expect(visibleError($form.reason!())).toBe('Enter a dispute reason.');
  });
});

describe('Dispute amount', () => {
  it.each([
    ['', 'required'],
    ['1e3', 'invalid'],
    ['1,250.00', 'invalid'],
    ['-12.345', 'nonpositive'],
    ['0.000', 'nonpositive'],
    ['1.230', 'precision'],
    ['9'.repeat(309), 'range'],
  ])('rejects %j as %s', (input, error) => {
    expect(validateAmount(input)).toEqual({ valid: false, error });
  });

  it.each([
    ['1250', 1250],
    ['1250.5', 1250.5],
    ['.01', 0.01],
    ['100000000000000', 100_000_000_000_000],
  ])('parses %j as the decimal amount %s', (input, amount) => {
    expect(validateAmount(input)).toEqual({ valid: true, amount });
  });
});
