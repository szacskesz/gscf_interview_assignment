import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { FieldFrame } from '../field-frame/field-frame.component';
import { AmountField } from './amount-field.component';

const meta = {
  title: 'Form/Amount field',
  component: AmountField,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [AmountField, FieldFrame] })],
} satisfies Meta<AmountField>;
export default meta;

export const Editable: StoryObj<AmountField> = {
  render: () => ({
    template: `
      <gscf-field-frame label="Amount" controlId="amount" [required]="true">
        <gscf-amount-field controlId="amount" placeholder="Enter an amount" [inputRequired]="true" />
      </gscf-field-frame>
    `,
  }),
  async play({ canvas, userEvent }) {
    const amount = canvas.getByRole('spinbutton', { name: 'Amount' });
    await expect(amount).toBeRequired();
    await userEvent.click(amount);
    await expect(amount).toHaveFocus();
    await userEvent.type(amount, '22');
    await userEvent.keyboard(',');
    await expect(amount).toHaveValue(22);
    await userEvent.keyboard('.45');
    await expect(amount).toHaveValue(22.45);
  },
};

export const LockedWithError: StoryObj<AmountField> = {
  render: () => ({
    template: `
      <gscf-field-frame label="Amount" controlId="locked-amount" error="Enter an amount.">
        <gscf-amount-field controlId="locked-amount" [locked]="true" [showError]="true" />
      </gscf-field-frame>
    `,
  }),
  async play({ canvas, userEvent }) {
    const amount = canvas.getByRole('spinbutton', { name: 'Amount' });
    await expect(amount).toHaveAccessibleDescription('Enter an amount.');
    await expect(amount).toHaveAttribute('aria-invalid', 'true');
    await expect(amount).toHaveAttribute('readonly');
    await userEvent.tab();
    await expect(amount).toHaveFocus();
  },
};
