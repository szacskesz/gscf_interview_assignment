# Angular CLI MCP Setup

Configured and verified on 13 November 2026.

## Configuration

The repository uses a project-scoped MCP configuration in [.codex/config.toml](../.codex/config.toml). It follows the [Angular CLI MCP setup guide](https://angular.dev/ai/mcp) and the client's [MCP configuration format](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

```toml
[mcp_servers.angular-cli]
command = "cmd"
args = ["/d", "/c", "npx", "--yes", "@angular/cli@22.2.7", "mcp"]
startup_timeout_sec = 60
tool_timeout_sec = 180
enabled = true
```

This is a Windows launcher. `cmd /d /c` runs the npm command shim, while `--yes` avoids an interactive package-install prompt. The exact CLI version makes startup reproducible. The server inherits the client's working directory; open this repository as the project root.

The existing Node.js **24.22.3** and npm **11.19.1** were verified. Angular CLI **22.2.7** was the current published stable CLI release at setup time and accepts this Node version. The package was downloaded into the npm cache. No global Angular CLI installation or application dependency installation was performed.

The configuration is scoped to this repository. Existing user-level MCP servers and other settings were preserved. Project configuration requires a trusted project; the existing trust configuration already includes this repository. [Project configuration guidance](https://learn.chatgpt.com/docs/config-file/config-basic).

## Verification performed

| Check                                                            | Observed result                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ng mcp --help` through the pinned package                       | Successful; launcher and options available.                                                |
| `codex mcp get angular-cli --json`                               | Server recognized as enabled with the expected command and timeouts.                       |
| MCP initialization using the saved configuration                 | Successful; server reported `angular-cli-server`, version `22.2.7`, protocol `2025-06-18`. |
| `tools/list`                                                     | Nine tools discovered.                                                                     |
| `list_projects`                                                  | Successful; found the temporary MSW POC described below.                                   |
| `get_best_practices` without a workspace                         | Returned the generic guide successfully.                                                   |
| `search_documentation` for `Signal Forms FormRoot`, version `22` | Returned relevant Angular 22 documentation successfully.                                   |
| Verification process shutdown                                    | Exited cleanly without stderr output.                                                      |

Available tools at verification: `ai_tutor`, `get_best_practices`, `search_documentation`, `list_projects`, `onpush_zoneless_migration`, `run_target`, `devserver_start`, `devserver_stop`, and `devserver_wait_for_build`.

Verification used a short-lived MCP client to launch the exact saved command and issue read-only requests. It did not run a build, migration, development server, or application test. Registration and protocol verification do not imply that an already-running chat has refreshed its tool catalog.

## Workspace selection

The planned application has not yet been scaffolded, so the repository root does not contain its intended `angular.json`.

Discovery currently finds `TMP/gscf-disputes-msw-poc/angular.json`, which declares an Angular 21 application. This is temporary reference material, not the target application and not evidence that the planned stack has changed. Do not execute targets or migrations against it as part of the main implementation.

After the planned root workspace is created, call `list_projects` again and select that workspace and the intended application/library explicitly. Retrieve its version-specific best practices using the tool's current input schema. The MCP launcher's CLI version and the application's framework version are separate values and must be checked separately.

## Loading and maintaining the connection

Reload the desktop client or start a new chat in this project if `angular-cli` tools are not visible in an existing chat. The current chat did not expose the new tool namespace during setup, although the saved configuration and standalone connection checks passed.

Useful commands from a normal terminal in the repository root:

```powershell
codex mcp get angular-cli --json
codex mcp list
npx --yes @angular/cli@22.2.7 mcp --help
```

If Node/npm cannot be found, verify that the selected Node installation is available on the desktop client's PATH and restart the client after changing that environment. The initial setup verified npm through the existing `C:\Programs\nodejs` installation.

For upgrades, check the current stable CLI release and its Node requirements, update the exact package version in the configuration, and repeat initialization, tool discovery, and a read-only request. Keep application scaffolding and dependency changes in their own implementation stages.
