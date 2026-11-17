import { Component, ElementRef, input, model, output, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { TextInput } from '../../directives/text-input/text-input.directive';

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
      [placeholder]="$placeholder()"
      [required]="$inputRequired()"
      (keydown)="ignoreComma($event, $event.key)"
      (beforeinput)="ignoreComma($event, $event.data)"
      (paste)="ignoreComma($event, $event.clipboardData?.getData('text/plain'))"
      (input)="update(control)"
      (blur)="touch.emit()"
    />
  `,
})
export class AmountField implements FormValueControl<AmountDraft> {
  /** Publishes the native input's serialized text and bad-input state as `value`. */
  readonly $value = model<AmountDraft>({ raw: '', badInput: false }, { alias: 'value' });

  /** Exposes the value model under the name required by Signal Forms. */
  get value() {
    return this.$value;
  }

  /** Required ID of the native input, used by its associated label. */
  readonly $controlId = input.required<string>({ alias: 'controlId' });

  /** Placeholder text shown by the native input. */
  readonly $placeholder = input('', { alias: 'placeholder' });

  /** Sets the native input's required state for accessibility and browser semantics. */
  readonly $inputRequired = input(false, { alias: 'inputRequired' });

  /** Marks the input invalid and links it to the message with ID `controlId + '-error'`. */
  readonly $showError = input(false, { alias: 'showError' });

  /** Keeps the native input focusable while preventing edits. */
  readonly $locked = input(false, { alias: 'locked' });

  /** Emits when the native input loses focus. */
  readonly touch = output<void>();
  private readonly $control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  focus(options?: FocusOptions): void {
    this.$control().nativeElement.focus(options);
  }

  protected ignoreComma(event: Event, text: string | null | undefined): void {
    if (text?.includes(',')) event.preventDefault();
  }

  protected update(control: HTMLInputElement): void {
    // Keep the native editing buffer intact when a partial decimal has no serialized value.
    this.$value.set({
      raw: control.value,
      badInput: control.validity.badInput,
    });
  }
}
