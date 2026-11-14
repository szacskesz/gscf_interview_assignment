import { Directive, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text-danger' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary px-4 text-surface hover:bg-control-hover',
  secondary: 'border border-primary px-4 text-primary hover:bg-new',
  danger: 'bg-danger px-4 text-surface hover:bg-red-800',
  'text-danger': 'px-2 text-danger underline underline-offset-2 hover:bg-red-50',
  icon: 'min-w-11 text-muted hover:bg-disabled',
};

@Directive({
  selector: 'button[gscfButton]',
  host: {
    class:
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary enabled:cursor-pointer disabled:opacity-50',
    '[class]': '$variantClasses()',
  },
})
export class Button {
  /** Selects the treatment for a native button. Use icon for an accessible icon-only action. */
  readonly $variant = input<ButtonVariant>('primary', { alias: 'gscfButton' });

  protected readonly $variantClasses = computed(() => variantClasses[this.$variant() || 'primary']);
}
