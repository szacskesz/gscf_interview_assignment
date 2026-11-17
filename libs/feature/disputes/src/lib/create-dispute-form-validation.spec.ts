import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { requiredNonEmpty } from '@gscf/core';
import { describe, expect, it } from 'vitest';
import {
  disputeSchema,
  validateAmount,
  visibleError,
  type DisputeDraft,
} from './create-dispute-form';

function createForm(overrides: Partial<DisputeDraft> = {}) {
  const $draft = signal<DisputeDraft>({
    buyer: 'Buyer',
    reason: 'Invoice issue',
    amount: { raw: '12.30', badInput: false },
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
    const $form = createForm({ buyer: '  ', reason: '\t', currency: '' });
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
    { raw: '', badInput: false, message: 'Enter a dispute amount.' },
    { raw: '-12.345', badInput: false, message: 'Enter an amount greater than 0.' },
    { raw: '0.000', badInput: false, message: 'Enter an amount greater than 0.' },
    { raw: '1.230', badInput: false, message: 'Enter an amount with up to 2 decimals.' },
    { raw: '12.30', badInput: true, message: 'Enter a valid dispute amount.' },
  ])(
    'reports only $message for amount $raw with badInput=$badInput',
    ({ raw, badInput, message }) => {
      const $form = createForm({ amount: { raw, badInput } });
      expect($form.amount().errors()).toMatchObject([{ message }]);
      expect($form.amount().value()).toEqual({ raw, badInput });
    },
  );

  it('clears the precision error when the user removes the extra decimal digit', () => {
    const $form = createForm({ amount: { raw: '1.230', badInput: false } });
    expect($form.amount().errors()).toMatchObject([{ kind: 'precision' }]);

    $form.amount().value.set({ raw: '1.23', badInput: false });
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
