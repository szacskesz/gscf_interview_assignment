# Development Readiness Review

Review date: 14 November 2026

Scope: Check prerequisites and implementation order after commit `41d9e6c` (`Plan MSW backend integration`). This review does not scaffold the application or install its dependencies.

## 1. Readiness assessment

The requirements, architecture, user decisions, and staged delivery plan are sufficiently defined to begin the workspace foundation. No additional product decision is needed before that stage. **The complete toolchain is not yet cleared:** the combined package-resolution check exposes a Babel peer mismatch that must be resolved before completing the affected Jest/Storybook integration. The minimal Angular baseline resolves without warnings. Each stage must still pass its actual build/browser/test checks.

The review clarified an ordering gap: early library builds and Tailwind checks need a real library before the shared component kit is implemented. Stage 1 now creates only `ui/common` with a minimal integration fixture. Storybook documents that fixture in stage 9, and stage 12 implements the actual reusable kit. This preserves the agreed tooling-before-components-before-features sequence.

Dependency-resolution results and their limits are recorded below. They are not a substitute for the clean install and library/application build required at the end of stage 1.

## 2. Prerequisites checked

| Item | Finding | Follow-up |
| --- | --- | --- |
| Assignment and logo | Both files exist under `Instructions`; the plan contains exact seed data, workflow copy, validation, visual tokens, and acceptance criteria. | Use the PDF figures during visual implementation; keep the original assets intact. |
| User decisions | Workspace/libraries, strict zoneless Angular, Signal Forms, all requested test tools, shared stories, MSW profiles, and pending-state behavior are documented. | Apply the existing decisions; no new approval needed for routine implementation details. |
| Git | The approved MSW documents are committed as `41d9e6c`; the commit completed successfully. | Keep each future integration reviewable and use short English commit messages when commits are requested. |
| Node/npm | Node `24.22.3`, npm `11.19.1`; Windows build `22631`. | Pin/document the selected runtime in stage 1 and verify tool commands in the actual terminal. |
| Angular development skill | Installed and readable. | Continue using relevant references; project choices override generic runner defaults. |
| Angular CLI MCP | Project configuration pins CLI `22.2.7`; prior protocol/documentation checks succeeded. Its tool namespace is still not exposed in this chat. | Refresh the client connection when needed; direct CLI and official documentation remain available. Select the root workspace after scaffolding, never the temporary POC. |
| Root application | No root `package.json`, `angular.json`, or `node_modules` yet. | Expected at this planning stage; create the workspace in stage 1. |
| Temporary reference material | Available and currently ignored by Git in this environment. | Commit portable root ignore rules in stage 1; do not depend on one machine's ignore configuration. |
| Montserrat files | Not supplied with the assignment assets. | Obtain locally served fonts and retain their license in stage 4; the source is available, so this is not a missing user input. |
| Browser executables and test integration | Not installed or exercised by this review. | Verify Cypress in stage 6 and install/verify the selected Playwright browsers in stage 7. |

