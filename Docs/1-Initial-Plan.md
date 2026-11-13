# Initial Implementation Plan

Date: 13 November 2026

Status: Planning only

Revision: Updated after the POC review and the user's workspace, tooling, component-library, and incremental-delivery decisions. This revision supersedes the original single-application layout, SCSS-first styling, Vitest selection, and optional Storybook recommendation.

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

Build a small shared component catalog with Storybook, Compodoc, and component interaction tests before assembling the business features. Add Tailwind, Prettier, Jest, Cypress, and Playwright in separate verified steps. Phone usability is now an explicit project requirement, although the PDF supplies desktop references only. These additions expand the engineering scope, not the business workflows or seed data.

### Scope boundaries

The initial implementation will use in-memory data and reset to the supplied sample records on a full page reload. No backend, authentication, real invoice or comment management, filtering, sorting, pagination, editing, currency conversion, or deployment is required. The removal description must still include the supplied wording about comments and linked invoices.

The prototype's language indicator and user name provide visual context; they do not imply a localization system or account menu. Render them as static information unless an actual interaction is subsequently requested. The active Disputes navigation item can link to the overview.

## 3. Framework and tooling decisions

### Angular version

On 13 November 2026, the published `latest` version of `@angular/core` is **22.2.6**. Angular 22 is the appropriate stable major version for this assignment. Use the latest stable patch available when implementation begins, verify the release again, and record the installed versions in the lockfile. Avoid `next`, release-candidate, and experimental APIs in required functionality. Sources: [package release metadata](https://registry.npmjs.org/@angular/core/latest) and [Angular release policy](https://angular.dev/reference/releases).

Use a compatible Angular CLI and CDK release from the same major version; verify their own release numbers and peer dependencies instead of assuming every package has the same patch number.

| Area | Proposed choice | Reason |
| --- | --- | --- |
| Framework | Angular 22, latest stable patch | Matches the requested current Angular stack. |
| Runtime | Node.js 24, a supported patch at or above 24.15.0 | Meets Angular 22's published compatibility range. |
| Language | Strict TypeScript 6.0.x | Angular 22 currently requires TypeScript `>=6.0.0 <6.1.0`. |
| Package management | npm, exact direct dependency versions, committed `package-lock.json` | Reproducible `npm ci`; configure `save-exact=true` and review upgrades explicitly. |
| Workspace | Angular CLI multi-project workspace with `apps/` and `libs/` | Supports the requested library layout without Nx or custom builders. |
| Application model | Standalone components and application providers | Keeps imports and dependencies explicit. |
| Change detection | Zoneless, with OnPush-compatible components | Fits signal-driven state and avoids a Zone.js dependency. |
| Forms | Stable Angular Signal Forms | Integrates typed form values, validation, and interaction state. |
| State | A small feature-local injectable store using signals | Sufficient for one collection and two mutation operations. |
| Dialog infrastructure | Angular CDK Dialog with custom styles | Provides focus and overlay behavior while retaining the supplied appearance. |
| Notifications | Angular Material `MatSnackBar` with custom content | Reuses an existing package for timing, replacement, positioning, and announcements. |
| Styling | Tailwind utilities and semantic CSS custom properties | User preference; shared tokens preserve the prototype's palette and responsive behavior. |
| Unit/integration tests | Jest, compatible `jest-preset-angular`, zoneless TestBed | User preference; a separate integration step replaces generated unit-runner configuration. |
| Business E2E tests | Cypress | Complete black-box coverage of assignment workflows and future features. |
| Browser verification | Playwright with axe | Targeted cross-browser, accessibility, focus, responsive, and visual coverage. |
| Shared component catalog | Storybook with Compodoc and executable stories | Documents public APIs and verifies isolated UI behavior before feature assembly. |
| Static quality | Angular ESLint and Prettier | Consistent TypeScript, templates, styles, and documentation. |
| Production preview | Pinned `local-web-server`, exposed through `serve:dist` | Serves the built SPA with route fallback and HTTP/2. |

Angular's [compatibility matrix](https://angular.dev/reference/versions) is the source for runtime and language versions. Use the CLI-compatible RxJS 7.x dependency where required; it does not need to become the application's state-management mechanism. Check the development machine's Node/npm versions before scaffolding and document the supported runtime in the README and version configuration.

### Modern Angular features to use deliberately

- Bootstrap with `bootstrapApplication` and standalone imports.
- Use `signal` for mutable state and `computed` for derived values such as the row count.
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

The requested stack is viable in principle, but the versions actually installed must pass their own integration checks. The current [jest-preset-angular source manifest](https://github.com/thymikee/jest-preset-angular/blob/main/package.json) declares Angular 20-22 and Jest 30 compatibility, and its [TestBed guide](https://thymikee.github.io/jest-preset-angular/docs/getting-started/testbed-environment) provides `setupZonelessTestEnv`. This supports using Jest without adding Zone.js; it does not replace checking the published release selected at implementation time.

The current [Storybook Angular guide](https://storybook.js.org/docs/get-started/frameworks/angular) supports Angular 18-22 and Compodoc integration. Start with its supported Angular renderer and a zoneless signal-input fixture. The historical [signal-input issue](https://github.com/storybookjs/storybook/issues/25784) was closed as completed; retain signal inputs, including aliases and required values, and verify their generated controls/docs rather than carrying over the old exception.

Keep application Jest, Cypress, Playwright, and Storybook test configuration separate, including TypeScript `types`, file patterns, and browser settings. Do not retain Vitest as a second application unit runner. If the chosen Storybook renderer requires a distinct runner, document that dependency separately; never assume a Vite-only addon works with a Webpack renderer. Do not use forced peer resolution to conceal unsupported combinations.

## 4. Requirement interpretation and acceptance criteria

### 4.1 Overview and initial data

The initial screen must show the dark blue navigation bar, GSCF logo, active Disputes item, page title `Disputes`, and a top-right primary `New Dispute` button with a plus icon.

Use these columns, in this order: `Dispute No.`, `Buyer`, `Status`, `Dispute Date`, `Amount`, `Currency`, `Dispute Reason`, and `Actions`.

| Dispute No. | Buyer | Status | Dispute Date | Amount | Currency | Dispute Reason |
| --- | --- | --- | --- | --- | --- | --- |
| 6228 | Alpine Logistics AG | New | 25 Apr 2026 | 24,000,000.00 | USD | Copy of Invoices |
| 6227 | Northwind Traders | New | 22 Apr 2026 | 16,450,000.00 | USD | Freight: Freight Charges Disputed |
| 6224 | Helvetia Foods GmbH | Acknowledged | 18 Sep 2026 | 18,350,500.00 | USD | Tax: When either the invoice didn't include tax or tax is not applicable |

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

| Field or condition | Exact required message |
| --- | --- |
| Buyer empty | `Enter a buyer name.` |
| Dispute Reason empty | `Enter a dispute reason.` |
| Dispute Amount empty | `Enter a dispute amount.` |
| Dispute Amount zero or negative | `Enter an amount greater than 0.` |
| Dispute Amount with more than two decimals | `Enter an amount with up to 2 decimals.` |
| Currency unselected | `Select a currency.` |

The amount validator reports one error at a time. For valid numeric syntax, evaluate missing value first, nonpositive value second, and decimal precision third. For example, `-12.345` must show the greater-than-zero message. Never round an invalid amount into a valid value.

Also reject malformed, non-finite, or unrepresentable numeric input. The PDF does not provide copy for these cases; proposed supplemental messages are `Enter a valid dispute amount.` and `Enter a smaller dispute amount.`. These are implementation safeguards, not additional business requirements.

Replicate the field states in Figure 2.0:

| State | Planned treatment |
| --- | --- |
| Default | Neutral border, gray placeholder, required marker, no error. |
| Hover | Darker border and text cursor without changing label or message. |
| Focused | Visible blue focus treatment; placeholder remains until typing starts. |
| Focused while typing | Focus treatment and the current value. |
| Filled and blurred | Normal border and retained valid value. |
| Empty with error | Red border, warning icon, required marker, and red error text below. |
| Focused with error | Error remains until corrected, with an independently visible focus indication. |
| Invalid amount | The relevant single error message and preserved input; no silent rounding. |

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

| Operation | Title | Body example |
| --- | --- | --- |
| Create | `Dispute created` | `Dispute 6229 has been created.` |
| Remove | `Dispute removed` | `Dispute 6228 has been removed.` |

Creation toasts disappear after five seconds as required. Use the same duration for removal as a documented consistency decision. A new operation replaces the previous toast. Delegate notification lifetime, replacement, positioning, dismissal, and live announcements to Angular Material's `MatSnackBar`; do not implement a custom toast engine or timer service.

Configure a polite announcement and keep keyboard focus in the workflow. Keep the toast inside the viewport on small screens.

## 5. Application architecture

### Angular CLI workspace and library boundaries

Angular CLI supports multiple applications and libraries in one workspace. Create an empty workspace with `--no-create-application`, then generate projects at explicit roots. The library generator supports `--project-root`, so the requested layout does not require Nx. Keep one root `angular.json`, npm manifest, and lockfile. See [multi-project workspaces](https://angular.dev/reference/configs/file-structure) and [library generator options](https://angular.dev/cli/generate/library).

The intended layout is below. Generate libraries when their implementation stage begins; do not create empty projects for every conceivable future feature.

```text
apps/
  disputes/
    public/
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
libs/
  core/
    src/
      lib/clock/
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
          dispute.model.ts
          dispute.fixtures.ts
          disputes-store.ts
          disputes-store.spec.ts
          dispute-amount.ts
          dispute-amount.spec.ts
          dispute-date.ts
          dispute-date.spec.ts
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
            dispute-form.schema.ts
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
  jest/setup.ts
  cypress/
    e2e/
    support/
  playwright/
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
jest.config.ts
cypress.config.ts
playwright.config.ts
tsconfig.json
tsconfig.compodoc.json
Docs/
Instructions/
AGENTS.md
README.md
```

Each CLI library also has its generated package/build/TypeScript configuration. Shared components colocate their `*.stories.ts`, focused `*.spec.ts` where needed, templates, and optional CSS. The tree lists locations, not a requirement to wrap every native element. Use native-element directives where they preserve semantics more simply than wrapper components.

| Layer | Responsibility | Allowed application-layer dependencies |
| --- | --- | --- |
| `libs/core` | Cross-cutting infrastructure and tokens, such as the controllable current-date source. | No feature, data-access, or UI imports. |
| `libs/data-access/*` | Domain models, fixtures, pure domain helpers, stores, and future API boundaries. | Core; no UI/feature imports. |
| `libs/ui/*` | Presentational components and UI-only adapters/behavior. | Other explicitly approved UI libraries and small core tokens; no feature stores. |
| `libs/feature/*` | Business pages, form schemas, dialogs, and orchestration. | Core, UI, and its own data-access library. |
| `apps/*` | Bootstrap, global providers/assets, shell, and feature route registration. | Public APIs of the layers above; business features are lazy imports. |

Enforce these boundaries with ESLint restrictions and cycle checks rather than assuming folder names enforce them. Keep the distinction between package/public API names and physical folders explicit, for example `@gscf/disputes-data-access` can map to the library rooted at `libs/data-access/disputes`.

Use CLI-generated `ng-packagr` libraries and their public entry points. Keep consumer aliases pointed at built library outputs, and build dependencies before consumers. Provide a documented dependency order and watch workflow using ordinary scripts; Angular CLI is not an Nx task scheduler. Do not bypass packaging with private source imports just to make a build pass. Verify a clean build without pre-existing `dist` artifacts. [Angular library guidance](https://angular.dev/tools/libraries/creating-libraries).

For deferred UI, inspect the packaged entry-point boundary as well as the template: a flattened library entry point already used eagerly may prevent the desired split. Add a separate public entry point only when the measured loading requirement justifies it. Keep stories and test-only exports out of production public APIs.

### Shared component catalog before feature assembly

Build only the kit needed by the assignment: native button/icon-button treatments, icons and badges, a CDK-compatible dialog frame, accessible field labels/errors, basic text/radio presentation, and package-backed success notification presentation. The disputed amount's raw-input/precision rules remain feature/domain responsibilities; a generic numeric field must not normalize invalid input away.

Every shared component receives JSDoc on public inputs/outputs/models and a story covering its applicable default, focus, disabled, error, narrow-screen, and content-length states. Interactive stories use `play` functions for black-box behavior assertions. Static stories verify rendering and semantics instead of inventing artificial interactions. Stories are part of completing a component, not documentation deferred until the final application is done.

Compodoc emits JSON for Storybook Autodocs. Verify that signal inputs, aliases, required inputs, models, and outputs appear with useful descriptions. Supply explicit `argTypes` or documentation where extraction is incomplete without replacing modern component APIs. Compodoc documents APIs; it does not execute tests. A supported Storybook runner executes the story assertions. For the documented Angular/Webpack integration, `@storybook/test-runner` is a candidate backed by Jest and Playwright; validate it independently from application Jest. [Storybook test-runner guide](https://storybook.js.org/docs/writing-tests/integrations/test-runner).

Keep the empty-state markup within the overview unless it becomes substantial. Do not build a generic grid, modal framework, toast lifecycle, or broad CVA base class as part of the kit.

### Responsibilities and data flow

| Part | Responsibility |
| --- | --- |
| Application shell | Navigation, route outlet, and global styling. |
| Disputes overview | Coordinates user actions, opens dialogs, invokes store commands, and requests notifications. |
| Disputes table | Displays immutable records and emits a removal request with the selected dispute. |
| Creation dialog | Owns an isolated form draft, field validation, and the valid creation result. |
| Removal dialog | Presents the selected record and returns an explicit confirmation or cancellation. |
| Disputes store | Owns the collection and numbering sequence; validates and applies create/remove commands. |
| Amount/date functions | Perform deterministic normalization and display formatting. |
| Notification adapter | Supplies application copy and appearance to `MatSnackBar`. |

The overview provides the store from `libs/data-access/disputes` for the feature. Use `@Service({ autoProvided: false })` with the explicit overview provider so its lifetime remains feature-scoped. It exposes readonly signals, while presentational components receive data through typed inputs. Dialog results are typed; a dismissal result must never be interpreted as confirmation. Only store commands can mutate the collection.

For creation, the dialog returns validated data and the overview commits it once. The returned created record supplies the actual number used in the toast. For removal, pass a snapshot of the selected record to the dialog and remove by its stable number after explicit confirmation. Guard against repeated callbacks or a record that is already absent.

### Domain model

Use narrow types and immutable records. A proposed model is:

```ts
type Currency = 'USD' | 'EUR';
type DisputeStatus = 'New' | 'Acknowledged';

interface Dispute {
  readonly number: number;
  readonly buyer: string;
  readonly status: DisputeStatus;
  readonly disputeDate: string;
  readonly amountMinorUnits: number;
  readonly currency: Currency;
  readonly reason: string;
}
```

`disputeDate` is a validated calendar-date string in `YYYY-MM-DD` format. `amountMinorUnits` is an integer number of cents. The form draft is a separate type and may contain incomplete values; invalid draft data must not enter the collection.

### State management and numbering

- Initialize a private writable signal from a fresh copy of the three fixtures.
- Expose a readonly disputes signal and computed count/empty-state values.
- Use immutable prepend and filter operations for creation and removal.
- Initialize a separate next-number value to the highest seeded number plus one.
- Increment that value only after successful creation; never recompute it from the remaining rows after deletion.

This produces `6229` when creating after deleting all original rows, matching Figure 1.6b. If `6229` has already been created and removed, the next dispute is `6230`. Reloading starts a new mock session and resets both records and numbering.

No artificial network delay or HTTP layer is needed. The store's small public API leaves room for a real data service later without adding unused infrastructure now.

## 6. Form, money, and date implementation

### Signal Forms

Use a typed signal model with `form`, `FormField`, and schema-based validation from `@angular/forms/signals`. These APIs are stable in Angular 22, as documented by the [form API](https://angular.dev/api/forms/signals/form) and [FormField API](https://angular.dev/api/forms/signals/FormField).

The user confirmed using `FormRoot` and the Signal Forms `submit()` lifecycle instead of requiring `ngSubmit`. Bind the native form through `FormRoot`, configure the submission action, and use a real submit button. Enter and clicking the button must invoke the same validation/submission path exactly once. Do not combine a second manual submit handler with `FormRoot`'s configured submission action. This preserves centralized submission without importing classic form directives solely for their event names. [Signal Forms submission](https://angular.dev/guide/forms/signals/form-submission).

Define validation in a small feature-specific schema and pure amount-validation function. Render each error from its field state and the submitted/touched policy described above. Keep submission handling centralized so clicking Create Dispute and pressing Enter follow the same path. Use native text and radio inputs directly wherever possible. See the [Signal Forms overview](https://angular.dev/guide/forms/signals/overview) and [validation guidance](https://angular.dev/guide/forms/signals/validation).

### Numeric input and precision

Preserve the entered amount text until validation succeeds. Converting too early can lose information about decimal precision. Angular's native Signal Forms number binding converts values to numbers, so evaluate the amount control separately from the ordinary text fields. See [numeric input binding](https://angular.dev/essentials/signal-forms).

The proposed solution is a narrowly scoped amount-field component implementing the stable Signal Forms custom-control contract. It wraps a native `type="number"` input, retains the raw decimal string and native bad-input state, and exposes the required focus/touched/disabled behavior. It should not become a general form-control framework. Use the documented [custom-control interface](https://angular.dev/guide/forms/signals/custom-controls).

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

Use one date formatter for the table with an explicit English locale and the required `d MMM yyyy` output. Store sample dates as date-only values and avoid reparsing them through a timezone-sensitive UTC conversion. Inject a small current-date function or clock token into the store so tests can freeze the date without depending on the machine's clock.

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

Measure proportions from the embedded figures rather than interpreting their scaled-down PDF text as actual browser font sizes. Keep body and form text readable. Use a small, consistent SVG icon set for plus, bin, close, warning, and check icons; decorative icons should inherit color and not require an external icon-font request.

### Design tokens

Define the supplied colors once as CSS custom properties and use semantic aliases where helpful. Preserve the mapping to the brief's token names in the stylesheet.

Use Tailwind utilities as the primary styling language, mapped to the semantic variables through the current Tailwind CSS-first theme configuration. A small CSS layer remains appropriate for tokens, fonts, CDK structural styles, and Material theme integration. A Sass file may be used narrowly if required by a package's theming API; it does not make the application SCSS-first. Keep one GSCF theme; no theme switcher or user-color editor is implied.

Configure Tailwind source detection for `apps/`, every UI/feature library, and the story files. Use complete utility names in variant maps rather than concatenated fragments. Confirm that a library-only class appears in both the application build and Storybook build. Share the same token/font stylesheet with the catalog. See [Tailwind source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files).

| Prototype token | Value | Use |
| --- | --- | --- |
| `gscf/neutral/110` | `#292929` | Body text, labels, values, and table cells. |
| `gscf/neutral/80` | `#525252` | Table headings and secondary icons. |
| `gscf/neutral/90` | `#464646` | Row counter. |
| `gscf/neutral/70` | `#656565` | Placeholders. |
| `gscf/neutral/60` | `#7C7C7C` | Default input and radio borders. |
| `gscf/neutral/30` | `#DCDCDC` | Table dividers and cell borders. |
| `gscf/neutral/20` | `#EDEDED` | Disabled input background if needed. |
| `gscf/neutral/40` | `#BDBDBD` | Disabled placeholder if needed. |
| `gscf/neutral/0` | `#FFFFFF` | Page/modal surfaces and filled-button text. |
| `gscf/blue/90` | `#13375A` | Navigation and headings. |
| `gscf/blue/100` | `#0E2743` | Input hover border. |
| `gscf/blue/A70` | `#0055A4` | Primary actions, secondary borders/text, focus, selected radios, and New badge text. |
| `gscf/blue/10` | `#E5EEF9` | New badge background. |
| `gscf/yellow/10` | `#FEF9C3` | Acknowledged badge background. |
| `gscf/yellow/80` | `#854D0E` | Acknowledged badge text. |
| `gscf/red/70` | `#B91C1C` | Errors, required markers, removal actions, and danger button. |
| `gscf/green/60` | `#3A8B25` | Toast check icon and 3 px outline. |
| Backdrop | `#0D1A33` at 50% opacity | Modal dimming layer. |

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

Use Jest for pure functions, the store, and focused feature logic. Every feature receives meaningful colocated `*.spec.ts` coverage. Prefer small TypeScript-focused white-box tests that select important paths and edge cases, without making private members public just for tests. Use `jest-preset-angular` and its zoneless TestBed setup for Angular-dependent tests; do not claim this is the CLI's default runner. Remove or replace unused generated Vitest targets in the dedicated Jest integration stage.

- Fixtures retain their exact values and initial ordering.
- Creation prepends a record, assigns New, uses the controlled current date, and updates the count.
- IDs increase correctly after removing the highest number and after removing all rows.
- Invalid creation does not change data or consume an ID.
- Removal changes only the requested record, and repeated removal does not affect another row.
- Amount validation distinguishes empty, nonpositive, precision, malformed, and unsafe values with the correct precedence.
- Cover `0`, `-1`, `-12.345`, `0.01`, `1`, `1.2`, `1.23`, `1.230`, `12.345`, whitespace, invalid syntax, and supported large amounts.
- Amount parsing and formatting preserve cents and always produce two display decimals.
- Date formatting and the injected current-date function handle local calendar boundaries.

### Component integration tests

Use Jest/TestBed with realistic interaction and the production form schema for feature integration. Shared UI components additionally have Storybook `play` tests that exercise their public behavior and appearance. A preference for TypeScript-only unit tests does not exclude DOM tests for bindings, validation timing, and focus:

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

Do not re-test every internal behavior of CDK or Material. Test the application's configuration and integration, then confirm user-visible behavior in a real browser.

### End-to-end scenarios

Use [Cypress](https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test) as the primary business-workflow E2E runner. Use accessible role/label queries through compatible testing helpers, or stable intent-based selectors where necessary. Keep tests black-box and reset data through isolated page loads. Every feature and every PDF-required behavior must map to at least one E2E scenario:

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

Run the complete Cypress business suite in a supported Chromium browser. Use [Playwright](https://playwright.dev/docs/intro) for targeted Chromium/Firefox/WebKit checks, particularly numeric-input behavior, keyboard/focus, mobile sizing, and visual comparisons. Cypress remains the traceable owner of business acceptance coverage; the Playwright suite is not a second copy of every business test. Browser engines bundled for Storybook do not by themselves constitute application E2E coverage.

Control the clock and browser environment for deterministic date assertions, with runner-specific setup. A reload should reset the mock data, making every test and demonstration repeatable. Keep an acceptance matrix mapping the requirements in section 4 to concrete Cypress tests and supplementary Playwright checks as tests are implemented.

### Visual and accessibility checks

Compare browser screenshots against Figures 1.1-1.6 and inspect every Figure 2.0 input state. Check typography, spacing, column proportions, modal positioning, error-icon alignment, button order, colors, and toast appearance.

Use [axe through Playwright](https://playwright.dev/docs/accessibility-testing) on the overview, creation modal, error state, removal modal, and empty state. Supplement automated checks with a full keyboard walkthrough, text contrast inspection, and a screen-reader smoke test where available. Automated checks alone do not establish accessibility compliance.

## 11. Incremental implementation sequence

Complete the stages in order. Add one tool or architectural concern per reviewable change, run the checks relevant to that change, and record actual results before proceeding to dependent work. Scaffolding stages must leave a usable build, even before domain functionality exists. Do not install all tools together and postpone integration failures until the application is finished.

| Stage | Work introduced in this step | Exit criteria |
| --- | --- | --- |
| 0. Compatibility baseline | Verify current stable Angular/CLI, Node/TypeScript, and the requested toolchain's peer ranges; record intended exact versions and any constraint. | A compatible plan exists without forced peer resolution, a hidden Angular downgrade, or an unapproved tool substitution. |
| 1. CLI workspace | Generate the empty root workspace and `apps/disputes` shell; establish strict TypeScript/templates, standalone/zoneless defaults, npm exact-save policy, project roots, and the build output path. Prepare public-library conventions without generating the entire kit. | Clean installation and production shell build work; no Zone.js runtime, no unintended generated attribution, and existing documents/reference files remain intact. |
| 2. Prettier | Add formatting config, ignore rules, and format/check scripts only. | Formatting covers owned source/config/docs; generated output and `TMP` are excluded. |
| 3. ESLint and boundaries | Add Angular ESLint, template checks, and explicit layer/import restrictions. | Lint passes; a small verification confirms forbidden layer imports are rejected. Remove any temporary invalid fixture after that check. |
| 4. Tailwind and tokens | Add Tailwind/PostCSS, CSS-variable colors, global typography, and app/library/story source detection. | The shell renders token-backed utilities; a production build retains classes from library sources. No business feature is implemented yet. |
| 5. Jest | Integrate the chosen Jest preset, zoneless TestBed setup, isolated TypeScript configuration, and scripts; replace generated unit-runner targets. | A meaningful signal/DOM integration fixture and a pure-function test pass without Zone.js; no duplicate application Vitest runner. |
| 6. Cypress | Add E2E config, support code, isolated types, app startup/readiness, and browser installation instructions. | One shell/navigation smoke test runs reproducibly; the requirement-to-E2E matrix is prepared for later feature tests. |
| 7. Playwright | Add an independent browser-test project, axe integration, viewport/browser settings, and screenshot policy. | Shell accessibility and cross-browser smoke checks run without discovering Cypress/Jest tests. |
| 8. Storybook | Add the supported Angular renderer, shared styles/assets/providers, and catalog configuration. | A small zoneless fixture renders and its required/aliased signal input, output, and model can be exercised. |
| 9. Compodoc | Add JSDoc extraction and generated-JSON integration with Storybook Autodocs. | Descriptions and aliases for the fixture's public signal APIs appear correctly, or explicit documentation fills extraction gaps. Generated files are kept out of source commits. |
| 10. Story component tests | Add the renderer-compatible story test runner and isolated configuration. | A `play` interaction and assertion run against a built/local catalog; failures are reported by a dedicated command. |
| 11. Common UI kit | Implement `ui/common`, `ui/form`, and notification presentation in small component-sized increments. Add CDK/Dialog and Material snack-bar infrastructure when the relevant component needs them. Each component includes its stories/tests before moving on. | Required default, focus, invalid, disabled, mobile, and long-content states are demonstrated; the kit builds with documented APIs and no business-store dependencies. |
| 12. Core and data access | Add the clock token, exact fixtures, domain models, money/date functions, and feature-scoped signal store under the appropriate libraries. | Jest verifies money errors, no rounding, date behavior, prepend/removal, and monotonic IDs. Public APIs and dependency-order builds work. |
| 13. Disputes overview | Add the lazy feature library, table, counter, empty state, and branded navigation using the completed kit. | Seed values/order match the PDF; Cypress verifies populated/empty rendering as applicable; the route is a real lazy boundary. |
| 14. Creation flow | Add the isolated Signal Forms draft/schema, narrow amount control, `FormRoot` submission, validation, cancellation, and success notification integration. | Feature specs and Cypress cover the required errors, USD/EUR creation, exact insertion/defaults, cancellation, clean reopening, and toast behavior. |
| 15. Removal flow | Add the record-specific confirmation, dismissals, mutation, and focus fallback. | Cypress covers all cancellation paths, confirmed removal, last-row removal, recreation, and ID continuity; Playwright checks focus across engines. |
| 16. Production preview and optimization | Add pinned `local-web-server` and `serve:dist`; review package side effects, emitted chunks, static images, budgets, and any justified deferred content. | Built SPA refreshes at `/disputes`; styles/fonts/assets survive optimization; catalog code is absent from app output; any deferred example has stable fallback states. |
| 17. Final integration | Complete the acceptance matrix, desktop/mobile visual review, axe scans, manual keyboard/focus checks, and all configured suites. | Every assignment behavior has E2E coverage; mobile workflows remain usable; full clean build and relevant checks pass with recorded results. |
| 18. Handover | Document root commands, library boundaries/build order, tooling responsibilities, choices, limitations, and demo steps. | Another developer can install, build libraries/app, run each suite/catalog, preview production output, and explain the solution. |

Accessibility and tests start when each component/feature is introduced. Stage 17 consolidates acceptance evidence; it is not the first test or accessibility pass. Within stage 11, finish one shared component and its stories before starting the next. Within stages 13-15, complete one user workflow and its tests at a time.

If a version combination fails its compatibility fixture, resolve that integration before layering dependent features on it. Record an evidence-based alternative for the user if the selected tools cannot coexist; do not silently substitute another unit runner, add Zone.js, or disable required checks.

If commits are requested during implementation, each should describe a completed, independently verifiable step in short English, such as `Configure Tailwind tokens`, `Add zoneless Jest tests`, or `Add shared field stories`. Verified tooling integration is a valid milestone; avoid committing broken scaffolding or unrelated changes together.

### Production preview and tree-shaking verification

Configure the application build base as `dist/apps/disputes`, with browser output under `dist/apps/disputes/browser`; library and Storybook outputs use separate subdirectories. The planned equivalent of the requested server script is:

```json
{
  "serve:dist": "ws --http2 --spa index.html --directory dist/apps/disputes/browser"
}
```

Install `local-web-server` as an exact development dependency so npm resolves its local `ws` executable. This preserves HTTP/2 and SPA fallback without the original shell directory changes or an on-demand `npx` download. Build first, document the local HTTPS behavior, and verify the installed version's options. A separate loopback HTTP server command may be used for automated suites if local certificate handling would otherwise obscure their purpose. [local-web-server documentation](https://github.com/lwsjs/local-web-server).

Use `sideEffects: false` for packages whose modules are safe to discard when unused. Review styles and any import-time initialization first; a package with necessary side effects must list those files instead of claiming everything is side-effect-free. Keep global styles explicit in app/catalog build configuration. Inspect the production build for missing CSS, unexpected eager feature code, and accidentally bundled stories/test utilities. This is an optimization contract that must be verified, not a fix applied blindly to every manifest. [Angular package format](https://angular.dev/tools/libraries/angular-package-format), [tree shaking and CSS side effects](https://webpack.js.org/guides/tree-shaking/).

## 12. Assumptions and decisions to document

| Topic | Planned decision | Basis |
| --- | --- | --- |
| Workspace | Root Angular CLI workspace, `apps/disputes`, and the four requested library groups. | Explicit user preference; CLI supports the layout without Nx. |
| Delivery order | Integrate each tool separately, finish the shared kit with stories, then implement features. | Explicit user request for gradual integration and reviewable stages. |
| Styling | Tailwind with semantic CSS custom properties. | Replaces the earlier SCSS-first choice. |
| Test responsibilities | Jest for units/integration, Cypress for all business workflows, Playwright for targeted browser checks, story runner for common UI. | Keeps all requested tools while avoiding redundant ownership. |
| Component documentation | Mandatory shared-component stories and JSDoc/Compodoc API documentation. | Explicit user request. |
| Form submission | `FormRoot` and Signal Forms `submit()`, shared by Enter and the submit button. | Explicitly confirmed after checking the current API. |
| Naming/visibility | `$signal`, `observable$`, private implementation, protected template members, public contracts. | Latest user preference supersedes the review's original signal-naming recommendation. |
| Exact dependencies | Pin owned declarations and lock resolved installs; recheck peers at each integration. | User-requested version policy. |
| Persistence | Reset to fixtures on reload. | Mock data is required; persistence is unspecified. |
| Optional features | Include success toasts and keyboard accessibility. | Confirmed during planning. |
| Toast implementation | Use Material MatSnackBar and custom presentation. | Reuses package behavior as requested. |
| Accessibility infrastructure | Use CDK Dialog and native semantics. | Matches the widgets present in this scope. |
| Currency default | Start unselected. | Matches empty and invalid form figures. |
| Creation date | Current local calendar date at save time. | The written requirement says today. |
| Number allocation | Monotonic within the session, starting at 6229. | Preserves uniqueness after deletion and matches Figure 1.6b. |
| Create-modal dismissal | Cancel, close icon, Escape, and backdrop discard the draft. | Cancel is explicit; the close icon is shown; other dismissal behavior is a consistency choice. |
| Button order | Cancel on the left, primary/danger action on the right. | Matches the figures. |
| Touch validation | Blur reveals that field's error; submit reveals all invalid fields. | Interprets touched behavior without flagging untouched fields prematurely. |
| Text values | Trim outer whitespace; reject whitespace-only required input. | Prevents empty business values. |
| Amount entry | Native numeric field with ungrouped decimal input. | Resolves grouped-value artwork versus native number-input behavior. |
| Extra decimals | Reject literal input with more than two fractional digits, including trailing zeroes. | Follows Figure 2.0's no-rounding rule. |
| Removal toast duration | Five seconds. | Aligns with the specified creation duration. |
| Focus after deletion | Next row, previous row, or New Dispute. | The original trigger is removed from the DOM. |
| User/language indicators | Static prototype context. | No account or localization workflow is specified. |
| Responsive layout | Preserve data through table scrolling and adaptive dialogs; verify phone workflows. | Explicitly requested by the user after the POC review. |

These decisions are sufficient to start implementation. Revisit a decision if further instructions change its assumptions; routine library configuration and visual refinement do not require separate approval.

## 13. Handover and interview preparation

The application README should contain:

- Supported Node/npm versions and commands to install and start from the repository root.
- Library dependency order/watch workflow, production build/preview, lint, formatting, Jest, Cypress, Playwright, Storybook, Compodoc, and story-test commands.
- A short architecture explanation, including why signals and Signal Forms fit this scope.
- The division between CDK/Material behavior and application-specific presentation.
- Money/date handling, ID allocation, persistence behavior, and documented ambiguities.
- Actual verification results and any known limitations.
- A concise demonstration script covering creation errors, successful creation, removal cancellation, confirmed removal, and recovery from an empty list.

Introduce scripts as their stage is completed: `start`, `build:libs`, `build`, `serve:dist`, `lint`, `format`, `format:check`, `test`, `test:ci`, `test:e2e` (Cypress), `test:e2e:open`, `test:browser` (Playwright), `storybook`, `build-storybook`, `docs:components`, and `test:stories`. Document clean library builds and watch mode explicitly. The README must use the real scripts once they exist and explain browser installation and local HTTPS behavior.

For the assignment's 40-minute presentation slot, prepare approximately five minutes on requirements and assumptions, ten minutes of live workflows, ten minutes on architecture/forms/state, ten minutes on testing/accessibility, and five minutes on tradeoffs and possible next steps. The separate team introduction, questions, and wrap-up remain outside that slot.

## 14. Definition of done

- [ ] The application uses a verified latest-stable Angular toolchain with exact repository-owned dependency declarations and a reproducible lockfile.
- [ ] The Angular CLI workspace uses the agreed `apps`/`libs` layout, public APIs, enforced dependency boundaries, and a clean dependency-order build.
- [ ] Tailwind and CSS-variable tokens render consistently in the app and shared component catalog.
- [ ] Every shared UI component has documented public APIs, Storybook states, and meaningful story checks.
- [ ] Jest, Cypress, Playwright, and story tests run with isolated configuration; Angular code remains zoneless.
- [ ] Every assignment-required workflow maps to passing E2E coverage.
- [ ] Production preview, image optimization, side-effect declarations, and lazy/deferred loading decisions are verified against built output.
- [ ] All three supplied disputes, values, statuses, and initial ordering match the assignment.
- [ ] The overview, creation modal, confirmation modal, empty state, and input states match the figures and copy.
- [ ] Required validation timing, messages, precedence, and immediate error clearing work.
- [ ] Creation sets the correct number, status, local date, order, and count without duplicate submissions.
- [ ] Removal changes only the selected row after confirmation; every cancellation path preserves data.
- [ ] Numbering remains correct after deletion and recreation from an empty state.
- [ ] Both package-backed success notifications show the correct content and disappear after five seconds.
- [ ] Keyboard navigation, focus containment/restoration, field semantics, and readable contrast are verified.
- [ ] Desktop and narrow-screen workflows are usable, with no clipped essential controls.
- [ ] Lint, formatting checks, meaningful tests, and the production build pass.
- [ ] The running app has no unexplained console errors or missing assets in the verified workflows.
- [ ] Setup, decisions, assumptions, verification, and the interview walkthrough are documented in English.

This document defines planned implementation and acceptance checks. It does not claim that the application or its tests have already been built or executed.
