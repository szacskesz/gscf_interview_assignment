import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';
import { environment } from './environments/environment';

declare const COMPILE_TIME_ENABLE_MOCK: boolean;

async function start(): Promise<void> {
  if (COMPILE_TIME_ENABLE_MOCK && environment.mockApi) {
    const { startMockApi } = await import('./mocks/start-mock-api');
    await startMockApi(environment.apiBasePath);
  }

  await bootstrapApplication(App, appConfig);
}

start().catch((error: unknown) => {
  console.error(error);
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'Disputes could not start. Reload the page to try again.';
  document.querySelector('gscf-root')?.replaceChildren(message);
});
