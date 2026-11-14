import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import documentation from '../.compodoc/documentation.json';

// The Angular CLI defines this for browser builds. Storybook owns this entry point.
Object.defineProperty(globalThis, 'ngServerMode', { value: false, configurable: true });
setCompodocJson(documentation);

export default {
  parameters: { controls: { expanded: true } },
} satisfies Preview;
