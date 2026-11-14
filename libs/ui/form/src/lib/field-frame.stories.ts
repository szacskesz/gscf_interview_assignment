import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { FieldFrame } from './field-frame';
import { RadioInput, TextInput } from './text-input';

const meta = {
  title: 'Form/Field frame',
  component: FieldFrame,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FieldFrame, RadioInput, TextInput] })],
} satisfies Meta<FieldFrame>;
export default meta;

export const InvalidText: StoryObj<FieldFrame> = {
  render: () => ({
    template: `
      <gscf-field-frame label="Buyer" controlId="buyer" [required]="true" error="Enter a buyer name.">
        <input gscfTextInput id="buyer" required aria-invalid="true" aria-describedby="buyer-error" />
      </gscf-field-frame>
    `,
  }),
  async play({ canvas, userEvent }) {
    const input = canvas.getByRole('textbox', { name: 'Buyer' });
    await expect(input).toHaveAccessibleDescription('Enter a buyer name.');
    await userEvent.click(canvas.getByText('Buyer', { exact: false }));
    await expect(input).toHaveFocus();
  },
};

export const RequiredCurrency: StoryObj<FieldFrame> = {
  render: () => ({
    template: `
      <gscf-field-frame label="Currency" controlId="currency" kind="group" [required]="true">
        <div class="flex gap-4">
          <label><input gscfRadioInput type="radio" name="currency" value="USD" required /> USD</label>
          <label><input gscfRadioInput type="radio" name="currency" value="EUR" required /> EUR</label>
        </div>
      </gscf-field-frame>
    `,
  }),
  async play({ canvas, userEvent }) {
    await expect(canvas.getByRole('group', { name: 'Currency' })).toBeVisible();
    await userEvent.click(canvas.getByRole('radio', { name: 'USD' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'EUR' })).toBeChecked();
  },
};
