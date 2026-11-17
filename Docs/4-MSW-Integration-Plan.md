# MSW Integration Plan and Reference Review

Date: 13 November 2026

Status: Planning only; no application dependencies or implementation added.

## 1. Scope and confirmed decisions

Introduce an HTTP-based mock backend using MSW, as requested by the user. Preserve the assignment's workflows, seed records, validation, visual requirements, and the existing Angular CLI library architecture. This replaces the earlier assumption that the feature store would mutate fixtures directly without HTTP.

The user explicitly confirmed:

- Separate **development**, **demo**, and **production** profiles. The optimized demo includes MSW and works without a backend; production excludes mocks and requires a real API to complete workflows.
- After a valid create submission or removal confirmation, temporarily prevent duplicate submissions and all dialog dismissal while the request is pending. Show an accessible busy status. Restore normal dismissal on failure; close on success. This is an agreed extension for a state the PDF does not describe.

Keep the existing in-memory, reset-on-full-reload policy. The guide's persistence is optional and is not adopted. No separate backend process, database, authentication, editing endpoint, or generic repository framework is required.

## 2. Reference review

Read the supplied [v2 guide](../TMP/MSW_Angular_atultetesi_utmutato.md) and the [example project](../TMP/gscf-disputes-msw-poc/README.md), including build/package configuration, bootstrap, API service/model, handlers, repository, seeds, amount validation, repository tests, and the relevant UI mutation paths. Reference files were inspected read-only; no install, build, or test run was performed there. The findings establish source behavior, not a verified runtime pass.

