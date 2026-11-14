# Development Readiness Review

Review date: 14 November 2026

Scope: Check prerequisites and implementation order for the agreed Vitest, Playwright, Storybook, and MSW stack. This review does not scaffold the application or install its dependencies.

### Step 0 implementation check

- Verified Node `24.22.3` and npm `11.19.1` in the implementation terminal.
- Checked the npm registry for the stable Angular framework (`22.2.6`), CLI and builder (`22.2.7`), and library packager (`22.2.6`). The published peer ranges accept TypeScript `6.0.3` and RxJS `7.8.2`. [Angular compatibility matrix](https://angular.dev/reference/versions).
- Resolved a fresh lockfile for the exact baseline dependencies in a temporary directory using standard npm peer resolution. The command exited successfully without warnings. Step 1 verifies a clean install and native library/application builds.
- The Angular CLI MCP workspace scan responded and found the reference POC only. Retrieved generic Angular guidance for scaffolding and will select the root workspace once it exists.

## 1. Readiness assessment

The requirements, architecture, user decisions, and staged delivery plan are sufficiently defined to begin the workspace foundation. No additional product decision is needed before that stage. The minimal Angular baseline resolves without warnings. **The revised complete toolchain has not yet been installed or validated together:** package metadata provides starting candidates, and each integration stage must pass its own dependency, build, and runtime checks.

The review clarified an ordering gap: early library builds and Tailwind checks need a real library before the shared component kit is implemented. Stage 1 now creates only `ui/common` with a minimal integration fixture. Storybook documents that fixture in stage 9, and stage 12 implements the actual reusable kit. This preserves the agreed tooling-before-components-before-features sequence.

The checks below do not replace the clean install and library/application build required at the end of stage 1.

## 2. Prerequisites checked

| Item                                     | Finding                                                                                                                                                 | Follow-up                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Assignment and logo                      | Both files exist under `Instructions`; the plan contains exact seed data, workflow copy, validation, visual tokens, and acceptance criteria.            | Use the PDF figures during visual implementation; keep the original assets intact.                                                                                       |
| User decisions                           | Workspace/libraries, strict zoneless Angular, Signal Forms, Vitest/Playwright, shared stories, MSW profiles, and pending-state behavior are documented. | Apply the existing decisions; no new approval needed for routine implementation details.                                                                                 |
| Git                                      | The approved MSW documents are committed as `41d9e6c`; the commit completed successfully.                                                               | Keep each future integration reviewable and use short English commit messages when commits are requested.                                                                |
| Node/npm                                 | Node `24.22.3`, npm `11.19.1`; Windows build `22631`.                                                                                                   | Pin/document the selected runtime in stage 1 and verify tool commands in the actual terminal.                                                                            |
| Angular development skill                | Installed and readable.                                                                                                                                 | Continue using relevant references; project choices override generic runner defaults.                                                                                    |
| Angular CLI MCP                          | Project configuration pins CLI `22.2.7`; prior protocol/documentation checks succeeded. Its tool namespace is still not exposed in this chat.           | Refresh the client connection when needed; direct CLI and official documentation remain available. Select the root workspace after scaffolding, never the temporary POC. |
| Root application                         | No root `package.json`, `angular.json`, or `node_modules` yet.                                                                                          | Expected at this planning stage; create the workspace in stage 1.                                                                                                        |
| Temporary reference material             | Available and currently ignored by Git in this environment.                                                                                             | Commit portable root ignore rules in stage 1; do not depend on one machine's ignore configuration.                                                                       |
| Montserrat files                         | Not supplied with the assignment assets.                                                                                                                | Obtain locally served fonts and retain their license in stage 4; the source is available, so this is not a missing user input.                                           |
| Browser executables and test integration | Not installed or exercised by this review.                                                                                                              | Install/verify browsers for Vitest Browser Mode in stage 6 and Playwright Test in stage 7.                                                                               |

Node 24.22.3 is within Angular 22's supported Node range. Angular 22 requires TypeScript `>=6.0.0 <6.1.0`; TypeScript 7.x is therefore not suitable even though it is the registry's newer release. [Angular compatibility matrix](https://angular.dev/reference/versions).

Use the published Montserrat source and include its SIL Open Font License with the local assets; load only the necessary styles/weights. [Font source](https://github.com/google/fonts/tree/main/ofl/montserrat), [license](https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/OFL.txt).

## 3. Package compatibility snapshot

Queried published npm manifests during this review. These are starting candidates, not packages installed into the repository. Recheck versions when their integration begins. Angular framework packages share their exact patch, while CLI/build and CDK/Material have their own release numbers.

| Area                       | Candidate versions                                                    | Constraint or qualification                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular framework/compiler | `22.2.6`                                                              | Align common, compiler, compiler-cli, core, forms, and browser packages.                                                                           |
| CLI/application builder    | `22.2.7`                                                              | Keep `@angular/build:application` for the app and `@angular/build:unit-test` for Angular tests. Its Vitest peer range accepts the candidate below. |
| Library packaging          | `ng-packagr 22.2.6`                                                   | Uses Angular 22 and TypeScript 6.0.                                                                                                                |
| TypeScript/RxJS            | `6.0.3` / `7.8.2`                                                     | TypeScript `latest` was `7.0.2`; deliberately choose supported `6.0.3`.                                                                            |
| CDK/Material               | `22.2.7` / `22.2.7`                                                   | Material requires the matching CDK patch.                                                                                                          |
| Formatting                 | `prettier 3.10.1`                                                     | Add only in its own stage.                                                                                                                         |
| Lint                       | `angular-eslint 22.6.0`, `typescript-eslint 8.72.2`, `eslint 10.15.0` | Declared peer ranges accept TypeScript 6.0 and the selected ESLint.                                                                                |
| Styling                    | `tailwindcss 4.3.5`, `@tailwindcss/postcss 4.3.5`, `postcss 8.5.32`   | Validate source detection in both app and catalog.                                                                                                 |
| Unit/integration tests     | `vitest 5.1.0`; `@vitest/coverage-v8 5.1.0` if coverage is configured | Keep related Vitest packages aligned; verify the CLI builder and zoneless TestBed fixture.                                                         |
| DOM test dependency        | `jsdom 31.0.1`                                                        | Declared runtime range accepts Node 24.22.3; runtime integration remains a stage-5 check.                                                          |
| Browser component tests    | `@vitest/browser-playwright 5.1.0`, `playwright 1.65.1`               | The provider requires matching Vitest; browser setup and Angular compilation must be verified.                                                     |
| E2E/accessibility tests    | `@playwright/test 1.65.1`, `@axe-core/playwright 4.14.0`              | One E2E suite covers business workflows and targeted browser checks. Browser download and execution are separate checks.                           |
| Storybook                  | `storybook`, `@storybook/angular`, `@storybook/addon-docs`: `10.6.7`  | Angular renderer declares Angular 18-22 and TypeScript 6 support; Zone.js is optional.                                                             |
| Story runner               | `@storybook/test-runner 0.26.0`                                       | Verify its dependency graph and the chosen Angular/Webpack renderer independently of application tests.                                            |
| API documentation          | `@compodoc/compodoc 2.0.0`                                            | Verify extraction of required/aliased signal inputs and models.                                                                                    |
| Mock backend               | `msw 3.0.5`                                                           | Separate browser/Node adapters; validate ESM and worker integration.                                                                               |
| Built preview              | `local-web-server 5.4.2`                                              | Verify HTTP/2, SPA fallback, output directories, and separate ports.                                                                               |

Versions and peer ranges came from published npm manifests. Keep TypeScript on Angular's supported release line and recheck the combined graph at each integration. Sources: [Angular build metadata](https://registry.npmjs.org/@angular/build/22.2.7), [Vitest metadata](https://registry.npmjs.org/vitest/5.1.0), [browser provider metadata](https://registry.npmjs.org/@vitest/browser-playwright/5.1.0), [Playwright Test metadata](https://registry.npmjs.org/@playwright/test/1.65.1), [Storybook Angular metadata](https://registry.npmjs.org/@storybook/angular/10.6.7).

Storybook's Angular/Webpack integration also needs compatible `@angular-devkit/build-angular`, devkit core/architect, and browser-dynamic packages. Add them at the Storybook stage without switching the app builder. Use the renderer's supported zoneless configuration and prove signal input/model controls in the fixture. The Storybook test runner remains the relevant candidate for this renderer; the general recommendation for the Vitest addon targets Vite-powered frameworks. [Angular renderer](https://storybook.js.org/docs/get-started/frameworks/angular), [story test runner](https://storybook.js.org/docs/writing-tests/integrations/test-runner).

## 4. Testing responsibilities and verification status

| Layer                                     | Execution owner                                  | Scope                                                                                             |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Unit and Node contracts                   | Vitest                                           | Domain calculations, repository behavior, and MSW HTTP contracts with `setupServer`.              |
| Angular integration                       | Vitest with zoneless TestBed and jsdom           | Bindings, forms, adapters, and store behavior through the Angular CLI test builder.               |
| Browser components                        | Vitest Browser Mode with the Playwright provider | Focused component behavior requiring a real browser; separate `*.browser.spec.ts` discovery.      |
| Application E2E                           | Playwright Test                                  | All assignment workflows, plus cross-browser, axe, focus, responsive, and selected visual checks. |
| Shared component catalog and interactions | Storybook with a renderer-compatible runner      | Colocated stories, `play` interactions, and generated Compodoc API documentation.                 |

Angular CLI supplies Vitest integration and supports browser execution with the Playwright provider. Keep asynchronous Angular assertions based on state/events and `whenStable()` so manual change detection cannot hide a missing zoneless notification. Playwright Test remains a separate runner for complete application workflows. [Angular testing guide](https://angular.dev/guide/testing), [Vitest Playwright provider](https://vitest.dev/config/browser/playwright), [Playwright Test](https://playwright.dev/docs/intro).

Keep each test under one execution owner. Exclude browser component specs from the Node/jsdom target and isolate Playwright and story configurations. Browser HTTP checks use a ready `setupWorker`; Node contracts use `setupServer`. Do not combine MSW interception and `HttpTestingController` for the same request.

| Check                                | Observed result and next step                                                                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal Angular/CLI/library baseline | Ordinary lockfile-only resolution succeeded without peer warnings. Verify a clean install and native build in stage 1.                                                                                                                            |
| Additional strict-peer diagnostic    | An optional WASM parser path reported conflicting `@emnapi/core` peer ranges. Ordinary resolution can nest separate versions; this diagnostic alone does not prove a native Windows build failure. Inspect the actual installed graph in stage 1. |
| Revised testing stack                | Current package metadata was checked; a fresh combined resolution and runtime verification are still pending at stages 5-7.                                                                                                                       |
| Storybook integration                | Renderer and runner remain separate dependency/runtime gates at stages 9-11. Application Vitest setup does not establish story-runner compatibility.                                                                                              |

The baseline resolution ran outside the repository without install scripts, application packages, or browser downloads. Do not suppress peer conflicts with forced installs or unexplained overrides. Package metadata and lockfile resolution are preliminary evidence; only the planned integration checks establish that each part works.

## 5. Ordering and prerequisites

The numbered stages remain **0-21**, with the detailed work and exit criteria in [the main plan](1-Initial-Plan.md#11-incremental-implementation-sequence).

| Stages | Order and dependency                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-1    | Compatibility selection, then root CLI workspace, app shell, minimal `ui/common` fixture, exact-save policy, ignore/runtime configuration, and dependency-order library build/watch commands. |
| 2-4    | Prettier, then ESLint/boundaries, then Tailwind/tokens/local fonts and logo assets. Each is a separate integration. The existing library fixture makes these checks concrete.                 |
| 5      | Vitest unit/integration tests, zoneless TestBed/jsdom, and isolated Node contracts.                                                                                                           |
| 6      | Vitest Browser Mode with the Playwright provider; install/verify its browser and exclude browser specs from Node discovery.                                                                   |
| 7      | Playwright Test E2E, server lifecycle/readiness, selected browser projects, and initial acceptance mapping.                                                                                   |
| 8      | MSW bootstrap, worker generation, profile isolation, and browser/Node smoke tests. Use a temporary generic endpoint and app-local startup configuration; domain libraries do not exist yet.   |
| 9-11   | Storybook, then Compodoc, then executable story tests. Prove zoneless rendering and signal API documentation before the component kit.                                                        |
| 12     | Implement real shared components individually, each with its stories/tests. Keep them independent of business state, mock data, and the later domain clock/API token.                         |
| 13-15  | Core/domain contracts, then mock repository/HTTP handlers, then Angular API adapter and signal store. These steps provide the feature dependencies in the right order.                        |
| 16-18  | Overview, then creation, then removal, with tests in each step. Controlled scenarios already support empty/error states before the removal UI exists.                                         |
| 19-21  | Built demo/production previews and optimization, full acceptance/visual/accessibility verification, then handover consolidation.                                                              |

Additional sequencing details now made explicit:

- The first scaffold preserves the existing Git repository, `.codex` configuration, instructions, and documents. Avoid blind initialization or overwriting the root with a temporary example.
- Library consumers use built public entry points. Establish clean build ordering immediately, then extend it when each library is added; do not postpone this until feature work. [Angular library guidance](https://angular.dev/tools/libraries/creating-libraries).
- Root ignore rules are portable, and test-runner discovery excludes reference projects and other runners' specs. Keep the generated MSW worker tracked as previously agreed.
- Lint configuration must permit the agreed clean aliases for `$`-prefixed signal inputs/models. Extend boundary rules when projects appear.
- Browser suites own their server startup/readiness/cleanup. Use fixed project ports, condition-based waits, and consistent OS/browser versions for visual baselines.
- Stage 8 uses the Angular dev server and inspects emitted files; it does not depend on the local built-output server installed in stage 19.
- Maintain runnable commands and brief README notes as each stage lands. Handover is consolidation, not the first documentation pass.

## 6. Checks still required during implementation

These are scheduled verification tasks, not missing user requirements:

- Clean `npm ci`, required native dependency availability, library packaging, and application build on the selected runtime.
- Library-only Tailwind classes and locally served fonts in app and Storybook output.
- Vitest zoneless rendering, real-browser components, MSW Node ESM/API behavior, and deterministic isolation.
- Storybook signal aliases/required inputs/models, Compodoc extraction, and executable stories.
- Playwright E2E execution, including real worker readiness and pending/failure workflows.
- The numeric field's raw-string/custom-control behavior across supported browsers, especially literal trailing decimals and invalid native input.
- Optimized demo functionality, mock-free production output, original acceptance coverage, manual focus/keyboard checks, and axe scans.

Begin with the compatibility and workspace stages. No new architecture decision or additional user-provided file is required; each dependency integration must pass its exit criteria before dependent work proceeds.
