import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, waitFor, within } from 'storybook/test';
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
    previewClass: 'input-hover',
  },
  {
    id: 'focused',
    title: 'Focused',
    description: 'Focus is visible while the placeholder remains.',
    previewClass: 'input-focus',
  },
  {
    id: 'typing',
    title: 'Focused, typing',
    description: 'The field retains its blue border and soft shadow while typing.',
    value: 'Incorrect unit price',
    previewClass: 'input-focus',
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
    description: 'A soft red shadow shows focus around the red error border.',
    error: requiredReason,
    previewClass: 'input-focus',
  },
];

const amountStates = [
  { id: 'zero', value: '0', error: 'Enter an amount greater than 0.' },
  { id: 'precision', value: '12.345', error: 'Enter an amount with up to 2 decimals.' },
];

const defaultBorder = 'rgb(124, 124, 124)';
const hoverBorder = 'rgb(14, 39, 67)';
const focusBorder = 'rgb(0, 85, 164)';
const errorColor = 'rgb(185, 28, 28)';
const textColor = 'rgb(41, 41, 41)';

async function expectFieldColors(input: HTMLInputElement, borderColor: string, focused = false) {
  await expect(input).toHaveStyle({
    borderColor,
    color: textColor,
    backgroundColor: 'rgb(255, 255, 255)',
  });

  const label = input.labels?.item(0);
  await expect(label).toHaveStyle({ color: textColor });
  await expect(label?.querySelector('[aria-hidden="true"]')).toHaveStyle({ color: errorColor });
  if (input.placeholder) {
    await expect(getComputedStyle(input, '::placeholder').color).toBe('rgb(101, 101, 101)');
  }

  const style = getComputedStyle(input);
  if (focused) {
    // Let the browser normalize the reference shadow to its computed CSS color format.
    const reference = input.ownerDocument.createElement('span');
    reference.style.boxShadow = `0 0 3px 1px color-mix(in srgb, ${borderColor} 50%, transparent)`;
    input.ownerDocument.body.append(reference);
    try {
      await expect(style.boxShadow).toBe(getComputedStyle(reference).boxShadow);
      await expect(style.outlineColor).toBe('rgba(0, 0, 0, 0)');
    } finally {
      reference.remove();
    }
  } else {
    await expect(style.boxShadow).toBe('none');
    await expect(style.outlineStyle).toBe('none');
  }

  if (input.getAttribute('aria-invalid') === 'true') {
    const error = input.ownerDocument.getElementById(`${input.id}-error`);
    await expect(error).toHaveStyle({ color: errorColor });
    await waitFor(async () => {
      const icon = input.closest('gscf-field-frame')?.querySelector('gscf-icon mat-icon svg');
      await expect(icon).toBeVisible();
      await expect(getComputedStyle(icon!).stroke).toBe(errorColor);
    });
  }
}

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
      }) as HTMLInputElement;

    const colorStates = [
      { name: 'Default', border: defaultBorder },
      { name: 'Hover', border: hoverBorder },
      { name: 'Focused', border: focusBorder, focused: true },
      { name: 'Focused, typing', border: focusBorder, focused: true },
      { name: 'Filled', border: defaultBorder },
      { name: 'Error, empty', border: errorColor },
      { name: 'Error, focused', border: errorColor, focused: true },
    ];
    for (const { name, border, focused } of colorStates) {
      await expectFieldColors(reason(name), border, focused);
    }

    const initial = reason('Default');
    await expect(initial).toBeRequired();
    await expect(initial).toHaveAttribute('placeholder', 'Add a reason');
    await expect(reason('Focused, typing')).toHaveValue('Incorrect unit price');
    await expect(reason('Filled')).toHaveValue('Incorrect unit price on invoice INV-20431');
    const emptyError = reason('Error, empty');
    await expect(emptyError).toHaveAccessibleDescription(requiredReason);
    await expect(reason('Error, focused')).toHaveAccessibleDescription(requiredReason);

    const amounts = within(canvas.getByRole('region', { name: 'Error, invalid value' }));
    for (const { value, error } of amountStates) {
      const amount = amounts.getByRole('spinbutton', {
        name: 'Dispute Amount',
        description: error,
      }) as HTMLInputElement;
      await expect(amount).toHaveValue(Number(value));
      await expect(amount).toHaveAttribute('aria-invalid', 'true');
      await expectFieldColors(amount, errorColor);
    }

    await userEvent.click(initial);
    await expect(initial).toHaveFocus();
    await expectFieldColors(initial, focusBorder, true);
    await userEvent.click(emptyError);
    await expect(emptyError).toHaveFocus();
    await expectFieldColors(emptyError, errorColor, true);
    await userEvent.click(canvas.getByRole('heading', { name: 'Required text and number input' }));
    await expect(emptyError).not.toHaveFocus();
  },
};
