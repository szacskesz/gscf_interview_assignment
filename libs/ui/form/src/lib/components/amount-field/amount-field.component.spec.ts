import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AmountField } from './amount-field.component';

async function createAmountField() {
  const fixture = TestBed.createComponent(AmountField);
  fixture.componentRef.setInput('controlId', 'amount');
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  return { fixture, field: fixture.componentInstance, input: element.querySelector('input')! };
}

describe('Amount field', () => {
  it('lets the caller set the placeholder and required state', async () => {
    const { fixture, input } = await createAmountField();
    expect(input.required).toBe(false);

    fixture.componentRef.setInput('placeholder', 'Enter an amount');
    fixture.componentRef.setInput('inputRequired', true);
    await fixture.whenStable();

    expect(input.placeholder).toBe('Enter an amount');
    expect(input.required).toBe(true);
  });

  it('emits a numeric value while retaining the browser input text', async () => {
    const { fixture, field, input } = await createAmountField();
    input.value = '22.40';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await fixture.whenStable();

    expect(field.value()).toBe(22.4);
    expect(input.value).toBe('22.40');

    input.value = '';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await fixture.whenStable();
    expect(field.value()).toBeNull();
  });

  it('reflects a numeric value supplied by the parent and clears it on reset', async () => {
    const { fixture, input } = await createAmountField();
    fixture.componentRef.setInput('value', 12.34);
    await fixture.whenStable();
    expect(input.valueAsNumber).toBe(12.34);

    fixture.componentRef.setInput('value', null);
    await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('leaves comma key, input, and paste events to the browser', async () => {
    const { input } = await createAmountField();
    const events = [
      new KeyboardEvent('keydown', { key: ',', cancelable: true }),
      new InputEvent('beforeinput', { data: ',', cancelable: true }),
      new Event('paste', { cancelable: true }),
    ];
    for (const event of events) {
      expect(input.dispatchEvent(event)).toBe(true);
    }
  });

  it('forwards focus, emits touch on blur, and reflects error and lock inputs on the control', async () => {
    const { fixture, field, input } = await createAmountField();
    const touched = vi.fn();
    field.touch.subscribe(touched);
    fixture.componentRef.setInput('showError', true);
    fixture.componentRef.setInput('locked', true);
    await fixture.whenStable();

    field.focus();
    expect(input.ownerDocument.activeElement).toBe(input);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('amount-error');
    input.blur();
    expect(touched).toHaveBeenCalledOnce();
  });
});
