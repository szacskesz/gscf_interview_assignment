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

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

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

## Services

- Design services around a single responsibility
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
