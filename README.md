# GSCF Disputes

## Getting started

Use Node.js 24.22.3 and npm 11.19.1.

```sh
npm ci
npm start
```

Open http://localhost:4200. The shell renders a temporary signal-driven button from the built shared library.

Use `npm run watch:libs` in a second terminal when editing the library. If the development server does not pick up a rebuilt library, restart `npm start`.

`npm run build` builds the libraries first and writes the production application to `dist/apps/disputes/production/browser`. Library artifacts are written under `dist/libs`. Angular runs zoneless and uses default OnPush change detection.

The application is in `apps/disputes`. Shared code is in `libs` and imported through its package public APIs. See the [implementation plan](Docs/1-Initial-Plan.md) for the work sequence.

The workspace was verified with a clean `npm ci` and development and production builds in library-first order on Windows. npm reported optional native tooling install-script notices. The builds succeeded with npm's default install-script policy.

Use `npm run format` to format workspace source, configuration, and Markdown. Use `npm run format:check` to check them without writing changes.

Use `npm run lint` for TypeScript, Angular template accessibility, and library import checks. Import shared code through a library's public package name. Use relative imports inside the same app or library. Extend the public-package import rules in `eslint.config.mjs` when adding a library.

The global stylesheet defines the GSCF theme and scans application and library sources, including colocated stories. It serves [Montserrat](https://github.com/JulietaUla/Montserrat/tree/cc8daf2e7085006b9c112542fc82b58afc13521d) from local assets with its SIL Open Font License.

Use `npm test` for the zoneless Vitest suite in CI or locally. It builds libraries first, then runs the Angular CLI test targets in jsdom. Use `npm run test:watch` to watch application specs.

Run `npx playwright install chromium` once, then use `npm run test:components` for Vitest component tests in Chromium. The browser target runs only `*.browser.spec.ts` files.
