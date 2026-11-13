# Project Rules

These instructions apply throughout this repository and record the user's project preferences.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Language

- Use English for communication, source code, identifiers, UI text, comments, documentation, test descriptions, and Git commit messages.
- Do not use Hungarian variable names, descriptions, or comments.

## Repository content and commits

- Keep commit messages short, relevant, and focused on the actual change.
- Do not add generated-by notices or attribution to coding assistants or generation tools in project files or commit metadata, including co-author trailers.

## Angular implementation

- Build the application with the latest stable Angular version available when implementation begins. Verify the current release and compatible dependencies rather than relying on a remembered version number.
- Follow Angular best practices and use modern, stable Angular features where they fit the requirements.

## Workspace structure and incremental delivery

- Use an Angular CLI multi-project workspace at the repository root, with applications under `apps/` and libraries under `libs/`. Nx is not required.
- Use `libs/core` for cross-cutting services, tokens, and infrastructure; `libs/feature/*` for separate business features/pages; `libs/ui/*` for presentational components and UI-only behavior; and `libs/data-access/*` for feature stores, domain models, fixtures, and future API access.
- Give every feature its own folder/library. Keep related templates, styles, specs, and stories together. Keep business pages out of `core` and business stores out of `ui`.
- Use explicit library public APIs and enforce dependency direction with lint rules. Do not import another library's private implementation or create circular dependencies.
- Integrate one concern at a time: workspace baseline, Prettier, ESLint/boundaries, Tailwind/tokens, Jest, Cypress, Playwright, Storybook, Compodoc, story tests, shared components, then business features and final integration.
- Each step must have its own usable result and appropriate verification before the next dependent step. Do not install the entire toolchain or implement the whole application in one change.
- Build the assignment-sized shared component set and its stories before the disputes features. Do not port the entire earlier POC toolkit or add unrelated controls.
- This order describes future implementation. A documentation request still does not authorize scaffolding or installing application dependencies.

## Dependencies and local tooling

- Use npm, commit the lockfile, and configure `save-exact=true`. Use exact versions without `^` or `~` in repository-owned package manifests, including private library peer dependencies where declared. Do not edit third-party manifests or transitive lockfile ranges to enforce this rule.
- Verify installed package peer compatibility with the selected Angular, TypeScript, Node, and test-tool versions. Do not hide incompatibilities with forced installs or silently downgrade Angular or replace requested tools.
- Configure Prettier for the workspace and Angular ESLint for code quality and library boundaries. Exclude generated output and temporary/reference material from application tooling.
- Provide `serve:dist` using a pinned local `local-web-server` dependency, HTTP/2, SPA fallback, and the actual application build directory. Prefer its `ws --directory ...` CLI over changing directories or downloading a package at run time.
- Declare `sideEffects: false` for libraries that have no required import-time side effects. Preserve CSS or required initialization with explicit side-effect entries where needed. Verify production output; this declaration is not a universal tree-shaking fix.

## Angular development skill

