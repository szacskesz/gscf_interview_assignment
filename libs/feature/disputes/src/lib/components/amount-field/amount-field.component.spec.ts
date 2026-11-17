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
  it('ignores comma keystrokes and insertions without changing the current draft', async () => {
    const { field, input } = await createAmountField();
    input.value = '22';
    input.dispatchEvent(new InputEvent('input', { data: '22', inputType: 'insertText' }));

    const commaKey = new KeyboardEvent('keydown', { key: ',', cancelable: true });
    const commaInput = new InputEvent('beforeinput', { data: ',', cancelable: true });
    expect(input.dispatchEvent(commaKey)).toBe(false);
    expect(input.dispatchEvent(commaInput)).toBe(false);
    expect(input.value).toBe('22');
    expect(field.value()).toEqual({ raw: '22', badInput: false });

    input.value = '22.40';
    input.dispatchEvent(new InputEvent('input', { data: '.', inputType: 'insertText' }));
    expect(field.value()).toEqual({ raw: '22.40', badInput: false });
    expect(input.value).toBe('22.40');
  });

  it('blocks comma-decimal paste without changing the existing draft', async () => {
    const { field, input } = await createAmountField();
    input.value = '5';
    input.dispatchEvent(new InputEvent('input', { data: '5', inputType: 'insertText' }));
    const paste = Object.assign(new Event('paste', { cancelable: true }), {
      clipboardData: { getData: () => '22,45' },
    });

    expect(input.dispatchEvent(paste)).toBe(false);
    expect(input.value).toBe('5');
    expect(field.value()).toEqual({ raw: '5', badInput: false });
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
