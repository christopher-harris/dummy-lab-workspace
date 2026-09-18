# 🤖 AGENTS.md

## Project Purpose

This repository is a personal learning workspace for testing new concepts, frameworks, libraries, architecture patterns, and AI-assisted development workflows.

Angular is the preferred primary framework, but the workspace should stay flexible enough to support experiments with other frontend or full-stack technologies when useful.

## Owner Preferences

- Address the owner as Chris.
- Be concise, direct, and collaborative.
- Prefer honest technical pushback over agreeable but weak recommendations.
- Read existing files and project context before asking questions.
- Ask before changing existing files.
- If creating AI-authored documents, mark the title with a robot emoji.

## Workspace Foundation

- Use Nx as the foundation for workspace structure, generators, dependency boundaries, and task orchestration.
- Prefer Angular for primary applications and libraries.
- Keep experiments isolated so new concepts can be added, compared, and removed without destabilizing the whole workspace.
- Favor explicit project names that describe the experiment or concept being tested.
- Prefer reusable libraries for shared UI, data access, utilities, and test helpers when patterns repeat.

## API and Data Rules

- Use `https://dummyjson.com/` as the only external API/data source for app experiments.
- Do not introduce additional hosted APIs, mock SaaS services, or external backend dependencies unless Chris explicitly approves them.
- Local fixtures are allowed when they support tests, demos, or offline development, but they should model DummyJSON data shapes where practical.
- Keep API access behind framework-appropriate data services, clients, or adapters instead of calling DummyJSON directly throughout UI components.

## Angular Preferences

- Before writing or changing Angular code, read the project-local Angular skill instructions in `.agents/skills/angular-developer/SKILL.md`.
- When creating a new Angular application, also read `.agents/skills/angular-new-app/SKILL.md` before generating files or running setup commands.
- Use the reference files under `.agents/skills/angular-developer/references/` that match the task, such as signals, routing, forms, DI, styling, testing, or Angular CLI guidance.
- Treat the local `.agents/skills/` content as the source of truth for Angular coding guidance in this workspace unless Chris gives a newer instruction.
- Prefer modern Angular patterns.
- Use standalone components unless a specific experiment requires NgModules.
- Prefer signals and Angular's current reactive APIs where they fit cleanly.
- Use NgRx for medium or larger state-management experiments.
- PrimeNG and Tailwind are preferred UI/styling tools when the experiment needs a component library or utility styling.
- Keep feature code organized by domain or experiment, not by arbitrary technical buckets.

## Non-Angular Experiments

- Other frameworks are allowed when the purpose is comparison, learning, or a specific concept that Angular is not well suited to demonstrate.
- Keep non-Angular experiments clearly separated in their own Nx projects.
- Document why the framework/tool was chosen when it is not obvious from the experiment name.

## AI Configuration

- Keep AI-related configuration local to this repository whenever possible.
- Project-specific agent instructions belong in root-level `AGENTS.md` and, when needed, nested `AGENTS.md` files for focused areas.
- Project-specific skills, MCP server configs, prompts, and workflow notes should live inside repository-local configuration directories.
- Do not rely on global machine-level AI configuration for behavior that is required to understand or work on this repo.
- Do not commit secrets, tokens, API keys, or local machine paths that should remain private.

Suggested local AI config locations:

- `.codex/` for project-local Codex configuration, skills, prompts, or workflows.
- `.agents/` for additional agent-facing instructions or shared local guidance.
- `.mcp/` or another explicitly documented directory for project-local MCP server configuration, if introduced.

## Documentation Expectations

- Keep docs practical and current.
- Prefer short decision notes over long theoretical documents.
- Add README or experiment notes when a project needs setup, tradeoffs, or learning outcomes captured.
- Document non-obvious architecture choices close to the relevant project.

## Testing and Quality

- Add tests when the experiment is intended to validate reusable behavior, architecture, state management, data access, or UI workflows.
- Keep test scope proportional to the experiment.
- Prefer repeatable Nx targets over one-off commands.
- Before finishing meaningful code changes, run the narrowest relevant validation command available.

## Development Workflow

- Inspect the workspace before making assumptions.
- Keep changes scoped to the requested experiment or documentation.
- Do not refactor unrelated areas while adding a new concept.
- Avoid destructive git commands unless Chris explicitly asks for them.
- If a command requires network access, external installs, or elevated permissions, explain why it is needed.

## Naming Guidance

- Use clear names that reflect the concept under test.
- Prefer names like `angular-signals-lab`, `dummy-products-dashboard`, or `ngrx-entity-demo` over vague names like `test-app`.
- If an experiment is temporary, name it that way.

## Current Product Direction

This repo should grow into a flexible Nx learning lab where Chris can quickly scaffold, compare, and evaluate frontend concepts using consistent local AI guidance and DummyJSON-backed data.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
