# Initial Implementation Plan

Date: 13 November 2026

Status: Planning only

Readiness review: See [development readiness](5-Development-Readiness.md) for the 14 November prerequisite checks, package-resolution findings, and stage-order clarifications. A planned exit criterion is not evidence that its integration has already passed.

Revision: Updated on 14 November 2026 to use Vitest for unit/integration tests, Vitest with the Playwright browser provider for component tests, Playwright Test for E2E, and Storybook for the component catalog and interaction tests. The agreed library workspace, incremental delivery, MSW profiles, and pending-request behavior remain in place.

## 1. Objective and source material

Build an Angular application that allows enterprise users to create and remove disputes directly from the Disputes overview. The application must reproduce the supplied workflow, validation behavior, visual language, and sample data using an entirely local mock implementation.

This plan is based on all 12 pages of [the interview assignment](../Instructions/SeniorFrontendEngineer-Interview-Task.pdf), dated 2 November 2026, including Figures 1.1-1.6, the color reference, and the input-state specification in Figure 2.0. The supplied [GSCF logo](../Instructions/GSCF-logo.png) is suitable for the dark navigation background and should be reused.

At the start of planning, the repository contained the assignment and logo, with empty `App` and `Docs` directories. The revised implementation will use an Angular CLI multi-project workspace at the repository root, with `apps/` and `libs/`. The earlier `App/` layout is superseded. This stage updates documentation only; temporary/reference projects are not adopted as the application.

All source code, identifiers, UI copy, comments, documentation, test descriptions, and any future commit messages will be written in English. Commit messages should describe the actual change concisely.

## 2. Scope and delivery priorities

### Required functionality

1. Reproduce the navigation, page heading, New Dispute action, table, and initial three disputes.
2. Open a creation modal containing four mandatory fields.
3. Implement the exact validation rules, error messages, and input states.
4. Create valid disputes with automatic numbering, status, and the current date.
5. Prepend new disputes and update the row counter immediately.
6. Confirm removal before changing the collection.
7. Display the specified empty state when all disputes are removed, and support creation from that state.
8. Provide a reproducible local setup, meaningful tests, and documentation supporting the live interview demonstration.

### Included optional functionality

Include both success toasts and the accessibility requirements identified as optional in the PDF, as confirmed during planning. Use an existing notification package for toast behavior and established Angular accessibility infrastructure for dialogs. Prepare their shared UI infrastructure before feature implementation, then connect the actual notifications to successful business operations.

### User-requested engineering scope

Build a small shared component catalog with Storybook, Compodoc, and component interaction tests before assembling the business features. Add Tailwind, Prettier, Vitest, its Playwright browser provider, and Playwright Test in separate verified steps. Phone usability is an explicit project requirement, although the PDF supplies desktop references only. These additions expand the engineering scope, not the business workflows or seed data.

Integrate an MSW-based HTTP mock backend in separate infrastructure, handler/repository, and Angular data-access stages. The supplied guide and example were reviewed in [the MSW integration plan](4-MSW-Integration-Plan.md), which records adaptations, API contracts, build isolation, and testing details. The temporary example is reference material, not the application scaffold.

### Scope boundaries

The mock backend will use in-memory data and reset to the supplied sample records on a full page reload. Angular will use real HTTP APIs intercepted by MSW; no separately running backend, persistent storage, authentication, real invoice or comment management, filtering, sorting, pagination, editing, currency conversion, or deployment is required. The removal description must still include the supplied wording about comments and linked invoices. The optimized demo works independently with MSW; the separate mock-free production artifact needs a real API for data workflows.

The prototype's language indicator and user name provide visual context; they do not imply a localization system or account menu. Render them as static information unless an actual interaction is subsequently requested. The active Disputes navigation item can link to the overview.

## 3. Framework and tooling decisions

### Angular version

