# React Simile Timeline - Project Rules

This document defines immutable rules for working on this project with Claude Code.

## Project Overview

React Simile Timeline is a modern React implementation of the MIT SIMILE Timeline visualization component. The project uses a pnpm monorepo structure with strict separation between the library and demo.

## MUST DO

### Architecture
- Library code lives ONLY in `packages/react-simile-timeline/`
- Demo code lives ONLY in `demo/`
- Demo MUST import from `react-simile-timeline` package, never relative paths to library source
- All timeline rendering logic MUST be in the library — demo is purely consumption/showcase

### Data Compatibility
- MUST maintain 100% backward compatibility with Simile JSON format
- MUST support all documented event fields (`start`, `end`, `title`, `description`, `color`, `textColor`, `icon`, `classname`, etc.)
- MUST handle all date formats (ISO 8601, legacy strings, BCE dates)

### Testing
- All new features MUST have corresponding Playwright E2E tests
- Core logic (date parsing, layout engine) MUST have Vitest unit tests
- Use Playwright MCP to verify UI matches design specifications

### Code Quality
- TypeScript strict mode — no `any` types without explicit justification
- All public APIs MUST have JSDoc comments and exported types

## MUST NOT DO

### Architecture
- NEVER put rendering logic in the demo — it only consumes the component
- NEVER import demo code from the library
- NEVER bypass pnpm workspace protocol for local development

### Dependencies
- NEVER add dependencies to the library without explicit approval
- NEVER bundle React — it's a peer dependency
- NEVER include Tailwind runtime in library bundle (use CSS variables/classes for theming)

### Compatibility
- NEVER make breaking changes to Simile JSON schema support
- NEVER change the public API without updating types and docs

### Scope
- NEVER create features not explicitly defined in the sprint plan or requested by the user
- NEVER embellish or "improve" beyond stated requirements — implement exactly what is specified
- NEVER add "nice to have" enhancements without explicit approval

### Git
- NEVER commit changes until the user explicitly requests a commit
- NEVER push to remote without explicit instruction

## Project Structure

```
/
├── packages/
│   └── react-simile-timeline/   # NPM library (publishable)
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── types/           # TypeScript types
│       │   ├── hooks/           # Custom hooks
│       │   └── utils/           # Utility functions
│       └── package.json
├── demo/                        # Demo app (consumes library)
│   ├── src/
│   ├── tests/                   # Playwright E2E tests
│   └── package.json             # depends on "react-simile-timeline": "workspace:*"
├── docs/                        # Project documentation
└── project-background/          # PRD and reference materials
```

## Commands

```bash
# Development
pnpm dev              # Start demo dev server
pnpm build            # Build library and demo
pnpm build:lib        # Build library only

# Testing
pnpm test             # Run Vitest unit tests
pnpm test:e2e         # Run Playwright E2E tests

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm typecheck        # Run TypeScript checks
```

## Reference Documents

- `project-background/project-background.md` - Full PRD with requirements
- `docs/API.md` - Component API reference
- `docs/SPRINT_PLAN.md` - Sprint deliverables and status
