import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { FieldFrame } from '../field-frame/field-frame.component';
import { NumberField } from './number-field.component';

const meta = {
  title: 'Form/Number field',
  component: NumberField,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NumberField, FieldFrame] })],
} satisfies Meta<NumberField>;
export default meta;

export const Editable: StoryObj<NumberField> = {
  render: () => ({
    template: `
      <gscf-field-frame label="Amount" controlId="amount" [required]="true">
        <gscf-number-field controlId="amount" placeholder="Enter an amount" [step]="0.01" [inputRequired]="true" />
      </gscf-field-frame>
    `,
  }),
  async play({ canvas, userEvent }) {
    const amount = canvas.getByRole('spinbutton', { name: 'Amount' });
    await expect(amount).toBeRequired();
    await userEvent.click(amount);
    await expect(amount).toHaveFocus();
    await userEvent.type(amount, '22');
    await userEvent.keyboard('.45');
    await expect(amount).toHaveValue(22.45);
  },
};

export const LockedWithError: StoryObj<NumberField> = {
  render: () => ({
    template: `
      <gscf-field-frame label="Amount" controlId="locked-amount" error="Enter an amount.">
        <gscf-number-field controlId="locked-amount" [locked]="true" [showError]="true" />
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

export const IntegerStep: StoryObj<{ step: number | 'any' }> = {
  args: { step: 1 },
  render: (args) => ({
    props: args,
    template: `
      <gscf-field-frame label="Quantity" controlId="quantity">
        <gscf-number-field controlId="quantity" [step]="step" />
      </gscf-field-frame>
    `,
  }),
  async play({ canvas, userEvent }) {
    const quantity = canvas.getByRole('spinbutton', { name: 'Quantity' });
    await expect(quantity).toHaveAttribute('step', '1');
    await userEvent.type(quantity, '2');
    await userEvent.keyboard('{ArrowUp}');
    await expect(quantity).toHaveValue(3);
  },
};
