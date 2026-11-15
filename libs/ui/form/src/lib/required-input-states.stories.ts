import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { FieldFrame } from './field-frame';
import { TextInput } from './text-input';

const meta = {
  title: 'Form/Required input states',
  decorators: [moduleMetadata({ imports: [FieldFrame, TextInput] })],
} satisfies Meta;
export default meta;

interface ReasonState {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly value?: string;
  readonly error?: string;
  readonly previewClass?: string;
}

const requiredReason = 'Enter a dispute reason.';
const reasonStates: readonly ReasonState[] = [
  { id: 'default', title: 'Default', description: 'Empty field before interaction.' },
  {
    id: 'hover',
    title: 'Hover',
    description: 'The border darkens when the pointer is over the input.',
    previewClass: 'border-control-hover!',
  },
  {
    id: 'focused',
    title: 'Focused',
    description: 'Focus is visible while the placeholder remains.',
    previewClass: 'outline-2 outline-primary',
  },
  {
    id: 'typing',
    title: 'Focused, typing',
    description: 'The typed value is visible inside the focus outline.',
    value: 'Incorrect unit price',
    previewClass: 'outline-2 outline-primary',
  },
  {
    id: 'filled',
    title: 'Filled',
    description: 'The value remains after focus moves away.',
    value: 'Incorrect unit price on invoice INV-20431',
  },
  {
    id: 'empty-error',
    title: 'Error, empty',
    description: 'Submitting an empty required field shows its error.',
    error: requiredReason,
  },
  {
    id: 'focused-error',
    title: 'Error, focused',
    description: 'The error border and focus outline are visible together.',
    error: requiredReason,
    previewClass: 'outline-2 outline-primary',
  },
];

const amountStates = [
  { id: 'zero', value: '0', error: 'Enter an amount greater than 0.' },
  { id: 'precision', value: '12.345', error: 'Enter an amount with up to 2 decimals.' },
];

export const Figure20: StoryObj = {
  name: 'Figure 2.0',
  render: () => ({
    props: { reasonStates, amountStates },
    template: `
      <div class="mx-auto max-w-5xl rounded-lg border border-control bg-surface p-4 sm:p-6">
        <h2 class="text-xl font-semibold text-brand">Required text and number input</h2>
        <p class="mt-2 text-sm">Hover and focus styles are shown together for comparison.</p>

        @for (state of reasonStates; track state.id) {
          <section
            [attr.aria-labelledby]="'state-' + state.id"
            class="mt-4 grid gap-3 border-t border-divider pt-4 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] md:items-center"
          >
            <h3 [id]="'state-' + state.id" class="text-sm font-semibold">{{ state.title }}</h3>
            <gscf-field-frame label="Dispute Reason" [controlId]="state.id" [required]="true" [error]="state.error ?? null">
              <input
                gscfTextInput [id]="state.id" [class]="state.previewClass ?? ''"
                [value]="state.value ?? ''" placeholder="Add a reason" required
                [attr.aria-invalid]="state.error ? 'true' : null"
                [attr.aria-describedby]="state.error ? state.id + '-error' : null"
              />
            </gscf-field-frame>
            <p class="text-sm">{{ state.description }}</p>
          </section>
        }

        <section
          aria-labelledby="state-invalid-amount"
          class="mt-4 grid gap-3 border-t border-divider pt-4 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] md:items-center"
        >
          <h3 id="state-invalid-amount" class="text-sm font-semibold">Error, invalid value</h3>
          <div class="space-y-3">
            @for (state of amountStates; track state.id) {
              <gscf-field-frame label="Dispute Amount" [controlId]="state.id" [required]="true" [error]="state.error">
                <input
                  gscfTextInput [id]="state.id" type="number" step="0.01" inputmode="decimal" lang="en-US"
                  [value]="state.value" required aria-invalid="true" [attr.aria-describedby]="state.id + '-error'"
                />
              </gscf-field-frame>
            }
          </div>
          <p class="text-sm">The invalid value stays visible without rounding. The greater-than-zero error takes precedence.</p>
        </section>
      </div>
    `,
  }),
  async play({ canvas, userEvent }) {
    const reason = (state: string) =>
      within(canvas.getByRole('region', { name: state })).getByRole('textbox', {
        name: 'Dispute Reason',
      });

    const initial = reason('Default');
    await expect(initial).toBeRequired();
    await expect(initial).toHaveAttribute('placeholder', 'Add a reason');
    await expect(initial).toHaveStyle({ borderColor: 'rgb(124, 124, 124)' });
    await expect(reason('Hover')).toHaveStyle({ borderColor: 'rgb(14, 39, 67)' });
    await expect(reason('Focused')).toHaveStyle({
      outlineColor: 'rgb(0, 85, 164)',
      outlineWidth: '2px',
    });
    await expect(reason('Focused, typing')).toHaveValue('Incorrect unit price');
    await expect(reason('Filled')).toHaveValue('Incorrect unit price on invoice INV-20431');
    await expect(reason('Error, empty')).toHaveAccessibleDescription(requiredReason);
    const focusedError = reason('Error, focused');
    await expect(focusedError).toHaveAccessibleDescription(requiredReason);
    await expect(focusedError).toHaveStyle({
      borderColor: 'rgb(185, 28, 28)',
      outlineColor: 'rgb(0, 85, 164)',
    });

    const amounts = within(canvas.getByRole('region', { name: 'Error, invalid value' }));
    for (const { value, error } of amountStates) {
      const amount = amounts.getByRole('spinbutton', {
        name: 'Dispute Amount',
        description: error,
      });
      await expect(amount).toHaveValue(Number(value));
      await expect(amount).toHaveAttribute('aria-invalid', 'true');
    }

    await userEvent.click(initial);
    await expect(initial).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', { name: 'Required text and number input' }));
    await expect(initial).not.toHaveFocus();
  },
};
