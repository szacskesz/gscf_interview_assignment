# Project Rules

These instructions apply throughout this repository and record the user's project preferences.

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
