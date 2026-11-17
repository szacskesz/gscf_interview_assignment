import { Component, effect, ElementRef, input, model, output, viewChild } from '@angular/core';
import { transformedValue, type FormValueControl } from '@angular/forms/signals';
import { TextInput } from '../../directives/text-input/text-input.directive';

@Component({
  selector: 'gscf-number-field',
  imports: [TextInput],
  template: `
    <input
      #control
      gscfTextInput
      type="number"
      [step]="$step()"
      inputmode="decimal"
      [id]="$controlId()"
      [readOnly]="$locked()"
      [attr.aria-describedby]="$showError() ? $controlId() + '-error' : null"
      [attr.aria-invalid]="$showError() || null"
      [placeholder]="$placeholder()"
      [required]="$inputRequired()"
      (input)="update(control)"
      (blur)="touch.emit()"
    />
  `,
})
export class NumberField implements FormValueControl<number | null> {
  /** Publishes the native input's numeric value, or null when empty, as `value`. */
  readonly $value = model<number | null>(null, { alias: 'value' });

  /** Exposes the value model under the name required by Signal Forms. */
  get value() {
    return this.$value;
  }

  /** Required ID of the native input, used by its associated label. */
  readonly $controlId = input.required<string>({ alias: 'controlId' });

  /** Native numeric step, or `any` for unrestricted decimal increments. Defaults to `any`. */
  readonly $step = input<number | 'any'>('any', { alias: 'step' });

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
  private readonly $control = viewChild<ElementRef<HTMLInputElement>>('control');
  private readonly $editedValue = transformedValue<number | null, number | null>(this.$value, {
    parse: (value) => (Number.isNaN(value) ? { error: { kind: 'parse' } } : { value }),
    format: (value) => value,
  });

  constructor() {
    effect(() => {
      const control = this.$control()?.nativeElement;
      const value = this.$editedValue();
      if (!control || Number.isNaN(value)) return;

      // Rewriting an equivalent number would move the caret and discard an unfinished decimal.
      if (value === null) {
        if (control.value !== '' || control.validity.badInput) control.value = '';
      } else if (control.valueAsNumber !== value) {
        control.value = String(value);
      }
    });
  }

  focus(options?: FocusOptions): void {
    this.$control()?.nativeElement.focus(options);
  }

  protected update(control: HTMLInputElement): void {
    const value = control.validity.badInput || control.value !== '' ? control.valueAsNumber : null;
    this.$editedValue.set(value);
  }
}
