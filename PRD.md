# 🤖 Product Requirements Document

## Product Name

Dummy Lab Workspace

## Purpose

Create a flexible Nx-based learning workspace for experimenting with Angular concepts first, while leaving room to test other frameworks, tooling, architecture patterns, and AI-assisted development workflows.

The workspace is not intended to become a production application. It is a structured lab for learning, comparison, prototyping, and repeatable experimentation.

## Goals

- Provide a clean Nx foundation for apps, libraries, and isolated experiments.
- Make Angular the default frontend technology.
- Allow other frameworks or stacks when useful for comparison or learning.
- Use DummyJSON as the only external API/data provider.
- Keep AI configuration, skills, MCP server configuration, and agent guidance local to the project.
- Make it easy to add, run, validate, and document new experiments.

## Non-Goals

- Build a production SaaS application.
- Create or maintain a custom backend API.
- Integrate with real third-party business systems.
- Optimize for deployment, monetization, or long-term product operations.
- Standardize every experiment so heavily that learning flexibility is lost.

## Primary User

Chris, a frontend architect and lifelong builder using this workspace to test ideas, learn new technologies, compare approaches, and refine AI-assisted development workflows.

## Core Principles

- Prefer practical learning over theoretical completeness.
- Keep experiments isolated and easy to remove.
- Favor Angular unless another tool is intentionally being evaluated.
- Use Nx to keep structure, commands, and dependency boundaries manageable.
- Use DummyJSON consistently so learning effort stays focused on frontend and architecture concepts.
- Keep project-specific AI behavior inside the repository.

## Functional Requirements

### Workspace Foundation

- The project must use Nx as the workspace foundation.
- The workspace should support multiple apps and libraries.
- Nx targets should be used for common tasks such as serving, building, testing, linting, and analyzing where applicable.
- Project structure should make experiments easy to discover.

### Angular Experiments

- Angular should be the default choice for new application experiments.
- Angular experiments should prefer modern Angular patterns, including standalone components and signals where appropriate.
- Medium or larger state-management experiments should support NgRx when state complexity justifies it.
- PrimeNG and Tailwind should be the preferred UI stack when UI components and styling are needed.

### Framework Flexibility

- The workspace should allow non-Angular experiments.
- Non-Angular experiments must be isolated in their own Nx projects.
- Any non-Angular project should have a clear learning purpose.

### DummyJSON Data Access

- All external API data must come from `https://dummyjson.com/`.
- API access should be encapsulated in data-access services, clients, or libraries.
- Experiments may use local fixtures for testing or offline work.
- Local fixtures should generally mirror DummyJSON response shapes.

### AI Local Configuration

- Agent instructions must be stored in root-level `AGENTS.md`.
- Project-specific AI configuration should be stored in repository-local directories such as `.codex/`, `.agents/`, or `.mcp/`.
- Skills and MCP server configuration needed for this project should not depend on global machine configuration.
- Secrets and private credentials must not be committed.

### Documentation

- The workspace must include root-level project guidance.
- Experiments should include short notes when setup, intent, tradeoffs, or learning outcomes are not obvious.
- AI-generated documents should have a robot emoji in the title.

## Suggested Initial Structure

```text
.
├── AGENTS.md
├── PRD.md
├── README.md
├── apps/
├── libs/
├── .agents/
├── .codex/
└── .mcp/
```

The exact structure may evolve based on Nx setup choices and future experiments.

## Success Criteria

- Chris can quickly add a new Angular experiment using Nx.
- Experiments can share reusable libraries without becoming tightly coupled.
- DummyJSON is the consistent source of external data.
- AI agents can understand project rules from repository-local files.
- The workspace remains flexible enough for future framework comparisons.

## Open Decisions

- Whether to initialize the Nx workspace immediately or keep the repo documentation-only for now.
- Which package manager to standardize on.
- Whether the first Angular app should be a general DummyJSON dashboard or a focused concept lab.
- Whether local MCP configuration should use `.mcp/`, `.cursor/mcp.json`, `.codex/`, or another documented layout.
