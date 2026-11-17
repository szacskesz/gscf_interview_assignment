import { Directive, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text-danger' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary px-4 text-surface enabled:hover:underline',
  secondary: 'border border-primary px-4 text-primary enabled:hover:underline',
  danger: 'bg-danger px-4 text-surface enabled:hover:underline',
  'text-danger': 'px-2 text-danger underline underline-offset-2 enabled:hover:decoration-2',
  icon: 'min-w-11 text-muted',
};

@Directive({
  selector: 'button[gscfButton]',
  host: {
    class:
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary enabled:cursor-pointer disabled:bg-disabled disabled:text-muted',
    '[class]': '$variantClasses()',
  },
})
export class Button {
  /** Selects the treatment for a native button. Use icon for an accessible icon-only action. */
  readonly $variant = input<ButtonVariant>('primary', { alias: 'gscfButton' });

  protected readonly $variantClasses = computed(() => variantClasses[this.$variant() || 'primary']);
}
