import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';
import { expect } from 'storybook/test';
import { Icon } from '../../components/icon/icon.component';
import { Button } from './button.directive';

const meta = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, Icon] })],
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<Button>;

export const Treatments: Story = {
  render: () => ({
    props: { activated: false },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" gscfButton="primary" (click)="activated = true">Save</button>
        <button type="button" gscfButton="secondary">Cancel</button>
        <button type="button" gscfButton="danger">Remove dispute</button>
        <button type="button" gscfButton="icon" aria-label="Close"><gscf-icon name="close" /></button>
        <button type="button" gscfButton="primary" disabled>Saving</button>
        @if (activated) { <p>Saved</p> }
      </div>
    `,
  }),
  async play({ canvas, userEvent }) {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Save' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Saved')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Saving' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();
  },
};