- Use the installed `angular-developer` skill for subsequent Angular implementation, architecture, and review work in this project.
- The skill comes from the official [Angular skills repository](https://github.com/angular/skills/tree/main/angular-developer). Read its `SKILL.md` and the references relevant to the current task.
- Explicit user instructions and the project-specific rules in this file take precedence over the skill's defaults.

## Notifications and accessibility

- Include the success toasts and keyboard accessibility requirements marked as optional in the assignment.
- Use an existing npm package for toast functionality; do not reimplement the notification lifecycle, timing, or queue management.
- Choose a maintained package compatible with the selected Angular version. A specific toast package is not mandated.
- Reuse established accessibility infrastructure where appropriate. Angular CDK, Angular Material, and `@angular/aria` are acceptable options.
- The initial plan proposes Material `MatSnackBar` for notifications and CDK Dialog for modal accessibility. These are implementation choices, not a requirement to use every listed library.

## Requirements and planning

- Use `Instructions/SeniorFrontendEngineer-Interview-Task.pdf` as the assignment's source of requirements, including its figures and input-state specification.
- Consult `Docs/1-Initial-Plan.md` for the detailed implementation approach and documented assumptions.
- Keep user requirements distinct from proposed implementation choices. Later user instructions take precedence over earlier planning assumptions.
- Respect the requested stage of work: a planning or documentation request does not by itself authorize starting application implementation.

## Collaboration

- Questions are welcome when requirements are unclear, a material decision needs the user's preference, or an important uncertainty remains.
- Explain the relevant options and tradeoffs concisely when asking for a decision.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Make class members `private` by default, `protected` when needed only by the template, and `public` only for an intentional external contract. Inputs, outputs, models, and required framework interfaces are public contracts. Do not widen visibility merely to test internals.
- Prefix signal-valued fields with `$`, including `signal`, `computed`, `linkedSignal`, signal inputs/models, and signal queries. Suffix observable/subject fields with `$`. An `output()` emitter is not a signal and does not need the signal prefix.
- Use aliases where needed so public template bindings remain descriptive, such as a `$label` input exposed as `label`. Keep purpose-based filenames and colocated tests.

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Keep the application and Angular test environment zoneless. Do not add Zone.js as a workaround for tooling integration.
- Use signals for state management
- Lazy-load every business page/feature route with `loadComponent` or `loadChildren`. Redirects and componentless grouping routes do not require their own lazy import; the bootstrap shell stays eager. Avoid redundant nested loading boundaries.
- Use `@defer` with a lightweight, dimensionally stable placeholder for expensive, nonessential content that can load later. Add loading/error states where useful and verify actual chunking. Do not defer the initial disputes table, primary actions, or form controls needed immediately.
- Use signal-based `viewChild`, `viewChildren`, `contentChild`, and `contentChildren` instead of their decorator equivalents. Use required queries only for guaranteed results.
- Prefer directive composition through `hostDirectives` over extending component classes for genuinely shared behavior. Do not create inheritance hierarchies or abstract behavior solely to demonstrate an API.
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Keep complete workflows usable on phones, including table scrolling, dialog sizing, touch targets, visible errors/actions, and notifications. Preserve all required data and desktop behavior.
- Combine axe scans with manual keyboard/focus, contrast, and screen-reader checks; automated checks alone do not establish WCAG compliance.

## Styling

- Use modern Tailwind utilities as the primary styling approach, backed by semantic CSS custom properties for theme colors and other design tokens.
- Keep the supplied GSCF palette and a single required theme. CSS-variable-based theming does not imply a theme switcher, dark mode, or persisted settings.
- Use small amounts of CSS for tokens, global fonts, package theme integration, and cases where utilities are unsuitable. Do not impose a separate SCSS-first styling system.
- Include all application, library, and story sources in Tailwind's source detection, and use complete class names rather than constructing class fragments dynamically.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `input.required()` for genuinely required inputs. Do not retain the obsolete Storybook exception that discouraged signal inputs.
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` when derived state must also be writable and must reset or reconcile with source changes. Use `computed()` for read-only derivation even when it reads multiple signals. Define how user edits are preserved or reset.
- Prefer inline templates for small components
- Use Signal Forms (`@angular/forms/signals`) for new application forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation.
- Use `FormRoot` with the Signal Forms `submit()` lifecycle, as confirmed by the user. Enter and the submit button must use one submission path. Do not add classic forms solely to obtain `ngSubmit`.
- A necessary integration with an existing classic form control must be narrowly scoped and documented; do not build a parallel Reactive Forms or template-driven forms architecture.
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.
- Document every shared component input, output, and model with English JSDoc, including required values, aliases, and relevant behavior. Use Compodoc and Storybook to expose this API documentation.

## Testing and component documentation

- Use Jest for unit tests and focused Angular TestBed integration tests, with a compatible `jest-preset-angular` zoneless setup. Do not also retain Vitest as the application's unit runner.
- Add meaningful `*.spec.ts` coverage for every feature. Prefer small TypeScript-focused white-box tests for business logic and transformations, while checking rendered behavior where templates and bindings matter. Avoid tests that merely mirror implementation or assert that a component exists.
- Use Cypress for black-box E2E workflows for every feature. Every behavior required by the assignment must be mapped to E2E coverage.
- Also use Playwright for targeted cross-browser, accessibility, responsive, focus, and visual checks. Keep its responsibility distinct from the complete Cypress business-workflow suite.
- Every shared UI component needs colocated `*.stories.ts`, representative visual/interaction states, and meaningful black-box component tests through story `play` functions where interactive. Static components still need rendering/accessibility assertions.
- Use Storybook and Compodoc for the shared component catalog and generated API documentation. Test story controls, aliased/required signal inputs, outputs/models, and zoneless rendering during integration.
- Use a Storybook test runner supported by the selected Angular renderer. Keep its configuration separate from application Jest and E2E projects; do not assume a Vite-only addon works with the selected renderer.
- Keep Jest, Cypress, Playwright, and Storybook TypeScript/test discovery configurations isolated to avoid conflicting global types and duplicate test execution.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Pipes and TypeScript formatting

- Use pure functions for domain calculations and formatting; use dependency injection when an actual pipe instance is needed in TypeScript. The user confirmed this targeted approach.
- In a component, register an injected pipe in `providers` and obtain it with `inject()`. Add it to `imports` when the template also uses it; a TypeScript-only use does not require a template import.
- For service usage, register a needed pipe through an environment provider at the appropriate route/bootstrap scope and inject it. Do not make every formatting helper an injectable pipe or require a wrapper around every built-in pipe.

## Services

- Design services around a single responsibility
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
- Keep the disputes store feature-scoped: use `@Service({ autoProvided: false })` with an explicit feature/overview provider rather than an unintended root singleton.
- Prefer signals for synchronous component state; retain RxJS when streams or library APIs genuinely require it, using supported interop and lifecycle cleanup.