On 13 November 2026, the published `latest` version of `@angular/core` is **22.2.6**. Angular 22 is the appropriate stable major version for this assignment. Use the latest stable patch available when implementation begins, verify the release again, and record the installed versions in the lockfile. Avoid `next`, release-candidate, and experimental APIs in required functionality. Sources: [package release metadata](https://registry.npmjs.org/@angular/core/latest) and [Angular release policy](https://angular.dev/reference/releases).

The readiness check selected **TypeScript 6.0.3**, not the registry's newer TypeScript 7.x release, because Angular 22 requires `>=6.0.0 <6.1.0`. Exact version selection must follow compatibility rather than applying `latest` to every package independently.

Use a compatible Angular CLI and CDK release from the same major version; verify their own release numbers and peer dependencies instead of assuming every package has the same patch number.

| Area                         | Proposed choice                                                                       | Reason                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Framework                    | Angular 22, latest stable patch                                                       | Matches the requested current Angular stack.                                                                                |
| Runtime                      | Node.js 24, a supported patch at or above 24.15.0                                     | Meets Angular 22's published compatibility range.                                                                           |
| Language                     | Strict TypeScript 6.0.x                                                               | Angular 22 currently requires TypeScript `>=6.0.0 <6.1.0`.                                                                  |
| Package management           | npm, exact direct dependency versions, committed `package-lock.json`                  | Reproducible `npm ci`; configure `save-exact=true` and review upgrades explicitly.                                          |
| Workspace                    | Angular CLI multi-project workspace with `apps/` and `libs/`                          | Supports the requested library layout without Nx or custom builders.                                                        |
| Application model            | Standalone components and application providers                                       | Keeps imports and dependencies explicit.                                                                                    |
| Change detection             | Zoneless, with OnPush-compatible components                                           | Fits signal-driven state and avoids a Zone.js dependency.                                                                   |
| Forms                        | Stable Angular Signal Forms                                                           | Integrates typed form values, validation, and interaction state.                                                            |
| State                        | Feature-local signal store with an HTTP resource read model and operation state       | Exposes server-confirmed data; the mock repository owns IDs and records.                                                    |
| HTTP and mock backend        | Angular `httpResource` for reads, `HttpClient` for mutations, MSW 3                   | Keeps UI independent of mocks while testing the actual HTTP boundary.                                                       |
| Dialog infrastructure        | Angular CDK Dialog with custom styles                                                 | Provides focus and overlay behavior while retaining the supplied appearance.                                                |
| Notifications                | Angular Material `MatSnackBar` with custom content                                    | Reuses an existing package for timing, replacement, positioning, and announcements.                                         |
| Styling                      | Tailwind utilities and semantic CSS custom properties                                 | User preference; shared tokens preserve the prototype's palette and responsive behavior.                                    |
| Unit/integration tests       | Vitest with Angular TestBed and jsdom                                                 | Angular CLI's supported setup; zoneless tests for domain and component integration.                                         |
| Browser component tests      | Vitest Browser Mode with `@vitest/browser-playwright`                                 | Real-browser component behavior through Angular's test builder.                                                             |
| E2E and browser verification | Playwright Test with axe                                                              | One suite owns complete business workflows and targeted cross-browser, accessibility, focus, responsive, and visual checks. |
| Shared component catalog     | Storybook with Compodoc and executable stories                                        | Documents public APIs and verifies isolated UI behavior before feature assembly.                                            |
| Static quality               | Angular ESLint and Prettier                                                           | Consistent TypeScript, templates, styles, and documentation.                                                                |
| Built previews               | Pinned `local-web-server`; `serve:dist:demo` for demo and `serve:dist` for production | Separate artifacts and SPA fallback. The demo uses MSW over loopback HTTP, and production preview uses HTTP/2.              |

Angular's [compatibility matrix](https://angular.dev/reference/versions) is the source for runtime and language versions. Use the CLI-compatible RxJS 7.x dependency where required; it does not need to become the application's state-management mechanism. Check the development machine's Node/npm versions before scaffolding and document the supported runtime in the README and version configuration.

### Modern Angular features to use deliberately

- Bootstrap with `bootstrapApplication` and standalone imports.
- Use `signal` for mutable state and `computed` for derived values such as the row count.
- Use `httpResource` for the collection read model and explicit `HttpClient` POST/DELETE calls for writes. Handle loading/error/empty states distinctly; do not duplicate resource data with an effect.
- Use `input()` and `output()` for component boundaries where data or events cross those boundaries.
- Use `inject()` for dependencies.
- Use built-in `@if` and `@for`, tracking disputes by their stable dispute number.
- Use signal queries and `afterNextRender` only where needed for focus after the DOM changes.
- Clean up subscriptions and timers with lifecycle-aware APIs such as `DestroyRef` and `takeUntilDestroyed` where applicable.
- Keep derived state in `computed` values rather than synchronizing duplicate fields with effects.
- Use `linkedSignal` only for derived state that also needs independent writes and a defined reset/reconciliation policy; multiple dependencies alone do not require it.
- Prefer `hostDirectives` for genuinely reusable behavior instead of extending component classes. The shared kit must not recreate the old CVA inheritance hierarchy.
- Use `viewChild`, `viewChildren`, `contentChild`, and `contentChildren` instead of query decorators. Required queries must have guaranteed results.
- Prefix signal fields with `$` and suffix observable/subject fields with `$`. Keep template-facing members `protected`, implementation members `private`, and intentional external contracts `public`; inputs, outputs, and models are public contracts. Use input/model aliases to keep binding names such as `label` clean.
- Document shared component inputs, outputs, and models with JSDoc. Use `input.required()` when omission is invalid. `output()` emitters are not signals and do not receive the signal prefix.
- Keep standalone and OnPush defaults; do not add explicit `standalone: true` or `changeDetection: ChangeDetectionStrategy.OnPush` in Angular v22 decorators.

These choices follow the [Angular style guide](https://angular.dev/style-guide), [input API guidance](https://angular.dev/guide/components/inputs), and [template control-flow guidance](https://angular.dev/guide/templates/control-flow). Zoneless operation is already the default in Angular 21 and later; retain the generated default and verify that no dependency or configuration reintroduces Zone.js. See [zoneless guidance](https://angular.dev/guide/zoneless).

Use a client-rendered application. Server rendering, hydration, a global store library, and a generic repository framework remain outside scope. Lazy-load every business page/feature route through `loadComponent` or `loadChildren`; redirects and componentless grouping routes do not need independent chunks, and the bootstrap shell remains eager. Currently there is one `/disputes` feature route and an empty-path redirect. Dialogs do not need separate routes. Avoid combining nested loading boundaries without a reason.

Use `@defer` for expensive, nonessential content that can appear after the initial render, with a lightweight placeholder that reserves space and useful loading/error states. Verify that dependencies are eligible for code splitting and are not also eagerly referenced. Do not defer the required initial table, New Dispute action, or immediately needed dialog fields. There is no current heavy optional product widget to invent merely to demonstrate this API; document and test the pattern in an isolated catalog example if needed. See [deferred-loading guidance](https://angular.dev/guide/templates/defer) and the [directive composition API](https://angular.dev/guide/directives/directive-composition-api).

### Compatibility checks before each integration

Use Angular CLI's `@angular/build:unit-test` builder with Vitest for Angular tests. Extend the generated configuration to cover the app and libraries. Keep Angular compilation under the CLI rather than introducing a separate unsupported Angular transform. Verify the selected Vitest release against the builder's peer range and align its browser/coverage packages. Use jsdom for fast DOM integration and the Playwright browser provider for selected real-browser component tests. [Angular testing setup](https://angular.dev/guide/testing).

The current [Storybook Angular guide](https://storybook.js.org/docs/get-started/frameworks/angular) supports Angular 18-22 and Compodoc integration. Start with its supported Angular renderer and a zoneless signal-input fixture. The historical [signal-input issue](https://github.com/storybookjs/storybook/issues/25784) was closed as completed; retain signal inputs, including aliases and required values, and verify their generated controls/docs rather than carrying over the old exception.

Keep Vitest unit/Node, Vitest browser component, Playwright E2E, and Storybook configuration separate, including TypeScript types, file patterns, setup hooks, and browser settings. The browser provider runs components under Vitest; `@playwright/test` owns E2E. Storybook interaction tests use a renderer-compatible runner and need their own dependency check. Its Vitest addon requires a Vite-based Storybook framework; the application test runner does not change the Angular/Webpack catalog renderer. Do not use forced peer resolution to conceal unsupported combinations. [Storybook addon requirements](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon#install-and-set-up).

MSW 3.0.5 was the published stable version at the 13 November review. Verify the selected release and its Node/TypeScript requirements again before installation, pin it exactly, and prove browser-worker startup plus a Vitest/Node handler test before adding domain workflows. Keep browser and Node adapters separate. See the compatibility evidence in [the MSW review](4-MSW-Integration-Plan.md#2-reference-review).

## 4. Requirement interpretation and acceptance criteria

The criteria below preserve the PDF interpretation. One later user-approved extension applies to asynchronous HTTP mutations: after submission/confirmation, temporarily lock dialog dismissal and duplicate actions while pending, announce busy state, then close on success or restore dismissal on failure. All ordinary cancellation criteria apply before submission and after failure. See [async interaction behavior](4-MSW-Integration-Plan.md#6-async-interaction-and-failure-behavior).

### 4.1 Overview and initial data

The initial screen must show the dark blue navigation bar, GSCF logo, active Disputes item, page title `Disputes`, and a top-right primary `New Dispute` button with a plus icon. Use semibold white text directly on the navy bar for the active navigation item, as shown in Figure 1.1. Keep a 44 px target and a visible keyboard focus indicator.

Use these columns, in this order: `Dispute No.`, `Buyer`, `Status`, `Dispute Date`, `Amount`, `Currency`, `Dispute Reason`, and `Actions`.

| Dispute No. | Buyer               | Status       | Dispute Date | Amount        | Currency | Dispute Reason                                                           |
| ----------- | ------------------- | ------------ | ------------ | ------------- | -------- | ------------------------------------------------------------------------ |
| 6228        | Alpine Logistics AG | New          | 25 Apr 2026  | 24,000,000.00 | USD      | Copy of Invoices                                                         |
| 6227        | Northwind Traders   | New          | 22 Apr 2026  | 16,450,000.00 | USD      | Freight: Freight Charges Disputed                                        |
| 6224        | Helvetia Foods GmbH | Acknowledged | 18 Sep 2026  | 18,350,500.00 | USD      | Tax: When either the invoice didn't include tax or tax is not applicable |

Preserve this order, even though it is not chronological by dispute date. Use status badges matching the figures. Right-align amounts and use tabular numerals where supported. Allow long reasons to wrap without obscuring the Actions column.

The counter starts as `Showing 3/3 rows`. Since this scope has no filtering or pagination, both values are derived from the same collection length. Each row contains a native text button labeled `Remove` with a bin icon and a dispute-specific accessible name.

### 4.2 Creation modal

`New Dispute` opens a centered modal over the dimmed overview.

- Title: `Create a dispute`
- Description: `Raise a dispute when an invoice differs from the agreed terms and conditions. Fields marked with * are mandatory.`
- Fields, in order: Buyer, Dispute Reason, Dispute Amount, Currency.
- Buyer: required text input, placeholder `Enter buyer name`.
- Dispute Reason: required text input, placeholder `Add a reason`.
- Dispute Amount: required number input, placeholder `Enter dispute amount`.
- Currency: required radio group containing `USD` and `EUR`, initially unselected.
- Each label has a red mandatory asterisk; the currency group uses a legend.
- Footer actions: secondary `Cancel`, followed by primary `Create Dispute`, matching the figures.
- Include the close icon shown in the prototype, with an accessible label.

Opening a new modal starts a fresh draft with empty values and no visible errors. Cancel discards the draft and leaves the disputes unchanged. Reopening after cancellation or successful creation starts cleanly.

Keep `Create Dispute` enabled while the form is invalid so a submission attempt can reveal all required errors. Native browser validation popovers must not intercept this workflow; use application-controlled validation with `novalidate`.

### 4.3 Validation behavior

An untouched form opens without errors. Blurring an invalid field reveals that field's error. Submitting reveals every invalid mandatory field together and focuses the first invalid field. Once an error is visible, it updates on input and clears immediately when that field becomes valid; unrelated errors remain.

Treat whitespace-only buyer names and reasons as empty. Trim surrounding whitespace when saving, while preserving internal spacing and punctuation. Do not introduce arbitrary business length limits that the assignment does not specify.

| Field or condition                         | Exact required message                   |
| ------------------------------------------ | ---------------------------------------- |
| Buyer empty                                | `Enter a buyer name.`                    |
| Dispute Reason empty                       | `Enter a dispute reason.`                |
| Dispute Amount empty                       | `Enter a dispute amount.`                |
| Dispute Amount zero or negative            | `Enter an amount greater than 0.`        |
| Dispute Amount with more than two decimals | `Enter an amount with up to 2 decimals.` |
| Currency unselected                        | `Select a currency.`                     |

The amount validator reports one error at a time. For valid numeric syntax, evaluate missing value first, nonpositive value second, and decimal precision third. For example, `-12.345` must show the greater-than-zero message. Never round an invalid amount into a valid value.

Also reject malformed, non-finite, or unrepresentable numeric input. The PDF does not provide copy for these cases; proposed supplemental messages are `Enter a valid dispute amount.` and `Enter a smaller dispute amount.`. These are implementation safeguards, not additional business requirements.

Replicate the field states in Figure 2.0:

| State                | Planned treatment                                                                |
| -------------------- | -------------------------------------------------------------------------------- |
| Default              | Neutral border, gray placeholder, required marker, no error.                     |
| Hover                | Darker border and text cursor without changing label or message.                 |
| Focused              | Blue border and a soft blue shadow. The placeholder remains until typing starts. |
| Focused while typing | Blue border and a soft blue shadow around the current value.                     |
| Filled and blurred   | Normal border and retained valid value.                                          |
| Empty with error     | Red border, warning icon, required marker, and red error text below.             |
| Focused with error   | Red error border and a soft red shadow. The error remains until corrected.       |
| Invalid amount       | The relevant single error message and preserved input; no silent rounding.       |

For currency errors, show red radio outlines and the group-level message as in Figure 1.3a. Do not invent an input box around the radio group.

### 4.4 Saving

On a valid submission:

1. Validate and normalize the draft at the mutation boundary.
2. Allocate the next dispute number, initially `6229`.
3. Set the status to `New`.
4. Set the date to the user's current local calendar date at submission time.
5. Insert the new dispute at the beginning of the collection.
6. Close the modal and return to the overview.
7. Update the counter automatically; the first creation produces `Showing 4/4 rows`.
8. Announce the successful operation with the creation toast.

The example `12 Oct 2026` specifies a display format, not a fixed creation date. A dispute created on 13 November 2026 should display `13 Nov 2026` in the user's local timezone.

Prevent duplicate creation from a rapid repeated submission. Do not allocate a number for an invalid or cancelled draft.

### 4.5 Removal

Clicking a row's Remove action opens a confirmation modal for that specific dispute. Opening the modal does not change the collection.

For dispute 6228, the required copy is:

> Remove dispute 6228

> Dispute 6228 (Copy of Invoices, 24,000,000.00 USD) will be removed from the Disputes list, together with its comments and linked invoices. This cannot be undone.

Build the same sentence from the selected dispute's number, reason, formatted amount, and currency. Render all supplied or user-entered values as text through Angular interpolation.

The secondary `Cancel` button, close icon, backdrop click, and Escape close the modal without changing data. The danger button `Remove dispute` removes the selected record, closes the modal, updates the counter, and shows the removal toast. Both `New` and `Acknowledged` disputes are removable.

Do not implement undo because the confirmation explicitly describes an irreversible removal within the current session. Reloading still resets this mock demonstration to its original data.

### 4.6 Empty state

When there are no disputes, hide the entire table and row counter. Keep the navigation, page title, and New Dispute button.

- Title: `No disputes`
- Description: `There are no disputes added yet. Select New Dispute to create one.`

Creating from the empty state restores the table with one row and `Showing 1/1 rows`.

### 4.7 Success toasts

Show toasts at the bottom right using the supplied green outline and check icon:

| Operation | Title             | Body example                     |
| --------- | ----------------- | -------------------------------- |
| Create    | `Dispute created` | `Dispute 6229 has been created.` |
| Remove    | `Dispute removed` | `Dispute 6228 has been removed.` |

Creation toasts disappear after five seconds as required. Use the same duration for removal as a documented consistency decision. A new operation replaces the previous toast. Delegate notification lifetime, replacement, positioning, dismissal, and live announcements to Angular Material's `MatSnackBar`; do not implement a custom toast engine or timer service.

Configure a polite announcement and keep keyboard focus in the workflow. Keep the toast inside the viewport on small screens.

## 5. Application architecture

### Angular CLI workspace and library boundaries

Angular CLI supports multiple applications and libraries in one workspace. Create an empty workspace with `--no-create-application`, then generate projects at explicit roots. The library generator supports `--project-root`, so the requested layout does not require Nx. Keep one root `angular.json`, npm manifest, and lockfile. See [multi-project workspaces](https://angular.dev/reference/configs/file-structure) and [library generator options](https://angular.dev/cli/generate/library).

The intended layout is below. Generate libraries when their implementation stage begins; do not create empty projects for every conceivable future feature. Establish `ui/common` with a minimal temporary integration fixture in stage 1 so packaging, aliases, Tailwind, and later catalog tooling can be verified against a real library. Its actual reusable component kit is still implemented in stage 12, after Storybook and story tests are ready.

```text
apps/
  disputes/
    public/
      mockServiceWorker.js
      images/gscf-logo.png
      fonts/
    src/
      app/
        app.ts
        app.html
        app.config.ts
        app.routes.ts
        layout/top-navigation/
      styles.css
      main.ts
      define-flags.d.ts
      environments/
      mocks/browser.ts
libs/
  core/
    src/
      lib/api-config/
      lib/validators/
        decimal-places.ts
        required-non-empty.ts
      public-api.ts
  ui/
    common/
      src/
        lib/
          button/
          icon-button/
          icon/
          badge/
          dialog-frame/
        public-api.ts
    form/
      src/
        lib/
          field-frame/
          field-error/
          text-input/
          radio-group/
        public-api.ts
    notifications/
      src/
        lib/
          notifications.ts
          success-notification/
        public-api.ts
  data-access/
    disputes/
      src/
        lib/
          models/
            dispute.model.ts
            disputes-store.model.ts
          services/
            disputes-api.ts
            disputes-store.ts
            disputes-store.spec.ts
        public-api.ts
    disputes-mock/
      src/
        lib/
          dispute.fixtures.ts
          disputes-repository.ts
          disputes-repository.spec.ts
          disputes.handlers.ts
          disputes.handlers.spec.ts
        public-api.ts
  feature/
    disputes/
      src/
        lib/
          disputes.routes.ts
          disputes-overview/
          disputes-table/
          create-dispute-dialog/
            create-dispute-dialog.ts
            create-dispute-dialog.html
            create-dispute-dialog.spec.ts
          dispute-form.ts
          dispute-amount.ts
          dispute-amount.node.spec.ts
          remove-dispute-dialog/
          amount-field/
        public-api.ts
styles/
  tokens.css
  theme.css
  typography.css
.storybook/
  main.ts
  preview.ts
  test-runner.ts
testing/
  vitest/
    setup.ts
    browser-setup.ts
  msw/
    server.ts
    scenarios.ts
  playwright/
    e2e/
    fixtures/
    accessibility/
    cross-browser/
    visual/
angular.json
package.json
package-lock.json
.npmrc
.prettierrc.json
.prettierignore
eslint.config.js
vitest-base.config.mts
playwright.config.ts
tsconfig.json
tsconfig.compodoc.json
Docs/
Instructions/
AGENTS.md
README.md
```

Each CLI library also has its generated package/build/TypeScript configuration. Shared components colocate their `*.stories.ts`, focused `*.spec.ts` where needed, templates, and optional CSS. The tree lists locations, not a requirement to wrap every native element. Use native-element directives where they preserve semantics more simply than wrapper components.

| Layer                            | Responsibility                                                                         | Allowed application-layer dependencies                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `libs/core`                      | Cross-cutting infrastructure and tokens, such as the controllable current-date source. | No feature, data-access, or UI imports.                                               |
| `libs/data-access/disputes`      | Domain/DTO models, pure helpers, HTTP adapter, feature-scoped store.                   | Core; no mock/UI/feature imports.                                                     |
| `libs/data-access/disputes-mock` | MSW handlers, exact fixtures, and in-memory mock repository.                           | Core and disputes domain public API; no UI/feature imports and no reverse dependency. |
| `libs/ui/*`                      | Presentational components and UI-only adapters/behavior.                               | Other explicitly approved UI libraries and small core tokens; no feature stores.      |
| `libs/feature/*`                 | Business pages, form schemas, dialogs, and orchestration.                              | Core, UI, and its own data-access library.                                            |
| `apps/*`                         | Bootstrap, global providers/assets, shell, and feature route registration.             | Public APIs of the layers above; business features are lazy imports.                  |

Only the app's guarded dynamic mock adapter and tests may consume the mock library. Keep seeds/handlers out of normal data-access barrels and production imports. The mock library is generated in its own stage, not as part of the shared UI kit.

Enforce these boundaries with ESLint restrictions and cycle checks rather than assuming folder names enforce them. Keep the distinction between package/public API names and physical folders explicit, for example `@gscf/disputes-data-access` can map to the library rooted at `libs/data-access/disputes`.

Use CLI-generated `ng-packagr` libraries and their public entry points. Keep consumer aliases pointed at built library outputs, and build dependencies before consumers. Provide a documented dependency order and watch workflow using ordinary scripts; Angular CLI is not an Nx task scheduler. Do not bypass packaging with private source imports just to make a build pass. Verify a clean build without pre-existing `dist` artifacts. [Angular library guidance](https://angular.dev/tools/libraries/creating-libraries).

For deferred UI, inspect the packaged entry-point boundary as well as the template: a flattened library entry point already used eagerly may prevent the desired split. Add a separate public entry point only when the measured loading requirement justifies it. Keep stories and test-only exports out of production public APIs.

### Shared component catalog before feature assembly

Build only the kit needed by the assignment: native button/icon-button treatments, icons and badges, a CDK-compatible dialog frame, accessible field labels/errors, basic text/radio presentation, and package-backed success notification presentation. The disputed amount's raw-input/precision rules remain feature/domain responsibilities; a generic numeric field must not normalize invalid input away.

Every shared component receives JSDoc on public inputs/outputs/models and a story covering its applicable default, focus, disabled, error, narrow-screen, and content-length states. Interactive stories use `play` functions for black-box behavior assertions. Static stories verify rendering and semantics instead of inventing artificial interactions. Stories are part of completing a component, not documentation deferred until the final application is done.

Compodoc emits JSON for Storybook Autodocs. Verify that signal inputs, aliases, required inputs, models, and outputs appear with useful descriptions. Supply explicit `argTypes` or documentation where extraction is incomplete. The separate Playwright catalog suite discovers stories through Storybook's index and checks the completion status of their render and `play` functions. [Storybook interaction testing](https://storybook.js.org/docs/writing-tests/interaction-testing).

Keep the empty-state markup within the overview unless it becomes substantial. Do not build a generic grid, modal framework, toast lifecycle, or broad CVA base class as part of the kit.

### Responsibilities and data flow

| Part                         | Responsibility                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Application shell            | Navigation, route outlet, and global styling.                                                         |
| Disputes overview            | Coordinates user actions, opens dialogs, invokes store commands, and requests notifications.          |
| Disputes table               | Displays immutable records and emits a removal request with the selected dispute.                     |
| Creation dialog              | Owns the isolated draft/validation and awaits the create command before closing.                      |
| Removal dialog               | Presents the selected record, requests removal only on confirmation, and stays open until the result. |
| Disputes store               | Owns the feature's HTTP read model, derived UI state, and pending/error command state.                |
| Disputes API adapter         | Encapsulates resource/HTTP URLs and the typed request and response contract.                          |
| Mock repository and handlers | Own session data, allocate IDs/status/date, and return API responses.                                 |
| Amount/date functions        | Perform deterministic normalization and display formatting.                                           |
| Notification adapter         | Supplies application copy and appearance to `MatSnackBar`.                                            |

The overview provides the store from `libs/data-access/disputes` for the feature. Use `@Service({ autoProvided: false })` with the explicit overview provider so its lifetime remains feature-scoped. It exposes readonly signals, while presentational components receive data through typed inputs. Pass the same feature command context into dialogs rather than creating a second store there. Dialog results are typed; a dismissal result must never be interpreted as confirmation. Only store commands issue mutations, and only successful API responses update the UI collection.

For creation, the dialog's single Signal Forms submission action awaits the store command. Keep its draft on failure; close with a typed success result on success, then request the notification once using the returned number. For removal, pass a snapshot of the selected record and remove by its stable number only after explicit confirmation. Retain the dialog/row on failure. Guard repeated actions and an already absent record. CDK controls focus and the user-approved pending dismissal lock; package-owned snack bars report confirmed success only.

### Domain model

Use narrow types and immutable records. A proposed model is:

```ts
type Currency = 'USD' | 'EUR';
type DisputeStatus = 'New' | 'Acknowledged';

interface Dispute {
  readonly id: number;
  readonly buyer: string;
  readonly status: DisputeStatus;
  readonly date: string;
  readonly amount: number;
  readonly currency: Currency;
  readonly reason: string;
}
```

`date` is a validated calendar-date string in `YYYY-MM-DD` format. `amount` is an integer number of cents. The form draft is a separate type and may contain incomplete values; invalid draft data must not enter the collection.

### State management and numbering

- Initialize a fresh mock repository from the exact fixtures when the page's mock runtime starts; never seed the Angular store directly.
- Load the collection through GET and expose readonly/derived signals. Loading/error is not a successfully loaded empty list.
- After confirmed POST/DELETE responses, update the read model using immutable prepend/filter operations. Coordinate reloads and mutations so stale GET responses cannot overwrite newer data.
- Keep the next-number value in the mock repository, starting at the highest seeded number plus one.
- Increment only after successful creation; never recompute from remaining rows after deletion or allocate a second sequence in the frontend store.

This produces `6229` when creating after deleting all original rows, matching Figure 1.6b. If `6229` has already been created and removed, the next dispute is `6230`. Reloading starts a new mock session and resets both records and numbering.

Use GET/POST `/api/disputes` and DELETE `/api/disputes/:id`. The Create Dispute feature validates the raw decimal string and sends safe integer `amount`. The mock stores those cents and returns the complete created record. Controlled scenarios exercise pending/error behavior. The HTTP contract, bootstrap, and build profiles are in [the MSW plan](4-MSW-Integration-Plan.md).

## 6. Form, money, and date implementation

### Signal Forms

Use a typed signal model with `form`, `FormField`, and schema-based validation from `@angular/forms/signals`. These APIs are stable in Angular 22, as documented by the [form API](https://angular.dev/api/forms/signals/form) and [FormField API](https://angular.dev/api/forms/signals/FormField).

The user confirmed using `FormRoot` and the Signal Forms `submit()` lifecycle instead of requiring `ngSubmit`. Bind the native form through `FormRoot`, configure the submission action, and use a real submit button. Enter and clicking the button must invoke the same validation/submission path exactly once. Do not combine a second manual submit handler with `FormRoot`'s configured submission action. This preserves centralized submission without importing classic form directives solely for their event names. [Signal Forms submission](https://angular.dev/guide/forms/signals/form-submission).

Define validation in a small feature-specific schema and pure amount-validation function. Render each error from its field state and the submitted/touched policy described above. Keep submission handling centralized so clicking Create Dispute and pressing Enter follow the same path. Use native text and radio inputs directly wherever possible. See the [Signal Forms overview](https://angular.dev/guide/forms/signals/overview) and [validation guidance](https://angular.dev/guide/forms/signals/validation).

### Numeric input and precision

Preserve the entered amount text until validation succeeds. Converting too early can lose information about decimal precision. Angular's native Signal Forms number binding converts values to numbers, so evaluate the amount control separately from the ordinary text fields. See [numeric input binding](https://angular.dev/essentials/signal-forms).

The amount-field component implements the Signal Forms [custom-control interface](https://angular.dev/guide/forms/signals/custom-controls). It wraps a native `type="number"` input with `lang="en-US"`, retains the raw decimal string and native bad-input state, and exposes focus, touched, and lock behavior. Comma keystrokes and comma-containing pastes are ignored so they leave the existing draft and its validity intact. The browser supplies the stepper and renders the numeric value according to its locale behavior.

Implementation details:

- Use `step="0.01"` as an input affordance, with explicit application validation as the authority.
- Accept ordinary decimal notation; document that grouped input and exponent notation are not supported in this first version.
- Retain at most two fractional digits only after validation; do not truncate or round a failing value.
- Convert a valid decimal string into cents by parsing its whole and fractional portions, avoiding floating-point multiplication as the validation strategy.
- Require the resulting cents value to be a safe integer. This is a technical storage boundary, not an invented commercial maximum.
- Format display values with English thousands separators and exactly two fractional digits. Keep the separate currency column rather than adding a currency symbol to the Amount column.
- Format large supported values using integer whole/fractional portions so display formatting does not lose a cent through floating-point division.

Examples: `1250`, `1250.5`, and `1250.50` are valid and display as `1,250.00`, `1,250.50`, and `1,250.50`. `12.345` remains visible and invalid. Under the chosen literal precision policy, `1.230` also fails rather than silently discarding the last zero.

The populated prototype shows `1,250.00` inside a number field. Native number controls do not reliably support grouped values, so the editable field will use an ungrouped value such as `1250.00`; the table and confirmation text will use `1,250.00`. Record this small, explicit interpretation in the README.

### Dates

Create the date from local year, month, and day when the save command runs. Avoid `toISOString().slice(0, 10)`, which derives a UTC date and can produce the wrong local day.

Use one date formatter for the table with an explicit English locale and the required `d MMM yyyy` output. Store sample dates as date-only values and avoid reparsing them through a timezone-sensitive UTC conversion. Pass a small current-date function into the mock repository so tests can freeze the date without depending on the machine's clock. The API assigns the date; the frontend store must not assign it again.

### Pipe use and formatting boundaries

The user confirmed using pure functions for domain calculations and formatting, with targeted pipe injection. When TypeScript genuinely needs a pipe instance, obtain it through `inject()`: provide it in the component, or register an environment provider at the required route/bootstrap scope for service usage. A component adds that pipe to template `imports` only when its template also uses it. Do not create a parallel wrapper library for built-in pipes.

## 7. Toast and accessibility libraries

### Notifications: Angular Material snack bar

Use `@angular/material/snack-bar` from a stable Angular 22-compatible release. It already supports custom content, configurable duration, replacement of an existing notification, and polite announcements without stealing focus. These capabilities are documented in the [official snack-bar guide](https://raw.githubusercontent.com/angular/components/main/src/material/snack-bar/snack-bar.md).

A thin `Notifications` adapter will open a presentational `SuccessNotification` component with the required title, description, and check icon. Configure bottom/right positioning, a 5,000 ms duration, and an explicit announcement message. Use supported theme overrides and an application panel class for the white background, Montserrat text, radius, and 3 px green outline.

The package owns the overlay and notification lifecycle. Application code only supplies content, configuration, and styles. Do not add a separate toast host, timer queue, or live-announcement implementation. Import only the Material features used by this application and include their required theme styles.

This is the proposed choice over adding a separate notification ecosystem such as ngx-toastr or ngx-sonner. A release and peer-dependency check remains part of setup; the [published Material package](https://www.npmjs.com/package/@angular/material) provides the installable version. Using Material for notifications does not require restyling the rest of the page as Material components.

### Dialogs: Angular CDK

Use CDK Dialog for the backdrop, focus containment, Escape handling, dialog semantics, and restoration to the invoking control. Include CDK overlay structural styles and use custom panel/backdrop classes for the design. See the [official CDK Dialog guide](https://raw.githubusercontent.com/angular/components/main/src/cdk/dialog/dialog.md).

Do not implement a custom focus trap. Configure accessible names and descriptions from the dialog headings and content. Open the removal dialog with focus on Cancel; open the creation dialog with focus on Buyer.

### Angular Aria and native semantics

The current [Angular Aria library](https://angular.dev/guide/aria/overview) offers headless patterns such as menus, listboxes, grids, and comboboxes. The required UI mainly consists of ordinary buttons, inputs, a radio group, a table, and modal dialogs. CDK Dialog plus native semantic elements covers these needs without adding Aria solely to demonstrate another package.

If a later requirement introduces a custom composite widget, evaluate the matching stable Aria primitive then. Do not convert the read-only disputes table into a keyboard grid or replace native radios with custom widgets unnecessarily.

## 8. Accessibility and interaction details

- Use landmark elements, a single page-level heading, a meaningful document title, and `lang="en"`.
- Keep DOM order consistent with the visual reading order; do not use positive `tabindex` values.
- Use real buttons for actions and links for navigation, with visible focus styling.
- Associate every input with its label and its own error through IDs and `aria-describedby`; set `aria-invalid` only when appropriate.
- Use a fieldset and legend for currency, with native radio keyboard behavior and a shared group error.
- Use a semantic table with column headers and a caption, which may be visually hidden.
- Give each Remove button an accessible name such as `Remove dispute 6228`, retaining the visible word Remove.
- Hide decorative bin, plus, warning, and check icons from assistive technology.
- Keep text contrast at or above the brief's 4.5:1 target; verify actual foreground/background pairs.
- Preserve visible focus even when an input has a red error border.
- Respect reduced-motion preferences and avoid motion essential to understanding state changes.

### Focus restoration after removal

The PDF asks the confirmation modal to return focus to the triggering Remove button. This is possible after cancellation, Escape, backdrop dismissal, or closing with the icon.

After confirmed deletion that button no longer exists. Restore focus to the next remaining row's Remove button, or the previous row's Remove button if the deleted row was last. If the list becomes empty, focus New Dispute. Apply this after the table has updated. Test both cancellation and deletion paths explicitly.

On creation cancellation or success, return focus to New Dispute. Opening either dialog must prevent keyboard focus from reaching the dimmed overview.

## 9. Visual implementation

### Layout and typography

Match the desktop prototype first: a compact dark header, white page, generous outer spacing, blue title, right-aligned primary action, restrained table dividers, and compact status badges. The dialogs use white surfaces, modest corner rounding, clear field spacing, and right-aligned footer actions.

Use Montserrat with locally served font files and appropriate license attribution. Load only the weights actually needed, with a fallback sans-serif stack and `font-display: swap`. This avoids depending on a third-party font request during the live demonstration. Copy the provided logo into the application's public assets and render it with `NgOptimizedImage`, meaningful alternative text, and intrinsic dimensions. Use the directive for eligible static image elements; inline SVG icons and unsupported inline base64 sources are different cases. [Image optimization](https://angular.dev/guide/image-optimization).

Measure proportions from the embedded figures rather than interpreting their scaled-down PDF text as actual browser font sizes. Keep body and form text readable. Use Angular Material `MatIcon` to render the local `icons.svg` set for plus, bin, close, warning, and check. The app and Storybook share the icon registration. The decorative SVGs inherit the surrounding text color.

### Design tokens

Define the supplied colors once as CSS custom properties and use semantic aliases where helpful. Preserve the mapping to the brief's token names in the stylesheet.

Use Tailwind utilities as the primary styling language, mapped to the semantic variables through the current Tailwind CSS-first theme configuration. A small CSS layer remains appropriate for tokens, fonts, CDK structural styles, and Material theme integration. A Sass file may be used narrowly if required by a package's theming API; it does not make the application SCSS-first. Keep one GSCF theme; no theme switcher or user-color editor is implied.

Configure Tailwind source detection for `apps/`, every UI/feature library, and the story files. Use complete utility names in variant maps rather than concatenated fragments. Confirm that a library-only class appears in both the application build and Storybook build. Share the same token/font stylesheet with the catalog. See [Tailwind source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files).

| Prototype token    | Value                    | Use                                                                                  |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------ |
| `gscf/neutral/110` | `#292929`                | Body text, labels, values, and table cells.                                          |
| `gscf/neutral/80`  | `#525252`                | Table headings and secondary icons.                                                  |
| `gscf/neutral/90`  | `#464646`                | Row counter.                                                                         |
| `gscf/neutral/70`  | `#656565`                | Placeholders.                                                                        |
| `gscf/neutral/60`  | `#7C7C7C`                | Default input and radio borders.                                                     |
| `gscf/neutral/30`  | `#DCDCDC`                | Table dividers and cell borders.                                                     |
| `gscf/neutral/20`  | `#EDEDED`                | Disabled input background if needed.                                                 |
| `gscf/neutral/40`  | `#BDBDBD`                | Disabled placeholder if needed.                                                      |
| `gscf/neutral/0`   | `#FFFFFF`                | Page/modal surfaces, navigation text, and filled-button text.                        |
| `gscf/blue/90`     | `#13375A`                | Navigation and headings.                                                             |
| `gscf/blue/100`    | `#0E2743`                | Input hover border.                                                                  |
| `gscf/blue/A70`    | `#0055A4`                | Primary actions, secondary borders/text, focus, selected radios, and New badge text. |
| `gscf/blue/10`     | `#E5EEF9`                | New badge background.                                                                |
| `gscf/yellow/10`   | `#FEF9C3`                | Acknowledged badge background.                                                       |
| `gscf/yellow/80`   | `#854D0E`                | Acknowledged badge text.                                                             |
| `gscf/red/70`      | `#B91C1C`                | Errors, required markers, removal actions, and danger button.                        |
| `gscf/green/60`    | `#3A8B25`                | Toast check icon and 3 px outline.                                                   |
| Backdrop           | `#0D1A33` at 50% opacity | Modal dimming layer.                                                                 |

Keep toast body text dark on white; the green token is for the icon and outline. Disabled-state colors should not be used for ordinary readable content. If a supplied combination fails the required text contrast, document the smallest necessary adjustment instead of silently claiming compliance.

### Responsive behavior

The PDF defines desktop views only, but phone usability is now explicitly requested. Required narrow-screen behavior:

- Let the page heading/action row wrap when needed.
- Keep all eight table columns available in a horizontal scrolling region rather than hiding required data.
- Allow the table region to be keyboard-scrollable when it overflows, with an accessible name.
- Size dialogs to the viewport with side margins, a maximum height, and internal vertical scrolling.
- Keep errors, currency options, and footer buttons usable without horizontal clipping.
- Position notifications within safe viewport margins.
- Keep touch actions comfortably usable, avoid viewport-wide horizontal overflow outside the table region, and account for the on-screen keyboard when checking dialog actions.

Review at approximately 1440 px, 1024 px, 768 px, 375 px, and 320 px widths, plus browser zoom. These are verification points rather than fixed product breakpoints. Preserve the exact desktop content and all eight columns on smaller screens.

## 10. Testing and verification

Tests should demonstrate observable behavior and protect the business rules. Avoid tests that merely restate implementation details or pursue a coverage percentage without useful assertions.

### Unit tests

Use Vitest for pure functions, the store, and focused feature logic. Every feature receives meaningful colocated `*.spec.ts` coverage. Prefer small TypeScript-focused white-box tests that select important paths and edge cases, without making private members public just for tests. Use Angular CLI's supported Vitest builder and zoneless TestBed for Angular-dependent tests. Exercise signals/inputs/DOM events and await `fixture.whenStable()` before assertions. Keep pure Node HTTP-contract tests in an isolated Vitest configuration when they need a different environment.

Test the mock repository separately from the Angular store. Reuse environment-independent handlers with MSW's Node adapter for HTTP contract tests, and use Angular's HTTP testing providers for focused client/resource tests. Do not stack both interception mechanisms on the same request. Reset handler overrides and repository state separately between tests. See [MSW test responsibilities](4-MSW-Integration-Plan.md#7-testing-strategy).

- Fixtures retain their exact values and initial ordering.
- Creation prepends a record, assigns New, uses the controlled current date, and updates the count.
- IDs increase correctly after removing the highest number and after removing all rows.
- Invalid creation does not change data or consume an ID.
- Removal changes only the requested record, and repeated removal does not affect another row.
- Amount validation distinguishes empty, nonpositive, precision, malformed, and unsafe values with the correct precedence.
- Cover `0`, `-1`, `-12.345`, `0.01`, `1`, `1.2`, `1.23`, `1.230`, `12.345`, whitespace, invalid syntax, and supported large amounts.
- Amount parsing and formatting preserve cents and always produce two display decimals.
- Date formatting and the injected current-date function handle local calendar boundaries.
- The form preserves literal amount precision during validation. API tests verify the integer-cent request and the planned response codes.
- Loading, error, and loaded-empty states remain distinct; failed writes do not trigger local success updates or toasts.
- Repeated submissions and stale GET responses cannot duplicate or overwrite a confirmed mutation.

### Component integration tests

Use Vitest/TestBed with realistic interaction and the production form schema for feature integration. Run browser-specific component behavior through Vitest Browser Mode and `@vitest/browser-playwright`, using Angular's supported browser test target. Shared UI components additionally have Storybook `play` tests for their catalog states and public interactions. A preference for TypeScript-only unit tests does not exclude DOM tests for bindings, validation timing, and focus:

- Opening the creation dialog shows the four fields, required markers, exact placeholders, no selected currency, and no errors.
- Empty submission reveals all four mandatory errors together and does not create a dispute.
- Blurring a field reveals its error without prematurely flagging unrelated untouched fields.
- Fixing one field clears only its error immediately, including while it retains focus.
- The amount error priority is correct and invalid decimals are not rounded.
- Cancel discards changes, and reopening gives a clean form.
- Confirmation content reflects the actual chosen record, including EUR when applicable.
- Cancellation and confirmation yield different typed results.
- The empty-state branch hides both the table and counter.
- Notification calls receive the correct title/body, position, and five-second configuration.
- While a submitted mutation is pending, busy state is announced and duplicate actions/dismissal are locked; failure restores dismissal and retains the draft/selected record.

Do not re-test every internal behavior of CDK or Material. Test the application's configuration and integration, then confirm user-visible behavior in a real browser.

Colocate browser-only checks as `*.browser.spec.ts`, include them only in the browser component target, and exclude them from the default `*.spec.ts` Node/jsdom selection. TestBed mounts components; the Playwright provider supplies the real browser. Keep these focused tests distinct from Playwright Test's page-level E2E suite. Start with Chromium, adding Firefox/WebKit for cases such as numeric input and focus. Stories own shared-component catalog examples; do not duplicate every story in another runner. [Angular browser testing](https://angular.dev/guide/testing#running-tests-in-a-browser).

### End-to-end scenarios

Use [Playwright Test](https://playwright.dev/docs/intro) as the single application E2E runner. Use accessible role/label locators and web-first assertions, or stable intent-based selectors where necessary. Keep tests black-box, use isolated browser contexts, and reset mock data through fresh page loads. Every feature and every PDF-required behavior must map to at least one E2E scenario:

1. Load the initial three rows and verify key seed values and `Showing 3/3 rows`.
2. Open creation, submit empty, fix fields individually, and verify each validation state.
3. Create a valid USD dispute and check first-row placement, number 6229, New status, today's date, formatted amount, count, and toast.
4. Create an EUR dispute and confirm its currency is preserved throughout display and removal confirmation.
5. Dismiss removal through Cancel, close icon, backdrop, and Escape; confirm no data changes.
6. Remove a selected dispute and verify only that row disappears and the counter/toast update.
7. Remove all records, verify the exact empty-state text, then create a new dispute and restore the table.
8. Verify ID continuity after removing newly created records, not just the original fixtures.
9. Exercise focus containment, initial Cancel focus, radio keys, cancellation restoration, and the post-deletion focus fallback.
10. Verify notification replacement and automatic dismissal using controlled browser time where practical.
11. Check narrow-screen table access, modal scrolling, and zoom without clipped actions.

12. Reload after mutations and verify the original records and numbering are restored.
13. Cancel/close/backdrop/Escape from creation and verify the collection is unchanged and the next opening has a clean draft.
14. Assert exact required error text, nonpositive/precision precedence, no rounding, and all relevant input states through real browser entry.
15. Through controlled MSW scenarios, verify initial-load failure/retry, delayed mutations, the agreed pending dismissal lock, failure recovery, and no success toast on rejection.
16. Verify worker readiness before the first API request, session reset, and the same happy workflows in the optimized demo artifact. Separately inspect mock-free production behavior without pretending a real API exists.

Run the complete Playwright business suite in Chromium and selected critical workflows in Firefox/WebKit, especially numeric-input behavior, keyboard/focus, mobile sizing, and visual comparisons. Use projects/tags to select browser and verification responsibilities within the same suite. Vitest browser component checks and Storybook interaction checks do not substitute for end-to-end business coverage.

Control the clock and browser environment for deterministic date assertions, with runner-specific setup. A reload should reset the mock data, making every test and demonstration repeatable. Keep an acceptance matrix mapping section 4 to concrete Playwright E2E tests, with supporting Vitest/component/story checks as appropriate.

Keep browser service workers enabled for suites using MSW. Use controlled test-only MSW scenarios rather than overlapping Playwright route mocks; Node-originated runner requests do not pass through the page's worker. Keep test controls out of demo/production, use fresh contexts for production checks, and avoid fixed sleeps. Shared UI stories remain independent of business HTTP data.

### Visual and accessibility checks

Compare browser screenshots against Figures 1.1-1.6 and inspect every Figure 2.0 input state. Check typography, spacing, column proportions, modal positioning, error-icon alignment, button order, colors, and toast appearance.

Use [axe through Playwright](https://playwright.dev/docs/accessibility-testing) on the overview, creation modal, error state, removal modal, and empty state. Supplement automated checks with a full keyboard walkthrough, text contrast inspection, and a screen-reader smoke test where available. Automated checks alone do not establish accessibility compliance.

## 11. Incremental implementation sequence

Complete the stages in order. Add one tool or architectural concern per reviewable change, run the checks relevant to that change, and record actual results before proceeding to dependent work. Scaffolding stages must leave a usable build, even before domain functionality exists. Do not install all tools together and postpone integration failures until the application is finished.

| Stage                               | Work introduced in this step                                                                                                                                                                                                                                                                                                          | Exit criteria                                                                                                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Compatibility baseline           | Verify stable Angular/CLI, local Node/npm, compatible exact TypeScript, and tool peer ranges; resolve the minimal workspace dependencies and record checks required at later integration stages.                                                                                                                                      | The workspace baseline resolves without forced/legacy peer options or a hidden downgrade. Each later integration validates its own dependency graph and runtime behavior before dependent work proceeds.                                                              |
| 1. CLI workspace                    | Generate the empty root workspace, `apps/disputes` shell, and only a minimal `ui/common` public-API integration fixture. Add strict/zoneless defaults, exact-save policy, runtime version files, root ignore rules, build output paths, and dependency-order build/watch scripts. Preserve the existing Git repository and documents. | Clean library-then-app build works from no output artifacts; the shell imports the built library public API; no Zone.js runtime or unintended attribution. Repository ignore rules exclude `TMP`, generated output, reports, and dependency folders on every machine. |
| 2. Prettier                         | Add formatting config, ignore rules, and format/check scripts only.                                                                                                                                                                                                                                                                   | Formatting covers owned source/config/docs; generated output and `TMP` are excluded.                                                                                                                                                                                  |
| 3. ESLint and boundaries            | Add Angular ESLint, template checks, and layer/import restrictions. Accommodate the agreed `$signal` fields with clean input/model aliases rather than forbidding those aliases.                                                                                                                                                      | Lint passes; a temporary invalid import is rejected and then removed. Update project-specific boundary mappings when later libraries are generated.                                                                                                                   |
| 4. Tailwind and tokens              | Add Tailwind/PostCSS, CSS-variable colors, locally served Montserrat plus its license, supplied logo assets, and app/library/story source detection.                                                                                                                                                                                  | Shell/fixture render token-backed utilities; a production build retains library-only classes and local fonts. No business feature is implemented yet.                                                                                                                 |
| 5. Vitest unit/integration tests    | Configure Angular CLI's Vitest test targets for app/library specs, zoneless TestBed, jsdom, isolated types, and unit/CI scripts. Keep pure Node contracts separate where needed.                                                                                                                                                      | Compatible dependency resolution and meaningful signal/DOM and pure-function tests pass without Zone.js; all intended library specs are discovered.                                                                                                                   |
| 6. Browser component tests          | Add the version-matched Vitest Playwright provider, browser binaries, isolated browser-spec selection, and component-test command.                                                                                                                                                                                                    | The integration fixture passes a real-browser interaction test; Node/jsdom and browser targets do not run each other's specs.                                                                                                                                         |
| 7. Playwright E2E                   | Add `@playwright/test`, E2E fixtures, managed app startup/readiness/cleanup, axe, viewport/browser projects, and screenshot policy.                                                                                                                                                                                                   | Shell/navigation and accessibility smoke checks pass; the acceptance matrix is prepared; Chromium/Firefox/WebKit checks do not discover component or story specs.                                                                                                     |
| 8. MSW infrastructure               | Add exact MSW, generated worker, typed environments, build-time flags, awaited dynamic startup, and separate development/demo/production outputs. Use a minimal temporary HTTP fixture.                                                                                                                                               | Browser first-request smoke and Vitest/Node interception work; development/demo include the worker; production excludes mock code/assets. No domain UI is added.                                                                                                      |
| 9. Storybook                        | Add the supported Angular renderer and its devkit dependencies, shared styles/assets/providers, and catalog configuration; check its dependency graph independently.                                                                                                                                                                  | Resolution introduces no unexplained mismatch; the zoneless fixture renders and its required/aliased signal input, output, and model can be exercised.                                                                                                                |
| 10. Compodoc                        | Add JSDoc extraction and generated-JSON integration with Storybook Autodocs.                                                                                                                                                                                                                                                          | Descriptions and aliases for the fixture's public signal APIs appear correctly, or explicit documentation fills extraction gaps. Generated files are kept out of source commits.                                                                                      |
| 11. Story component tests           | Add the renderer-compatible story test runner and isolated configuration.                                                                                                                                                                                                                                                             | A `play` interaction and assertion run against a built/local catalog; failures are reported by a dedicated command.                                                                                                                                                   |
| 12. Common UI kit                   | Implement `ui/common`, `ui/form`, and notification presentation in small component-sized increments. Add CDK/Dialog and Material snack-bar infrastructure when needed. Each component includes stories/tests before moving on.                                                                                                        | Default, focus, invalid, disabled, busy, mobile, and long-content states are demonstrated; documented APIs have no business-store/mock dependencies.                                                                                                                  |
| 13. Core and domain contracts       | Add API configuration in core plus domain and DTO models in data access.                                                                                                                                                                                                                                                              | Clean dependency-order library builds work. Browser tests verify amount and date display with Angular's formatting APIs.                                                                                                                                              |
| 14. MSW disputes backend            | Add the separate mock library, exact fixtures, in-memory repository, and GET/POST/DELETE handlers; remove the temporary smoke endpoint.                                                                                                                                                                                               | Vitest repository/HTTP tests cover seeds/order, payload validation, status codes, prepend/removal, monotonic IDs, empty lists, and session reset; no browser globals in shared handlers.                                                                              |
| 15. HTTP and signal store           | Add the Angular API adapter, resource read model, feature-scoped store, pending/error commands, and isolated test scenario setup.                                                                                                                                                                                                     | Tests verify loading/error/empty separation, confirmed updates, failure recovery, one submission path, no stale-read overwrite, and mock-free client imports.                                                                                                         |
| 16. Disputes overview               | Add the lazy feature, table, counter, empty/loading/error states, retry, and branded navigation using the completed kit.                                                                                                                                                                                                              | Seed values/order match the PDF through MSW; Playwright verifies populated/empty/error rendering; the route is a real lazy boundary.                                                                                                                                  |
| 17. Creation flow                   | Add the Signal Forms draft/schema, narrow amount control, awaited `FormRoot` submission, validation, cancellation, pending lock, and success notification.                                                                                                                                                                            | Vitest/component checks and Playwright E2E cover required errors, USD/EUR creation, insertion/defaults, cancellation, clean reopening, delayed/failed requests, preserved draft, and toast behavior.                                                                  |
| 18. Removal flow                    | Add record-specific confirmation, dismissals, awaited mutation, pending lock, and focus fallback.                                                                                                                                                                                                                                     | Playwright covers cancellation, failure without local deletion, confirmed/last-row removal, recreation, ID continuity, and focus/busy behavior across engines.                                                                                                        |
| 19. Built previews and optimization | Add pinned local server and demo/production preview scripts; review side effects, chunks, images, budgets, and justified deferred content.                                                                                                                                                                                            | Optimized demo works at `/disputes` with MSW; production has no worker/seeds/mock or test code; assets survive optimization; output checks use clean separate paths.                                                                                                  |
| 20. Final integration               | Complete acceptance matrix, desktop/mobile visual review, axe scans, manual keyboard/focus checks, and configured suites.                                                                                                                                                                                                             | Every assignment behavior has E2E coverage; mobile workflows and async states are accessible; clean builds/checks pass with recorded results.                                                                                                                         |
| 21. Handover                        | Document root commands, build order, tool responsibilities, profiles, reset behavior, choices, limitations, and demo steps.                                                                                                                                                                                                           | Another developer can install/build, run suites/catalog, preview the working demo, inspect mock-free production, and explain its real-API requirement.                                                                                                                |

Accessibility and tests start when each component/feature is introduced. Stage 20 consolidates acceptance evidence; it is not the first test or accessibility pass. Within stage 12, finish one shared component and its stories before starting the next. Within stages 16-18, complete one user workflow and its tests at a time. MSW infrastructure, domain handlers, and Angular integration are separate concerns rather than one large backend change.

Early tooling uses the minimal integration fixture, not a prematurely implemented business component. Stage 9 adds its catalog example; stage 12 replaces temporary fixture behavior with the real shared kit. Add scripts and README setup notes in the stage that introduces them; stage 21 consolidates documentation rather than creating it for the first time. Stage 8 may use the configured Angular dev server for browser smoke checks and inspect emitted demo/production files; the dedicated built-artifact preview server arrives in stage 19. Core API/date infrastructure in stage 13 is not a prerequisite for presentational UI; keep stage 8's generic startup settings app-local until then.

If a version combination fails its compatibility fixture, resolve that integration before layering dependent features on it. Record an evidence-based alternative for the user if the selected tools cannot coexist; do not silently substitute another unit runner, add Zone.js, or disable required checks.

If commits are requested during implementation, each should describe a completed, independently verifiable step in short English, such as `Configure Tailwind tokens`, `Add zoneless Vitest tests`, or `Add shared field stories`. Verified tooling integration is a valid milestone; avoid committing broken scaffolding or unrelated changes together.

### Demo/production previews and tree-shaking verification

Use separate profile outputs under `dist/apps/disputes/{development,demo,production}/browser`. Keep `build` and `serve:dist` as production aliases. Use `build:demo` and `serve:dist:demo` for the self-contained interview artifact. See the [README preview commands](../README.md#build-and-preview) for the development, demo, and production ports.

Install `local-web-server` as an exact development dependency so npm resolves its local `ws` executable. Use SPA fallback for all previews, HTTP/2 for the production preview, and loopback HTTP for the mock-enabled previews. The browser can register the MSW worker on the loopback origin without trusting a local TLS certificate. [local-web-server documentation](https://github.com/lwsjs/local-web-server).

The optimized demo intentionally includes the mock backend. Production must exclude MSW, seeds, worker assets, and test controls; it needs a real API for successful workflows. Inspect import reachability and emitted output, use fresh browser contexts/separate origins, and verify worker scope/readiness. Clean only the selected app output, preserving built libraries. See [profile verification](4-MSW-Integration-Plan.md#5-startup-worker-lifecycle-and-build-profiles).

Use `sideEffects: false` for packages whose modules are safe to discard when unused. Review styles and any import-time initialization first; a package with necessary side effects must list those files instead of claiming everything is side-effect-free. Keep global styles explicit in app/catalog build configuration. Inspect the production build for missing CSS, unexpected eager feature code, and accidentally bundled stories/test utilities. This is an optimization contract that must be verified, not a fix applied blindly to every manifest. [Angular package format](https://angular.dev/tools/libraries/angular-package-format), [tree shaking and CSS side effects](https://webpack.js.org/guides/tree-shaking/).

## 12. Assumptions and decisions to document

| Topic                        | Planned decision                                                                                                                                                                 | Basis                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Workspace                    | Root Angular CLI workspace, `apps/disputes`, and the four requested library groups.                                                                                              | Explicit user preference; CLI supports the layout without Nx.                                  |
| Delivery order               | Integrate each tool separately, finish the shared kit with stories, then implement features.                                                                                     | Explicit user request for gradual integration and reviewable stages.                           |
| Styling                      | Tailwind with semantic CSS custom properties.                                                                                                                                    | Replaces the earlier SCSS-first choice.                                                        |
| Test responsibilities        | Vitest for units/integration, Vitest with the Playwright provider for browser components, Playwright Test for all E2E/browser workflows, and Storybook for catalog interactions. | Explicit user decision on 14 November; each suite has a distinct owner and isolated discovery. |
| Component documentation      | Mandatory shared-component stories and JSDoc/Compodoc API documentation.                                                                                                         | Explicit user request.                                                                         |
| Form submission              | `FormRoot` and Signal Forms `submit()`, shared by Enter and the submit button.                                                                                                   | Explicitly confirmed after checking the current API.                                           |
| Naming/visibility            | `$signal`, `observable$`, private implementation, protected template members, public contracts.                                                                                  | Latest user preference supersedes the review's original signal-naming recommendation.          |
| Exact dependencies           | Pin owned declarations and lock resolved installs; recheck peers at each integration.                                                                                            | User-requested version policy.                                                                 |
| Persistence                  | Reset to fixtures on reload.                                                                                                                                                     | Mock data is required; persistence is unspecified.                                             |
| Mock backend                 | MSW 3 with normal Angular HTTP calls and an in-memory mock repository.                                                                                                           | Later user request supersedes the direct-store/no-HTTP assumption.                             |
| Profiles                     | Development and optimized demo use MSW; production excludes all mocks.                                                                                                           | User explicitly confirmed a separate demo artifact because no real backend is supplied.        |
| Pending mutations            | Temporarily lock duplicate actions and dialog dismissal, announce busy state, restore dismissal on failure.                                                                      | User-approved extension for asynchronous requests; finite timeouts prevent indefinite locks.   |
| Optional features            | Include success toasts and keyboard accessibility.                                                                                                                               | Confirmed during planning.                                                                     |
| Toast implementation         | Use Material MatSnackBar and custom presentation.                                                                                                                                | Reuses package behavior as requested.                                                          |
| Accessibility infrastructure | Use CDK Dialog and native semantics.                                                                                                                                             | Matches the widgets present in this scope.                                                     |
| Currency default             | Start unselected.                                                                                                                                                                | Matches empty and invalid form figures.                                                        |
| Creation date                | Current local calendar date at save time.                                                                                                                                        | The written requirement says today.                                                            |
| Number allocation            | Monotonic within the session, starting at 6229.                                                                                                                                  | Preserves uniqueness after deletion and matches Figure 1.6b.                                   |
| Create-modal dismissal       | Cancel, close icon, Escape, and backdrop discard the draft before submission/after failure; temporarily locked while pending.                                                    | Original consistency choice plus the confirmed asynchronous behavior.                          |
| Button order                 | Cancel on the left, primary/danger action on the right.                                                                                                                          | Matches the figures.                                                                           |
| Touch validation             | Blur reveals that field's error; submit reveals all invalid fields.                                                                                                              | Interprets touched behavior without flagging untouched fields prematurely.                     |
| Text values                  | Trim outer whitespace; reject whitespace-only required input.                                                                                                                    | Prevents empty business values.                                                                |
| Amount entry                 | Native numeric field with ungrouped decimal input.                                                                                                                               | Resolves grouped-value artwork versus native number-input behavior.                            |
| Extra decimals               | Reject literal input with more than two fractional digits, including trailing zeroes.                                                                                            | Follows Figure 2.0's no-rounding rule.                                                         |
| Removal toast duration       | Five seconds.                                                                                                                                                                    | Aligns with the specified creation duration.                                                   |
| Focus after deletion         | Next row, previous row, or New Dispute.                                                                                                                                          | The original trigger is removed from the DOM.                                                  |
| User/language indicators     | Static prototype context.                                                                                                                                                        | No account or localization workflow is specified.                                              |
| Responsive layout            | Preserve data through table scrolling and adaptive dialogs; verify phone workflows.                                                                                              | Explicitly requested by the user after the POC review.                                         |

These decisions are sufficient to start implementation. Revisit a decision if further instructions change its assumptions; routine library configuration and visual refinement do not require separate approval.

## 13. Handover and interview preparation

The application README should contain:

- Supported Node/npm versions and commands to install and start from the repository root.
- Library dependency order/watch workflow, production build/preview, lint, formatting, Vitest unit/browser component tests, Playwright E2E, Storybook, Compodoc, and story-test commands.
- A short architecture explanation, including why signals and Signal Forms fit this scope.
- The division between CDK/Material behavior and application-specific presentation.
- Money/date handling, ID allocation, persistence behavior, and documented ambiguities.
- MSW startup, API contracts, per-page reset, worker regeneration during installation and startup, test scenarios, and development/demo/production differences. Document `build:demo` plus `serve:dist:demo` as the interview path and the production artifact's real-API requirement.
- Actual verification results and any known limitations.
- A concise demonstration script covering creation errors, successful creation, removal cancellation, confirmed removal, and recovery from an empty list.

Introduce scripts as their stages are completed. Keep the supported build, preview, test, and catalog commands in the [README](../README.md), including the `test:all` entry point and browser installation instructions.

For the assignment's 40-minute presentation slot, prepare approximately five minutes on requirements and assumptions, ten minutes of live workflows, ten minutes on architecture/forms/state, ten minutes on testing/accessibility, and five minutes on tradeoffs and possible next steps. The separate team introduction, questions, and wrap-up remain outside that slot.

## 14. Definition of done

- [ ] The application uses a verified latest-stable Angular toolchain with exact repository-owned dependency declarations and a reproducible lockfile.
- [ ] The Angular CLI workspace uses the agreed `apps`/`libs` layout, public APIs, enforced dependency boundaries, and a clean dependency-order build.
- [ ] Tailwind and CSS-variable tokens render consistently in the app and shared component catalog.
- [ ] Every shared UI component has documented public APIs, Storybook states, and meaningful story checks.
- [ ] Vitest unit/browser component tests, Playwright E2E, and Storybook interaction tests run with isolated configuration; Angular code remains zoneless.
- [ ] Every assignment-required workflow maps to passing E2E coverage.
- [ ] The optimized demo completes workflows with MSW; separate production output contains no mocks, seeds, worker asset, or test controls.
- [ ] Worker readiness, session reset, HTTP contracts, loading/error states, and confirmed-only mutations are verified.
- [ ] Preview commands, image optimization, side-effect declarations, and lazy/deferred loading decisions are verified against built output.
- [ ] All three supplied disputes, values, statuses, and initial ordering match the assignment.
- [ ] The overview, creation modal, confirmation modal, empty state, and input states match the figures and copy.
- [ ] Required validation timing, messages, precedence, and immediate error clearing work.
- [ ] Creation sets the correct number, status, local date, order, and count without duplicate submissions.
- [ ] Removal changes only the selected row after confirmation; enabled cancellation paths preserve data and pending dismissal locks are accessible and temporary.
- [ ] Numbering remains correct after deletion and recreation from an empty state.
- [ ] Both package-backed success notifications show the correct content and disappear after five seconds.
- [ ] Keyboard navigation, focus containment/restoration, field semantics, and readable contrast are verified.
- [ ] Desktop and narrow-screen workflows are usable, with no clipped essential controls.
- [ ] Lint, formatting checks, meaningful tests, and the production build pass.
- [ ] The running app has no unexplained console errors or missing assets in the verified workflows.
- [ ] Setup, decisions, assumptions, verification, and the interview walkthrough are documented in English.

The [delivery verification](6-Delivery-Verification.md) records the results of checking the implemented application against this checklist and the original assignment PDF.
