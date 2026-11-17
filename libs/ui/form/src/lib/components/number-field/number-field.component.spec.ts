import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { NumberField } from './number-field.component';

async function createNumberField() {
  const fixture = TestBed.createComponent(NumberField);
  fixture.componentRef.setInput('controlId', 'amount');
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  return { fixture, field: fixture.componentInstance, input: element.querySelector('input')! };
}

describe('Number field', () => {
  it('allows arbitrary decimals by default and supports caller-defined increments', async () => {
    const { fixture, input } = await createNumberField();
    input.value = '1.234';
    expect(input.validity.stepMismatch).toBe(false);

    fixture.componentRef.setInput('step', 1);
    await fixture.whenStable();
    expect(input.validity.stepMismatch).toBe(true);
    input.value = '2';
    input.stepUp();
    expect(input.valueAsNumber).toBe(3);

    fixture.componentRef.setInput('step', 0.01);
    await fixture.whenStable();
    input.value = '1.23';
    input.stepUp();
    expect(input.valueAsNumber).toBe(1.24);
  });

  it('lets the caller set the placeholder and required state', async () => {
    const { fixture, input } = await createNumberField();
    expect(input.required).toBe(false);

    fixture.componentRef.setInput('placeholder', 'Enter an amount');
    fixture.componentRef.setInput('inputRequired', true);
    await fixture.whenStable();

    expect(input.placeholder).toBe('Enter an amount');
    expect(input.required).toBe(true);
  });

  it('emits a numeric value while retaining the browser input text', async () => {
    const { fixture, field, input } = await createNumberField();
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
    const { fixture, input } = await createNumberField();
    fixture.componentRef.setInput('value', 12.34);
    await fixture.whenStable();
    expect(input.valueAsNumber).toBe(12.34);

    fixture.componentRef.setInput('value', null);
    await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('leaves comma key, input, and paste events to the browser', async () => {
    const { input } = await createNumberField();
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
    const { fixture, field, input } = await createNumberField();
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
