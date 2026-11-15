import { Component, ElementRef, input, model, output, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { TextInput } from '@gscf/ui-form';

export interface AmountDraft {
  raw: string;
  badInput: boolean;
}

@Component({
  selector: 'gscf-amount-field',
  imports: [TextInput],
  template: `
    <input
      #control
      gscfTextInput
      type="number"
      step="0.01"
      inputmode="decimal"
      lang="en-US"
      [id]="$controlId()"
      [readOnly]="$locked()"
      [attr.aria-describedby]="$showError() ? $controlId() + '-error' : null"
      [attr.aria-invalid]="$showError() || null"
      placeholder="Enter dispute amount"
      required
      (beforeinput)="checkSeparator($event)"
      (paste)="checkPastedSeparator($event)"
      (input)="update(control, $event)"
      (blur)="touch.emit()"
    />
  `,
})
export class AmountField implements FormValueControl<AmountDraft> {
  readonly $value = model<AmountDraft>({ raw: '', badInput: false }, { alias: 'value' });
  get value() {
    return this.$value;
  }
  readonly $controlId = input.required<string>({ alias: 'controlId' });
  readonly $showError = input(false, { alias: 'showError' });
  readonly $locked = input(false, { alias: 'locked' });
  readonly touch = output<void>();
  private readonly $control = viewChild.required<ElementRef<HTMLInputElement>>('control');
  private rejectedSeparator = false;

  focus(options?: FocusOptions): void {
    this.$control().nativeElement.focus(options);
  }

  protected checkSeparator(event: InputEvent): void {
    this.rejectComma(event, event.data);
  }

  protected checkPastedSeparator(event: ClipboardEvent): void {
    this.rejectComma(event, event.clipboardData?.getData('text/plain'));
  }

  protected update(control: HTMLInputElement, event: Event): void {
    if (
      event instanceof InputEvent &&
      (event.data?.includes('.') ||
        event.inputType.startsWith('delete') ||
        event.inputType === 'insertFromPaste')
    ) {
      this.rejectedSeparator = false;
    }

    // Keep the native editing buffer intact when a partial decimal has no serialized value.
    this.$value.set({
      raw: control.value,
      badInput: control.validity.badInput || this.rejectedSeparator,
    });
  }

  private rejectComma(event: Event, text: string | null | undefined): void {
    if (!text?.includes(',')) return;

    event.preventDefault();
    this.rejectedSeparator = true;
    this.$value.update((value) => ({ ...value, badInput: true }));
  }
}
