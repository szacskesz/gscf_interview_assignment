import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { STORY_FINISHED, type StoryFinishedPayload } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import documentation from '../.compodoc/documentation.json';

// The Angular CLI defines this for browser builds. Storybook owns this entry point.
Object.defineProperty(globalThis, 'ngServerMode', { value: false, configurable: true });
setCompodocJson(documentation);

if (new URLSearchParams(location.search).has('catalogTest')) {
  addons.getChannel().on(STORY_FINISHED, ({ storyId, status }: StoryFinishedPayload) => {
    document.documentElement.dataset['catalogStory'] = storyId;
    document.documentElement.dataset['catalogResult'] = status;
  });
}

export default {
  parameters: { controls: { expanded: true } },
} satisfies Preview;
