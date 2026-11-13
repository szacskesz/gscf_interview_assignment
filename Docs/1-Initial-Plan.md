# Initial Implementation Plan

Date: 13 November 2026

Status: Planning only

## 1. Objective and source material

Build an Angular application that allows enterprise users to create and remove disputes directly from the Disputes overview. The application must reproduce the supplied workflow, validation behavior, visual language, and sample data using an entirely local mock implementation.

This plan is based on all 12 pages of [the interview assignment](../Instructions/SeniorFrontendEngineer-Interview-Task.pdf), dated 2 November 2026, including Figures 1.1-1.6, the color reference, and the input-state specification in Figure 2.0. The supplied [GSCF logo](../Instructions/GSCF-logo.png) is suitable for the dark navigation background and should be reused.

At the start of planning, the repository contained the assignment and logo, with empty `App` and `Docs` directories. Application implementation will live under `App`. This first stage produces the plan only.

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

Include both success toasts and the accessibility requirements identified as optional in the PDF, as confirmed during planning. Use an existing notification package for toast behavior and established Angular accessibility infrastructure for dialogs. Their implementation should follow the required workflows rather than delaying the first working version.

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
| Package management | npm with committed `package-lock.json` | Straightforward setup and reproducible `npm ci`. |
| Application model | Standalone components and application providers | Keeps imports and dependencies explicit. |
| Change detection | Zoneless, with OnPush-compatible components | Fits signal-driven state and avoids a Zone.js dependency. |
| Forms | Stable Angular Signal Forms | Integrates typed form values, validation, and interaction state. |
| State | A small feature-local injectable store using signals | Sufficient for one collection and two mutation operations. |
| Dialog infrastructure | Angular CDK Dialog with custom styles | Provides focus and overlay behavior while retaining the supplied appearance. |
| Notifications | Angular Material `MatSnackBar` with custom content | Reuses an existing package for timing, replacement, positioning, and announcements. |
| Styling | Component SCSS plus global CSS custom properties | Direct control over the prototype's typography, colors, and spacing. |
| Unit/component tests | Angular CLI's Vitest setup and TestBed | Uses the current default testing integration. |
| Browser tests | Playwright, with selected axe accessibility checks | Exercises real input, focus, layout, and modal behavior. |
| Static quality | Angular ESLint and Prettier | Consistent TypeScript, templates, styles, and documentation. |

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

