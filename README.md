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
