import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { FieldFrame } from './field-frame.component';
import { TextInput } from '../../directives/text-input/text-input.directive';

const meta = {
  title: 'Form/Field frame',
  component: FieldFrame,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FieldFrame, TextInput] })],
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
