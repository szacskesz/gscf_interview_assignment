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
      [id]="$controlId()"
      [value]="$value().raw"
      [readOnly]="$locked()"
      [attr.aria-describedby]="$showError() ? $controlId() + '-error' : null"
      [attr.aria-invalid]="$showError() || null"
      [class.pe-14]="$showError()"
      placeholder="Enter dispute amount"
      required
      (input)="update(control)"
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

  focus(options?: FocusOptions): void {
    this.$control().nativeElement.focus(options);
  }

  protected update(control: HTMLInputElement): void {
    this.$value.set({ raw: control.value, badInput: control.validity.badInput });
  }
}
