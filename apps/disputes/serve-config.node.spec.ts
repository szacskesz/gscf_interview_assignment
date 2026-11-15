import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, test } from 'vitest';
import workspace from '../../angular.json' with { type: 'json' };
import packageJson from '../../package.json' with { type: 'json' };
import rootConfig from '../../tsconfig.json' with { type: 'json' };

const root = fileURLToPath(new URL('../../', import.meta.url));

test.each(['development', 'e2e'] as const)(
  'resolves private libraries for %s serving when dist/libs is unavailable',
  (profile) => {
    const { build, serve } = workspace.projects.disputes.architect;
    const [, , configurations] = serve.configurations[profile].buildTarget.split(':');
    const buildOptions = configurations.split(',').reduce((options, name) => {
      const configuration = build.configurations[name as keyof typeof build.configurations];
      return { ...options, ...configuration };
    }, build.options);
    const config = ts.getParsedCommandLineOfConfigFile(
      resolve(root, buildOptions.tsConfig),
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: ({ messageText }) => {
          throw new Error(ts.flattenDiagnosticMessageText(messageText, '\n'));
        },
      },
    );
    if (!config) throw new Error(`Could not load ${buildOptions.tsConfig}`);

    const dist = resolve(root, 'dist/libs').replaceAll('\\', '/');
    const sourceFile = resolve(root, 'apps/disputes/src/main.ts');
    for (const name of Object.keys(rootConfig.compilerOptions.paths)) {
      const { resolvedModule } = ts.resolveModuleName(name, sourceFile, config.options, {
        ...ts.sys,
        directoryExists: (path) => !path.startsWith(dist) && ts.sys.directoryExists(path),
        fileExists: (path) => !path.startsWith(dist) && ts.sys.fileExists(path),
      });
      expect(resolvedModule?.resolvedFileName, name).toMatch(/\/libs\/.+\/src\/public-api\.ts$/);
    }
  },
);

test.each(['serve:dist:dev', 'serve:dist:demo'] as const)(
  '%s uses loopback HTTP so MSW can register without a local certificate',
  (script) => {
    const args = packageJson.scripts[script].split(/\s+/);
    expect(args).toContain('--hostname');
    expect(args[args.indexOf('--hostname') + 1]).toBe('127.0.0.1');
    expect(args.filter((arg) => /^--(?:http2|https|key|cert|pfx)(?:=|$)/.test(arg))).toEqual([]);
  },
);
