import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { formatAmount, validateAmount } from '@gscf/disputes-data-access';
import { TextInput } from '@gscf/ui-form';

export interface AmountDraft {
  raw: string;
  badInput: boolean;
}

@Component({
  selector: 'gscf-amount-field',
  imports: [TextInput],
  host: { class: 'relative block' },
  template: `
    <input
      #control
      gscfTextInput
      type="text"
      role="spinbutton"
      inputmode="decimal"
      class="min-h-12! pe-9! aria-invalid:pe-16!"
      [id]="$controlId()"
      [value]="$value().raw"
      [readOnly]="$locked()"
      [attr.aria-valuenow]="$stepValue()"
      [attr.aria-describedby]="$showError() ? $controlId() + '-error' : null"
      [attr.aria-invalid]="$showError() || null"
      placeholder="Enter dispute amount"
      required
      (beforeinput)="checkSeparator(control, $event)"
      (paste)="checkPastedSeparator($event)"
      (input)="update(control, $event)"
      (keydown)="stepWithKey($event)"
      (blur)="touch.emit()"
    />
    <div
      class="absolute top-1/2 flex -translate-y-1/2 flex-col"
      [class.inset-e-2]="!$showError()"
      [class.inset-e-9]="$showError()"
    >
      <button
        type="button"
        class="size-6 rounded text-muted enabled:hover:bg-disabled disabled:text-disabled-ink"
        tabindex="-1"
        aria-label="Increase dispute amount"
        [disabled]="$locked()"
        (mousedown)="$event.preventDefault()"
        (click)="stepWithButton(1)"
      >
        <span aria-hidden="true">▴</span>
      </button>
      <button
        type="button"
        class="size-6 rounded text-muted enabled:hover:bg-disabled disabled:text-disabled-ink"
        tabindex="-1"
        aria-label="Decrease dispute amount"
        [disabled]="$locked()"
        (mousedown)="$event.preventDefault()"
        (click)="stepWithButton(-1)"
      >
        <span aria-hidden="true">▾</span>
      </button>
    </div>
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
  private readonly $minorUnits = computed(() => {
    const { raw, badInput } = this.$value();
    if (badInput || raw === '') return null;

    const negative = raw.startsWith('-');
    const result = validateAmount(negative ? raw.slice(1) : raw);
    if (result.valid) return negative ? -result.minorUnits : result.minorUnits;
    return /^-?(?:0+(?:\.0{0,2})?|\.0{1,2})$/.test(raw) ? 0 : null;
  });
  protected readonly $stepValue = computed(() => {
    const minorUnits = this.$minorUnits();
    return minorUnits === null ? null : this.formatStep(minorUnits);
  });

  focus(options?: FocusOptions): void {
    this.$control().nativeElement.focus(options);
  }

  protected checkSeparator(control: HTMLInputElement, event: InputEvent): void {
    if (event.data?.includes(',')) {
      this.rejectComma(event);
    } else if (control.selectionStart === 0 && control.selectionEnd === control.value.length) {
      this.$value.update((value) => (value.badInput ? { ...value, badInput: false } : value));
    }
  }

  protected checkPastedSeparator(event: ClipboardEvent): void {
    if (event.clipboardData?.getData('text/plain').includes(',')) this.rejectComma(event);
  }

  protected update(control: HTMLInputElement, event: Event): void {
    const correctsSeparator =
      event instanceof InputEvent &&
      (event.data?.includes('.') ||
        event.inputType.startsWith('delete') ||
        event.inputType === 'insertFromPaste');
    const raw = control.value.replaceAll(',', '');
    const containedComma = raw !== control.value;
    if (containedComma) control.value = raw;
    this.$value.set({
      raw,
      badInput: containedComma || (raw !== '' && !correctsSeparator && this.$value().badInput),
    });
  }

  protected stepWithKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    event.preventDefault();
    this.step(event.key === 'ArrowUp' ? 1 : -1);
  }

  protected stepWithButton(direction: 1 | -1): void {
    this.focus();
    this.step(direction);
  }

  private step(direction: 1 | -1): void {
    if (this.$locked()) return;
    const { raw, badInput } = this.$value();
    const current = this.$minorUnits();
    if (badInput || (raw !== '' && current === null)) return;

    const next = (current ?? 0) + direction;
    if (Number.isSafeInteger(next))
      this.$value.set({ raw: this.formatStep(next), badInput: false });
  }

  private formatStep(minorUnits: number): string {
    return `${minorUnits < 0 ? '-' : ''}${formatAmount(Math.abs(minorUnits)).replaceAll(',', '')}`;
  }

  private rejectComma(event: Event): void {
    event.preventDefault();
    this.$value.update((value) => ({ ...value, badInput: true }));
  }
}
