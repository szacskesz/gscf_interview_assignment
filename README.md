# GSCF Disputes

## Getting started

Use Node.js 24.22.3 and npm 11.19.1.

```sh
npm ci
npm start
```

Open http://localhost:4200/disputes. The overview loads the assignment records in the development mock backend.

`npm start` watches app files and private library source files through their public entry points. The Playwright dev server uses the same source mappings. Production and demo builds consume the packaged libraries in `dist/libs`.

`npm run build` builds the libraries first and writes the production application to `dist/apps/disputes/production/browser`. Library artifacts are written under `dist/libs`. Angular runs zoneless and uses default OnPush change detection.

The application is in `apps/disputes`. Shared code is in `libs` and imported through its package public APIs. See the [implementation plan](Docs/1-Initial-Plan.md) for the work sequence.

The workspace was verified with a clean `npm ci` and development and production builds on Windows. npm reported optional native tooling install-script notices. The builds succeeded with npm's default install-script policy.

Use `npm run format` to format workspace source, configuration, and Markdown. Use `npm run format:check` to check them without writing changes.

Use `npm run lint` for TypeScript, Angular template accessibility, and library import checks. Import shared code through a library's public package name. Use relative imports inside the same app or library. Extend the public-package import rules in `eslint.config.mjs` when adding a library.

The global stylesheet defines the GSCF theme and scans application and library sources, including colocated stories. It serves [Montserrat](https://github.com/JulietaUla/Montserrat/tree/cc8daf2e7085006b9c112542fc82b58afc13521d) from local assets with its SIL Open Font License.

Use `npm test` for the zoneless Vitest suites in CI or locally. It builds libraries first, then runs the Angular CLI test targets in jsdom and the standalone Node tests. Use `npm run test:all` for all test suites and the E2E and Storybook type checks.

Run `npx playwright install chromium` once, then use `npm run test:components` for Vitest component tests in Chromium. The browser target runs only `*.browser.spec.ts` files.

Run `npx playwright install chromium firefox webkit` once for E2E, then use `npm run test:e2e`. Playwright starts and stops the application server on port 4201. Chromium runs the full suite, while the browser and mobile projects select tagged workflows. See the [acceptance matrix](e2e/acceptance.md).

If Windows reports a Firefox side-by-side assembly error from the default Playwright cache, set `PLAYWRIGHT_BROWSERS_PATH` to a new writable directory before installing the browsers and running the suite. Use the same path for both commands.

Development and the optimized demo start the MSW worker before bootstrapping Angular. npm runs `mock:worker` after a standard `npm install` or `npm ci` and before `npm start`, including Playwright's application server. These hooks use the local MSW development dependency to refresh `apps/disputes/mocks/mockServiceWorker.js`. Run `npm run mock:worker` directly to regenerate it and commit any worker changes alongside an MSW upgrade. Angular copies the worker to the application root in the mock-enabled profiles.

Use `npm run storybook` to open the shared component catalog on port 6006, or `npm run build:storybook` to build it into `dist/storybook/ui`. The catalog uses Angular's Webpack support, which is deprecated in Angular 22. The application uses the Angular esbuild builder and both run zoneless.

The catalog commands generate Compodoc JSON before loading Storybook Autodocs. Use `npm run docs:components` to regenerate the metadata separately. The generated JSON is ignored by Git.

Use `npm run test:stories` to start the catalog on port 6007 and run its rendering and `play` checks in Playwright Chromium. The catalog index drives discovery, and Storybook reports each story's result. Application E2E tests have their own configuration and command.

## Build and preview

- `npm run build:demo` and `npm run serve:dist:demo` open the self-contained optimized demo at `http://127.0.0.1:4300/disputes`.
- `npm run build:dev` and `npm run serve:dist:dev` open the development artifact at `http://127.0.0.1:4300/disputes`. Stop the first preview before switching between development and demo.
- `npm run build` and `npm run serve:dist` open the mock-free build at `https://127.0.0.1:4301/disputes`. These are aliases for `build:prod` and `serve:dist:prod`. Serve a real API under `/api` for the production data workflows.

The mock-enabled previews use loopback HTTP so browsers can register the MSW worker without a local TLS certificate. The production preview uses HTTP/2 with the local server's self-signed certificate. To opt into HTTP/2 for the demo, pass `--http2 --key path/to/key.pem --cert path/to/cert.pem` after `npm run serve:dist:demo --`, using a certificate trusted by your browser.

## Architecture and behavior

- The app shell loads the disputes feature through a lazy route. CLI libraries expose explicit public APIs. The shared UI libraries provide native controls and presentation, CDK owns modal focus and dismissal, and Material owns toast announcements, replacement, and the five-second lifetime.
- The feature-scoped signal store reads through `httpResource` and sends writes through `HttpClient`. It updates rows only after a confirmed response. Signal Forms validates the create draft and shares one submission path for Enter and the submit button.
- Enter ungrouped U.S. decimals such as `1250.00` with a period. The native number input ignores comma keystrokes and comma-containing pastes, preserving the current value and validation state. The browser controls how the native field renders decimal separators. The table displays `1,250.00`. Precision is checked before converting to integer cents, so `1.230` is invalid. The mock API assigns the local calendar date, status, and next number.
- The mock worker handles GET and POST at `/api/disputes` and DELETE at `/api/disputes/:number`. A full reload resets the mock repository and numbering. The Playwright-managed E2E profile alone exposes controlled error and empty-state scenarios.

## Verification commands

| Command                                   | What it verifies                                           |
| ----------------------------------------- | ---------------------------------------------------------- |
| `npm run test:all`                        | Unit, component, E2E, Storybook, and TypeScript checks     |
| `npm test`                                | Vitest application, library, and Node tests                |
| `npm run test:node`                       | Standalone Node tests                                      |
| `npm run test:components`                 | Vitest component interaction in Chromium                   |
| `npm run test:e2e`                        | Application workflows, focus, responsive behavior, and axe |
| `npm run test:e2e:types`                  | Application E2E TypeScript checks                          |
| `npm run test:e2e:ui`                     | Interactive Playwright runner                              |
| `npm run test:stories`                    | Built-in story render and `play` results in Chromium       |
| `npm run test:storybook:types`            | Storybook and story TypeScript checks                      |
| `npm run lint` and `npm run format:check` | Workspace lint and formatting                              |

`build:libs`, `build:libs:prod`, and `build:libs:demo` all produce the same production library packages in dependency order. `build:libs:dev` packages the libraries with their development configurations. `build:dev` runs that packaging step first, then compiles the development app from the libraries' public source entry points. For a specific library, run `npm run ng -- build <project> --configuration development --watch` after building its dependencies.

The [delivery verification](Docs/6-Delivery-Verification.md) records the separate Definition of Done and assignment PDF reviews, including the remaining manual accessibility checks.

## Interview walkthrough

1. Open the demo and confirm the three records and the row counter.
2. Open **New Dispute**, submit the empty form, and fix the required errors. Try `12.345` before entering `1250.50`.
3. Create a dispute in EUR. Confirm its first-row placement, number, date, formatted amount, and toast.
4. Open **Remove** on that row, cancel with Escape, then reopen and confirm removal.
5. Remove the remaining rows, recreate from the empty state, and reload to demonstrate the session reset.
6. Open Storybook to show the shared controls, API documentation, and interaction checks.
