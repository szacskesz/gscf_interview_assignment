import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from '@gscf/ui-common';

@Component({
  selector: 'gscf-field-frame',
  imports: [Icon, NgTemplateOutlet],
  host: { class: 'block text-sm' },
  template: `
    @if ($kind() === 'group') {
      <fieldset [attr.aria-describedby]="$error() ? $controlId() + '-error' : null">
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
      <ng-content />
      @if ($error()) {
        <p [id]="$controlId() + '-error'" class="mt-1 flex items-start gap-1 text-danger">
          <gscf-icon name="warning" />
          <span>{{ $error() }}</span>
        </p>
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
}
