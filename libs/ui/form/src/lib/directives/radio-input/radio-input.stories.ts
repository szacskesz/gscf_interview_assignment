import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { FieldFrame } from '../../components/field-frame/field-frame';
import { RadioInput } from './radio-input';

const meta = {
  title: 'Form/Radio input',
  component: RadioInput,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FieldFrame, RadioInput] })],
} satisfies Meta<RadioInput>;
export default meta;

export const RequiredCurrency: StoryObj<RadioInput> = {
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
