import type { Preview } from '@storybook/angular';

// The Angular CLI defines this for browser builds. Storybook owns this entry point.
Object.defineProperty(globalThis, 'ngServerMode', { value: false, configurable: true });

export default {
  parameters: { controls: { expanded: true } },
} satisfies Preview;
