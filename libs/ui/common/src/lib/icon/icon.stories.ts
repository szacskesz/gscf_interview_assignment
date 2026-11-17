import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, waitFor } from 'storybook/test';
import { Icon, type IconName } from './icon';

const meta = {
  title: 'Common/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'check' },
  render: (args) => ({ props: args, template: '<gscf-icon [name]="name" />' }),
} satisfies Meta<{ name: IconName }>;

export default meta;

export const Decorative: StoryObj<typeof meta> = {
  async play({ canvasElement }) {
    const icon = canvasElement.querySelector('gscf-icon');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await waitFor(async () => {
      await expect(icon?.querySelector('mat-icon svg path')).toBeVisible();
    });
  },
};