Node 24.22.3 is within Angular 22's supported Node range. Angular 22 requires TypeScript `>=6.0.0 <6.1.0`; TypeScript 7.x is therefore not suitable even though it is the registry's newer release. [Angular compatibility matrix](https://angular.dev/reference/versions).

Use the published Montserrat source and include its SIL Open Font License with the local assets; load only the necessary styles/weights. [Font source](https://github.com/google/fonts/tree/main/ofl/montserrat), [license](https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/OFL.txt).

## 3. Package compatibility snapshot

Queried published npm manifests during this review. These are starting candidates, not packages installed into the repository. Recheck versions when their integration begins. Angular framework packages share their exact patch, while CLI/build and CDK/Material have their own release numbers.

| Area | Candidate versions | Constraint or qualification |
| --- | --- | --- |
| Angular framework/compiler | `22.2.6` | Align common, compiler, compiler-cli, core, forms, and browser packages. |
| CLI/application builder | `22.2.7` | Compatible with the installed Node; keep `@angular/build:application` for the app. |
| Library packaging | `ng-packagr 22.2.6` | Uses Angular 22 and TypeScript 6.0. |
| TypeScript/RxJS | `6.0.3` / `7.8.2` | TypeScript `latest` was `7.0.2`; deliberately choose supported `6.0.3`. |
| CDK/Material | `22.2.7` / `22.2.7` | Material requires the matching CDK patch. |
| Formatting | `prettier 3.10.1` | Add only in its own stage. |
| Lint | `angular-eslint 22.6.0`, `typescript-eslint 8.72.2`, `eslint 10.15.0` | Declared peer ranges accept TypeScript 6.0 and the selected ESLint. |
| Styling | `tailwindcss 4.3.5`, `@tailwindcss/postcss 4.3.5`, `postcss 8.5.32` | Validate source detection in both app and catalog. |
| Unit tests | `jest 30.5.2`, `jest-preset-angular 17.0.3`, `jest-environment-jsdom 30.5.2`, `@types/jest 30.0.0` | Preset declares Angular 20-22 and Jest 30 support. Use zoneless setup. |
| DOM test dependency | `jsdom 31.0.1` | Declared runtime range accepts Node 24.22.3; runtime integration remains a stage-5 check. |
| Babel test-tool compatibility | Unresolved; `@babel/core 7.29.13` was investigated | Do not adopt the attempted pin as a finished fix. Angular's Babel 8 and test-tool Babel 7 dependencies need a correctly resolved graph; see findings below. |
| Business E2E | `cypress 16.3.0` | Its Node requirement accepts the selected runtime. |
| Browser/accessibility tests | `@playwright/test 1.65.1`, `@axe-core/playwright 4.14.0` | Browser download and execution are separate checks. |
| Storybook | `storybook`, `@storybook/angular`, `@storybook/addon-docs`: `10.6.7` | Angular renderer declares Angular 18-22 and TypeScript 6 support; Zone.js is optional. |
| Story runner | `@storybook/test-runner 0.26.0` | Keep separate from application Jest; verify the chosen Angular/Webpack renderer. |
| API documentation | `@compodoc/compodoc 2.0.0` | Verify extraction of required/aliased signal inputs and models. |
| Mock backend | `msw 3.0.5` | Separate browser/Node adapters; validate ESM and worker integration. |
| Built preview | `local-web-server 5.4.2` | Verify HTTP/2, SPA fallback, output directories, and separate ports. |

Versions and peer ranges came from each package's published npm manifest, queried through the registry's `/<package>/latest` endpoint; the TypeScript and Babel selections were restricted to compatible stable release lines. Examples: [Angular build metadata](https://registry.npmjs.org/@angular/build/22.2.7), [Jest preset metadata](https://registry.npmjs.org/jest-preset-angular/17.0.3), [Storybook Angular metadata](https://registry.npmjs.org/@storybook/angular/10.6.7).

Storybook's Angular/Webpack integration also needs compatible `@angular-devkit/build-angular`, devkit core/architect, and browser-dynamic packages. Add them at the Storybook stage without switching the app builder. Use the renderer's supported zoneless configuration and prove signal input/model controls in the fixture. The Storybook test runner remains the relevant candidate for this renderer; the general recommendation for the Vitest addon targets Vite-powered frameworks. [Angular renderer](https://storybook.js.org/docs/get-started/frameworks/angular), [story test runner](https://storybook.js.org/docs/writing-tests/integrations/test-runner).

Use `setupZonelessTestEnv` for Jest. The skill's generic Vitest examples do not override the user's Jest decision. Keep asynchronous rendering checks based on state/events and `whenStable()` so manual change detection cannot hide a missing zoneless notification. [Jest TestBed environments](https://thymikee.github.io/jest-preset-angular/docs/getting-started/testbed-environment).

## 4. Dependency-resolution findings

All resolution experiments ran in fresh or isolated temporary directories outside this repository, using `--package-lock-only --ignore-scripts --no-audit --no-fund`. No application packages, browser downloads, install hooks, or builds were run; the temporary checks did not create `node_modules`. No `--force`, `--legacy-peer-deps`, or vendor edits were used. One scoped override was tested only in a temporary manifest and rejected because it did not resolve the mismatch. No pin or override was added to this repository.

1. The minimal Angular/CLI/library baseline resolves successfully with ordinary npm settings and no peer warnings.
2. An additional `--strict-peer-deps` diagnostic fails while resolving the optional `@oxc-parser/binding-wasm32-wasi 0.156.0` path: it declares `@emnapi/core 2.0.0-alpha.6`, while `@napi-rs/wasm-runtime 1.2.7` declares a different compatible peer range. The adjacent Angular builder patch `22.2.6` uses the same parser version, so changing to that patch is not an evidenced fix. Ordinary resolution can produce separate nested dependency versions; the strict diagnostic failure alone does not prove that the native Windows build is broken. Record it and verify the actual installed graph/build in stage 1.
3. Resolving the full requested toolchain reports warnings: Jest's `babel-preset-current-node-syntax` syntax plugins require Babel 7 but resolve against Babel 8. An explicit root Babel `7.29.13` selection reduces the mismatch but leaves a Babel 8 helper resolving against Babel 7. A scoped syntax-preset override also fails to produce a clean graph. Neither experiment is an adopted fix.

| Resolution experiment | Observed result |
| --- | --- |
| Minimal Angular baseline, ordinary npm | Exit 0, no peer warnings. |
| Minimal baseline/full stack, extra strict-peer diagnostic | Exit 1 on the optional WASM parser path described above. |
| Full toolchain, ordinary npm | Exit 0 with peer warnings; lockfile audit found 15 resolved Babel peer mismatches. |
| Fresh full toolchain plus root Babel 7 candidate | Exit 0 with one warning; audit found one remaining Babel 8 helper mismatch. |
| Fresh full toolchain plus scoped preset override candidate | Exit 0 with warnings; audit still found 15 Babel peer mismatches. Rejected. |

The audit compared resolved peer versions in the lockfile with their declared semver ranges. Exit 0 with warnings is not a compatibility pass, and these findings do not establish a runtime failure without a build/test run. Keep the minimal workspace baseline separate from later tools. Before stage 5, isolate the Jest/Angular graph, select a supported resolution, and run the meaningful zoneless fixture; repeat resolution when Storybook is added in stage 9. If solving this requires a framework downgrade, replacing Jest, or violating a recorded rule, present the concrete alternative to the user first. Do not silence the warnings or carry an unexplained override into the project.

Package-manager resolution cannot demonstrate that Angular library packaging, MSW/Jest ESM, Storybook rendering, or browser downloads work; retain the planned integration exit criteria.

## 5. Ordering and prerequisites

The numbered stages remain **0-21**, with the detailed work and exit criteria in [the main plan](1-Initial-Plan.md#11-incremental-implementation-sequence).

| Stages | Order and dependency |
| --- | --- |
| 0-1 | Compatibility selection, then root CLI workspace, app shell, minimal `ui/common` fixture, exact-save policy, ignore/runtime configuration, and dependency-order library build/watch commands. |
| 2-4 | Prettier, then ESLint/boundaries, then Tailwind/tokens/local fonts and logo assets. Each is a separate integration. The existing library fixture makes these checks concrete. |
| 5-7 | Jest, then Cypress, then Playwright. Establish test discovery isolation, browser installation, server lifecycle/readiness, and initial acceptance mapping. |
| 8 | MSW bootstrap, worker generation, profile isolation, and browser/Node smoke tests. Use a temporary generic endpoint and app-local startup configuration; domain libraries do not exist yet. |
| 9-11 | Storybook, then Compodoc, then executable story tests. Prove zoneless rendering and signal API documentation before the component kit. |
| 12 | Implement real shared components individually, each with its stories/tests. Keep them independent of business state, mock data, and the later domain clock/API token. |
| 13-15 | Core/domain contracts, then mock repository/HTTP handlers, then Angular API adapter and signal store. These steps provide the feature dependencies in the right order. |
| 16-18 | Overview, then creation, then removal, with tests in each step. Controlled scenarios already support empty/error states before the removal UI exists. |
| 19-21 | Built demo/production previews and optimization, full acceptance/visual/accessibility verification, then handover consolidation. |

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
- Jest zoneless rendering, MSW Node ESM/API behavior, and deterministic isolation.
- Storybook signal aliases/required inputs/models, Compodoc extraction, and executable stories.
- Cypress and Playwright browser execution, including real worker readiness and pending/failure workflows.
- The numeric field's raw-string/custom-control behavior across supported browsers, especially literal trailing decimals and invalid native input.
- Optimized demo functionality, mock-free production output, original acceptance coverage, manual focus/keyboard checks, and axe scans.

Start with the compatibility/workspace stages, not the disputes feature. No new architecture decision or additional user-provided file is required to begin that work. The full-toolchain Babel finding remains open and must be closed at its integration gate before dependent work proceeds.