The example targets Angular 21, TypeScript 5.9, Reactive Forms, and persistent localStorage. Our application uses the verified current Angular 22 stack with Signal Forms, Vitest, and Playwright. On the review date, npm reports MSW **3.0.5**, Node **>=22.12.0**, and a TypeScript peer range **>=5.9.x**. The planned Node 24 / TypeScript 6 baseline fits those ranges; recheck published dependencies and the selected test environment at integration time. Pin the exact installed release. [Published package metadata](https://registry.npmjs.org/msw/latest).

| Reference pattern or finding                                                         | Project decision                                                                                                                                |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP client service separate from mock implementation                                | Adopt. Feature/UI code never imports handlers or the repository.                                                                                |
| One entry point, conditional dynamic import, awaited worker startup                  | Adopt. Start interception before Angular can issue its first request.                                                                           |
| Build-time flag plus environment configuration; production worker exclusion          | Adopt and verify emitted output. Add the confirmed optimized demo profile.                                                                      |
| MSW 3 entry points and `onUnhandledFrame`                                            | Adopt the selected release's API, not old MSW 2 snippets.                                                                                       |
| Three seeds, status/date assignment, monotonically increasing IDs                    | Preserve the intent; adapt fields and money representation to our domain contract.                                                              |
| `window.localStorage` read at handler-module initialization                          | Replace with a fresh in-memory repository supplied to a handler factory. Shared handlers must also run in Node tests.                           |
| Empty persisted list is not reseeded                                                 | Preserve the empty-list invariant within a session. Full reload deliberately starts a new session.                                              |
| Numeric `amount` and `String(number)` precision validation                           | Do not copy. Number conversion loses literal precision: `1.230` becomes `1.23`. Validate the raw decimal text before converting it to a number. |
| Repository sorts all reads by number                                                 | Keep the supplied order and explicit prepend behavior. No additional sorting feature is needed.                                                 |
| Reactive Forms, explicit standalone/OnPush, custom toast timer and focus restoration | Do not port the UI. Use the agreed Angular defaults, Signal Forms, Material notifications, and CDK dialogs/focus policy.                        |
| Fixed 350/450 ms delays                                                              | No mandatory artificial delay. Enable deterministic delays only for deliberate loading/pending test scenarios.                                  |
| Blanket bypass of unhandled traffic                                                  | Fail unmatched requests to the configured mock API; allow unrelated assets and development-server traffic.                                      |
| Caret/tilde package ranges, development-default build, copied scripts                | Replace with exact versions and project-specific commands; keep the ordinary build production-oriented.                                         |
| Optional PATCH example                                                               | Omit. Only list, create, and remove are required.                                                                                               |

The reference README's suggestion to delete the lockfile is not an upgrade policy for this repository. Preserve the committed lockfile and use deliberate dependency updates and `npm ci`.

## 3. Placement and dependency direction

| Location                                         | Responsibility                                                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/disputes/src/environments/`                | Typed API base URL and mock-mode settings for each profile. Values are public build configuration, never secrets.                                                                  |
| `apps/disputes/src/main.ts`, `define-flags.d.ts` | Conditional startup and declared build-time flags.                                                                                                                                 |
| `apps/disputes/src/mocks/browser.ts`             | Browser-only composition: construct the repository/handlers and start `setupWorker`.                                                                                               |
| `apps/disputes/public/mockServiceWorker.js`      | Generated worker served only by mock-enabled builds.                                                                                                                               |
| `libs/core`                                      | API configuration.                                                                                                                                                                 |
| `libs/data-access/disputes`                      | Domain/DTO types, Angular HTTP API adapter, and feature-scoped signal store.                                                                                                       |
| `libs/feature/disputes`                          | Create Dispute schema, user-facing errors, and decimal amount parsing.                                                                                                             |
| `libs/data-access/disputes-mock`                 | Separate CLI library with seed records, in-memory repository, handler factory, and focused specs. Depends on the disputes library's public domain API and core; never the reverse. |
| `testing/msw/`                                   | Node test setup and controlled error/delay scenarios. Excluded from application/library public APIs.                                                                               |

Generate these projects only when their implementation stage begins. Use built public library entry points, including for the dynamic browser adapter's mock-library import. Explicit build ordering covers core, disputes data access, mock adapter dependencies, UI, features, and app as needed. The mock library supports mock-enabled application builds, not the real API client.

Enforce the one-way dependency with lint checks. A production feature, store, API service, or regular barrel must never import or re-export the mock library. The browser adapter is reachable only from the guarded dynamic import; Node tests import the environment-independent handler factory separately.

## 4. HTTP contract and data ownership

Use same-origin `/api/disputes` by default, with one injected API base URL configured by the app. Resolve URLs consistently in the Angular adapter and mock composition; Node tests use an explicit test origin.

| Request                    | Success                                   | Failure contract                                                            |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `GET /api/disputes`        | `200` with an ordered `Dispute[]`         | A controlled failure scenario can return `500`; UI offers retry.            |
| `POST /api/disputes`       | `201` with the complete created `Dispute` | A controlled test scenario can fail the write so the UI can exercise retry. |
| `DELETE /api/disputes/:id` | `204`, no body                            | `404` if the dispute does not exist.                                        |

The Create Dispute feature validates the original decimal string with Signal Forms and converts valid values to decimal numbers. The create request contains `buyer`, `reason`, `amount`, and `currency`. The response contains the saved `Dispute`, including its generated number, status, and UTC ISO 8601 timestamp.

The Angular adapter and MSW handlers use the typed demo contract. The in-memory mock applies operations to that data. Test scenarios simulate HTTP failures, and the UI keeps the draft available for retry. Integrating an external API would require reviewing how its request and response data are validated.

The mock repository owns the records, next number, status, and creation date. It starts from fresh copies of the three exact fixtures, allocates 6229 first, increments only on successful creation, prepends without sorting, and never reuses a deleted number. Use a passed current-date function so tests can control local calendar boundaries. Empty stays empty until full reload/reset. No localStorage, sessionStorage, IndexedDB, or worker-global database is needed: the repository belongs to the page's mock runtime. SPA route re-entry reads the current session; a full reload resets rows and numbering. Separate tabs have independent mock sessions.

The feature-scoped store is the UI's server-data view and operation state. Prefer one `httpResource` read model for GET, exposed through readonly/derived signals, and `HttpClient` for POST/DELETE. Keep URL/transport details in the data-access API adapter. Do not copy resource state into a second signal with an effect. Guard resource value reads with `hasValue()` and distinguish loading, failure, and a successfully loaded empty list. Angular recommends direct HTTP mutation calls rather than resource mutations. [Angular HTTP resources](https://angular.dev/guide/http/http-resource).

Apply the confirmed POST response to the read model, or remove the confirmed DELETE ID, only after success. Update count and table immediately at that point; do not perform optimistic business mutations. Coordinate resource reloads and mutations so a stale GET cannot overwrite a newer result; block competing actions during loading/mutation and verify the race case. The repository remains authoritative if the feature is recreated. Use one mutation subscription/await path; multiple subscriptions to a cold HTTP observable can duplicate writes.

## 5. Startup, worker lifecycle, and build profiles

Use MSW 3's `http`/`HttpResponse` from `msw/http`, `setupWorker` from `msw/browser`, and, only where needed, `delay` from `msw/utils/delay`. Node interception uses `setupServer` from `msw/node`. [MSW 3 migration](https://mswjs.io/docs/migrations/2.x-to-3.x).

1. Install the verified exact MSW version as a development dependency in its own stage.
2. Generate the worker into `apps/disputes/mocks` with the installed local CLI. Run `mock:worker` through `postinstall` and `prestart` and keep the standalone command available. Commit the generated worker without editing or reformatting it. The mock-enabled Angular profiles copy it to the app root. Verify its contents and version after dependency updates. [Worker management](https://mswjs.io/guides/best-practices/managing-the-worker).
3. In the single `main.ts`, use the statically defined `COMPILE_TIME_ENABLE_MOCK` and typed environment mode to guard the dynamic browser-adapter import. Await worker activation before `bootstrapApplication`. Surface startup failure visibly; never silently fall through to an absent backend. [Browser integration](https://mswjs.io/guides/integrations/browser).
4. Scope matching and unhandled-request checks to the configured API origin/path. Use the supported `onUnhandledFrame` callback and inferred types, allowing unrelated assets/HMR; avoid experimental type imports solely for this callback. Keep readiness protection enabled. [Worker startup options](https://mswjs.io/api/setup-worker/start).
5. Serve the worker at a URL whose scope covers the application; resolve it against the configured base path. Verify the response is JavaScript rather than the SPA fallback. Use localhost or HTTPS, including for phone testing on another device.

| Profile       | Optimization                                    | Mock flag / environment mode | Worker and mock code   | Output browser directory                 |
| ------------- | ----------------------------------------------- | ---------------------------- | ---------------------- | ---------------------------------------- |
| `development` | Development settings                            | `true` / enabled             | Included               | `dist/apps/disputes/development/browser` |
| `demo`        | Production-style optimization, hashing, budgets | `true` / enabled             | Included intentionally | `dist/apps/disputes/demo/browser`        |
| `production`  | Production optimization, hashing, budgets       | `false` / disabled           | Excluded               | `dist/apps/disputes/production/browser`  |

Keep `npm start` on development and use `npm run build` for production. The interview path is `build:demo` followed by `serve:dist:demo` at `http://127.0.0.1:4300/disputes`. Development and demo previews share port 4300 and run one at a time. Loopback HTTP allows the worker to register without a local TLS certificate. `serve:dist` and `serve:dist:prod` preview the mock-free artifact over HTTP/2 on port 4301. Production data workflows require an actual API.

Use Angular `define`, environment replacements, and production asset exclusions together. Preserve budgets, hashing, fonts, and ordinary assets. Separate output directories prevent stale demo workers contaminating production inspection. Clean only the selected app output, not all of `dist`, because it also contains built libraries. Verify the final import graph, emitted chunks, and absence of both worker and seed markers; an environment switch or `devDependency` label alone is insufficient. [Angular build-time definitions](https://angular.dev/tools/cli/build-system-migration), [environments](https://angular.dev/tools/cli/environments), [workspace assets](https://angular.dev/reference/configs/workspace-config).

A browser may retain a worker registration independently of output files. Run production checks on a fresh browser context/different origin; when debugging a shared origin, unregister only this app's MSW registration. Do not clear unrelated workers or storage. A missing real API should produce the planned load-error state, not a silent mock fallback.

## 6. Async interaction and failure behavior

Initial loading is separate from the assignment's empty state. Show an accessible loading status, hide an unconfirmed row counter, and make actions unavailable until the initial list resolves. On GET failure, show a concise inline error and Retry. Do not invent a new navigation flow.

For creation, keep the dialog/draft open during the Signal Forms `FormRoot`/`submit()` action and await the store command. On failure, retain input, display an accessible inline/field error, and restore actions. On success, update the table/count, close once, restore focus, and show the package-backed success toast using the returned number.

Removal follows the same pending/error pattern: send DELETE only after explicit confirmation, retain the selected row until success, and close/restore focus using the existing next-row/previous-row/New Dispute fallback. A `404` is not a successful removal toast; report the failure and reconcile the list explicitly if necessary.

As confirmed by the user, while a submitted request is pending disable duplicate actions and temporarily disable Cancel, close icon, backdrop, and Escape dismissal through CDK's supported behavior. Keep focus inside the dialog and announce `Creating dispute...` or `Removing dispute...` with an appropriate status region and busy state. Restore all dismissal paths after failure. Use a finite request timeout so a stalled request cannot lock the dialog indefinitely. Do not automatically retry POST/DELETE; a transport timeout does not prove that an operation was never applied. Document reconciliation for uncertain outcomes instead of promising exactly-once execution against a future real server.

Before submission and after failure, all originally specified cancellation paths still discard only the draft/confirmation and leave data unchanged. Do not infer request cancellation or rollback from unsubscription or closing a dialog. No production authentication/retry platform is part of this assignment.

## 7. Testing strategy

- **Vitest domain/repository tests:** exact seeds/order, copies, validation precedence including `1.230`, amount/date boundaries, create/prepend, missing deletion, monotonic IDs, empty-state lifetime, and fresh-session reset.
- **Vitest Node HTTP contracts:** reuse the handler factory with a fresh repository and `setupServer`; assert methods, paths, decimal amount payloads, status/body semantics, and unhandled-API detection. No `window` or localStorage access at module import. Reset runtime handler overrides and repository state separately between tests; stop interception after the suite. `resetHandlers()` alone does not reset custom data. [Node integration](https://mswjs.io/api/setup-server), [handler reset](https://mswjs.io/api/setup-server/reset-handlers).
- **Vitest/TestBed adapter/store tests:** use the appropriate HttpClient testing providers for focused transport behavior and resource state/race checks. Do not combine `HttpTestingController` and MSW interception for the same request. Verify loading/error/empty separation, duplicate protection, delayed confirmation, and failed-write behavior with zoneless TestBed.
- **Vitest browser components:** use the Playwright provider for focused real-browser component behavior. Most isolated UI checks need no backend. When testing actual HTTP interception, configure the browser worker and await its readiness in that test environment; `setupServer` cannot intercept browser requests. Keep browser specs and lifecycle hooks separate from Node tests.
- **Playwright Test E2E:** run all assignment workflows and targeted cross-browser/axe/focus/mobile checks through the actual browser worker. Fresh contexts/visits create isolated sessions. Use controlled failure/delay scenarios for pending locks, preserved drafts, retry, and absence of false success notifications. Compile the test-only startup scenario adapter out of demo/production; expose no arbitrary repository mutation/reset endpoints to application UI. Synchronize on readiness and visible state. Keep service workers enabled and do not layer `page.route()`/`context.route()` mocks over the same requests. A separate mock-free production smoke check verifies absence of interception. [Playwright service-worker caveat](https://playwright.dev/docs/network#missing-network-events-and-service-workers).
- **Storybook:** shared presentational components use args and interaction fixtures; they need no backend. Add MSW to a future API-dependent story only when needed, with explicit worker setup and per-story isolation.

Verify the selected MSW ESM exports, Node Web APIs, and Vitest environment configuration with a small contract fixture before adding domain features. Keep browser and Node entry points separate. Requests made by Playwright's API client run outside the page and do not pass through its worker; use browser UI workflows or Node handler tests as appropriate.

## 8. Integration stages and completion criteria

The full sequence is maintained in [the main plan](1-Initial-Plan.md#11-incremental-implementation-sequence):

1. **Stage 8, MSW infrastructure:** after Vitest unit/browser component and Playwright E2E setup, add pinned MSW, worker generation, profiles, dynamic startup, and a minimal HTTP smoke fixture. Verify worker readiness and build exclusion independently of business features, before Storybook.
2. **Stages 9-12, shared catalog and kit:** continue Storybook, Compodoc, story tests, and shared UI components. They remain independent of mock business data.
3. **Stage 13, domain contracts:** establish core configuration and the disputes DTO public API.
4. **Stage 14, mock backend:** add the separate mock library, exact seeds, in-memory repository, GET/POST/DELETE handlers, and Vitest contract tests. Retire any temporary infrastructure-only smoke endpoint.
5. **Stage 15, HTTP/store integration:** connect the real Angular HTTP boundary and signal read model, operation states, and error/delay test harness before rendering feature workflows.
6. **Stages 16-18, business features:** implement overview, create, and remove individually with their E2E and failure-state coverage.
7. **Stages 19-21, artifact verification and handover:** verify optimized demo workflows, clean mock-free production output, complete accessibility/acceptance coverage, and document commands and limitations.

Completion requires a working development app and optimized standalone demo, production output with no MSW/seed/test controls, successful browser startup without first-request races, exact assignment behavior, isolated repeatable tests, and documented reset/profile behavior. These are future exit criteria; this review does not claim they have passed.