These choices follow the [Angular style guide](https://angular.dev/style-guide), [input API guidance](https://angular.dev/guide/components/inputs), and [template control-flow guidance](https://angular.dev/guide/templates/control-flow). Zoneless operation is already the default in Angular 21 and later; retain the generated default and verify that no dependency or configuration reintroduces Zone.js. See [zoneless guidance](https://angular.dev/guide/zoneless).

Use a client-rendered application. Server rendering, hydration, a global store library, a generic repository framework, and deferred rendering of this small table would add little value to this task. A single lazy-loaded `/disputes` route with an empty-path redirect is enough; the dialogs do not need separate routes.

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

### Proposed structure

The following is a working structure, not a requirement to create empty abstractions. Keep component templates, styles, and tests alongside their TypeScript files.

```text
App/
  public/
    images/gscf-logo.png
    fonts/
  src/
    app/
      app.ts
      app.html
      app.scss
      app.config.ts
      app.routes.ts
      layout/
        top-navigation/
      disputes/
        dispute.model.ts
        dispute.fixtures.ts
        disputes-store.ts
        disputes-store.spec.ts
        disputes-overview/
        disputes-table/
        create-dispute-dialog/
          create-dispute-dialog.ts
          create-dispute-dialog.html
          create-dispute-dialog.scss
          create-dispute-dialog.spec.ts
          dispute-form.schema.ts
        remove-dispute-dialog/
        amount-field/
        dispute-amount.ts
        dispute-amount.spec.ts
        dispute-date.ts
        dispute-date.spec.ts
      shared/
        notifications/
          notifications.ts
          success-notification.ts
        icons/
    styles/
      _tokens.scss
      _typography.scss
      _controls.scss
    styles.scss
    main.ts
  e2e/
    disputes.spec.ts
    disputes-accessibility.spec.ts
  angular.json
  package.json
  package-lock.json
  playwright.config.ts
  README.md
Docs/
  1-Initial-Plan.md
Instructions/
  SeniorFrontendEngineer-Interview-Task.pdf
  GSCF-logo.png
```

Keep the empty-state markup inside the overview unless it becomes substantial. Do not extract every visual element into a component. Shared code should represent actual reuse, such as notification presentation or the small icon set.

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

The overview provides the store for the feature. It reads readonly signals, while presentational components receive data through typed inputs. Dialog results are typed; a dismissal result must never be interpreted as confirmation. Only store commands can mutate the collection.

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

Use Montserrat with locally served font files and appropriate license attribution. Load only the weights actually needed, with a fallback sans-serif stack and `font-display: swap`. This avoids depending on a third-party font request during the live demonstration. Copy the provided logo into the application's public assets and specify its intrinsic dimensions.

Measure proportions from the embedded figures rather than interpreting their scaled-down PDF text as actual browser font sizes. Keep body and form text readable. Use a small, consistent SVG icon set for plus, bin, close, warning, and check icons; decorative icons should inherit color and not require an external icon-font request.

### Design tokens

Define the supplied colors once as CSS custom properties and use semantic aliases where helpful. Preserve the mapping to the brief's token names in the stylesheet.

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

The PDF defines desktop views only. Proposed narrow-screen behavior:

- Let the page heading/action row wrap when needed.
- Keep all eight table columns available in a horizontal scrolling region rather than hiding required data.
- Allow the table region to be keyboard-scrollable when it overflows, with an accessible name.
- Size dialogs to the viewport with side margins, a maximum height, and internal vertical scrolling.
- Keep errors, currency options, and footer buttons usable without horizontal clipping.
- Position notifications within safe viewport margins.

Review at approximately 1440 px, 1024 px, 768 px, and 375 px widths, plus browser zoom. These are verification points rather than additional product breakpoints mandated by the brief.

## 10. Testing and verification

Tests should demonstrate observable behavior and protect the business rules. Avoid tests that merely restate implementation details or pursue a coverage percentage without useful assertions.

### Unit tests

Use the CLI's [Vitest integration](https://angular.dev/guide/testing) for pure functions and the store:

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

Use TestBed with realistic interaction and the production form schema:

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

Use [Playwright](https://playwright.dev/docs/intro) with role/label-based locators and isolated page loads:

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

Run the full interaction suite in Chromium and targeted smoke checks in Firefox and WebKit, particularly for number-input behavior and focus. Freeze the clock and timezone for deterministic date assertions. A reload should reset the mock data, making every test and demonstration repeatable.

### Visual and accessibility checks

Compare browser screenshots against Figures 1.1-1.6 and inspect every Figure 2.0 input state. Check typography, spacing, column proportions, modal positioning, error-icon alignment, button order, colors, and toast appearance.

Use [axe through Playwright](https://playwright.dev/docs/accessibility-testing) on the overview, creation modal, error state, removal modal, and empty state. Supplement automated checks with a full keyboard walkthrough, text contrast inspection, and a screen-reader smoke test where available. Automated checks alone do not establish accessibility compliance.

## 11. Implementation sequence

| Stage | Work | Completion check |
| --- | --- | --- |
| 1. Project foundation | Verify package versions and peer dependencies; scaffold under `App`; configure strict typing, routing, linting, formatting, and tests. | A clean install can start, test, and build the app. |
| 2. Design foundation | Add Montserrat, the supplied logo, tokens, shared control styles, navigation, and page shell. | The base overview matches the reference structure and branding. |
| 3. Data and table | Add domain types, exact fixtures, the signal store, numbering, formatters, table, counter, and empty branch. | Seed data and formatting match; core store tests pass. |
| 4. Creation flow | Add CDK Dialog, Signal Forms schema, amount control, all input states, submission, and cancellation. | Invalid input cannot save; a valid dispute is inserted first with the correct defaults. |
| 5. Removal flow | Add record-specific confirmation, all dismissal paths, removal, and post-removal focus behavior. | Only confirmed removal changes data, including the last-row case. |
| 6. Notifications and polish | Integrate MatSnackBar, finish keyboard/ARIA behavior, refine responsive layouts and visual details. | Both notifications and all agreed accessibility interactions work. |
| 7. Verification | Complete focused unit/component/browser coverage and visual/accessibility review. | Required workflows pass with no known blocking defects. |
| 8. Handover | Write setup, design decisions, assumptions, limitations, and a live-demo walkthrough. | Another developer can install, run, validate, and explain the solution. |

Accessibility semantics and testable design begin in the relevant earlier stages; stage 6 is the final integration and polish pass, not the first accessibility work.

If commits are made during implementation, keep them small and describe completed behavior in English, for example `Add dispute creation and validation` or `Add removal confirmation and empty state`. Do not create commits merely to record incomplete scaffolding milestones.

## 12. Assumptions and decisions to document

| Topic | Planned decision | Basis |
| --- | --- | --- |
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
| Responsive layout | Preserve data through table scrolling and adaptive dialogs. | Mobile behavior is not specified. |

These decisions are sufficient to start implementation. Revisit a decision if further instructions change its assumptions; routine library configuration and visual refinement do not require separate approval.

## 13. Handover and interview preparation

The application README should contain:

- Supported Node/npm versions and commands to install and start from `App`.
- Production build, lint, formatting, unit-test, and browser-test commands.
- A short architecture explanation, including why signals and Signal Forms fit this scope.
- The division between CDK/Material behavior and application-specific presentation.
- Money/date handling, ID allocation, persistence behavior, and documented ambiguities.
- Actual verification results and any known limitations.
- A concise demonstration script covering creation errors, successful creation, removal cancellation, confirmed removal, and recovery from an empty list.

Suggested scripts to define during implementation are `start`, `build`, `lint`, `format:check`, `test`, `test:ci`, and `test:e2e`. The README should use the real scripts once they exist and explain browser installation if required.

For the assignment's 40-minute presentation slot, prepare approximately five minutes on requirements and assumptions, ten minutes of live workflows, ten minutes on architecture/forms/state, ten minutes on testing/accessibility, and five minutes on tradeoffs and possible next steps. The separate team introduction, questions, and wrap-up remain outside that slot.

## 14. Definition of done

- [ ] The application uses a verified stable Angular 22 toolchain with reproducible dependencies.
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
