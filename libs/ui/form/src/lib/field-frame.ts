import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from '@gscf/ui-common';

@Component({
  selector: 'gscf-field-frame',
  imports: [Icon, NgTemplateOutlet],
  host: { class: 'block text-sm' },
  template: `
    @if ($kind() === 'group') {
      <fieldset
        [disabled]="$disabled()"
        [attr.aria-describedby]="$error() ? $controlId() + '-error' : null"
      >
        <legend class="mb-1.5 font-semibold">
          {{ $label() }}
          @if ($required()) {
            <span class="text-danger" aria-hidden="true">*</span>
          }
        </legend>
        <ng-container [ngTemplateOutlet]="fieldContents" />
      </fieldset>
    } @else {
      <label [for]="$controlId()" class="mb-1.5 block font-semibold">
        {{ $label() }}
        @if ($required()) {
          <span class="text-danger" aria-hidden="true">*</span>
        }
      </label>
      <ng-container [ngTemplateOutlet]="fieldContents" />
    }

    <ng-template #fieldContents>
      <div class="relative">
        <ng-content />
        @if ($error() && $kind() === 'field') {
          <gscf-icon
            name="warning"
            class="pointer-events-none absolute top-3 text-danger"
            [class.inset-e-3]="!$numberInput()"
            [class.inset-e-8]="$numberInput()"
          />
        }
      </div>
      @if ($error()) {
        <p [id]="$controlId() + '-error'" class="mt-1 text-danger">{{ $error() }}</p>
      }
    </ng-template>
  `,
})
export class FieldFrame {
  /** Required label text for the field or group. */
  readonly $label = input.required<string>({ alias: 'label' });

  /** Required control identifier. Error descriptions use this identifier with an `-error` suffix. */
  readonly $controlId = input.required<string>({ alias: 'controlId' });

  /** Uses a fieldset and legend for a group of related controls. */
  readonly $kind = input<'field' | 'group'>('field', { alias: 'kind' });

  /** Displays the mandatory marker alongside the visible label. */
  readonly $required = input(false, { alias: 'required' });

  /** Displays the current error message below the controls. */
  readonly $error = input<string | null>(null, { alias: 'error' });

  /** Leaves space for the native number input's stepper next to its warning icon. */
  readonly $numberInput = input(false, { alias: 'numberInput' });

  /** Disables the projected controls when the frame is a fieldset. */
  readonly $disabled = input(false, { alias: 'disabled' });
}
