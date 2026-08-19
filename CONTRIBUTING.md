# Contributing to React Simile Timeline

First off, thank you for considering contributing to React Simile Timeline! It's people like you that make this project better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, JSON data, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment** (OS, browser, Node version, React version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. Fork the repo and create your branch from `dev`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes (`pnpm test` and `pnpm test:e2e`)
4. Make sure your code lints (`pnpm lint`)
5. Update documentation if needed

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/react-simile-timeline.git
cd react-simile-timeline

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests

# Build library
pnpm build:lib
```

## Project Structure

```
├── packages/
│   └── react-simile-timeline/   # NPM library source
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── hooks/           # Custom hooks
│       │   ├── styles/          # CSS styles
│       │   ├── types/           # TypeScript types
│       │   └── utils/           # Utility functions
│       └── package.json
├── demo/                        # Demo application
│   ├── src/
│   ├── public/data/             # Sample JSON data
│   └── tests/                   # Playwright E2E tests
└── docs/                        # Documentation
```

## Coding Style

- Use TypeScript with strict mode
- Follow the existing code style (enforced by ESLint/Prettier)
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Avoid `any` types without justification

## Editing the README

The repository root `README.md` is the **single source of truth**. The package
copy at `packages/react-simile-timeline/README.md` is generated from it — it is
what ships in the npm tarball and renders on npmjs.com, so it cannot be a
symlink (`pnpm pack` drops symlinked files).

After editing the root README, regenerate the package copy and commit both:

```bash
pnpm sync:readme
```

CI runs `pnpm sync:readme:check` and fails the build if the two files drift, so
edit the root file, never the package copy directly.

## Commit Messages

We use conventional commits. Format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(timeline): add zoom gesture support`
- `fix(events): correct date parsing for BCE dates`
- `docs(readme): add theming examples`

## Testing

- **Unit tests**: Vitest for component and utility testing
- **E2E tests**: Playwright for browser-based testing

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm --filter demo exec playwright test --ui
```

## Questions?

Feel free to open an issue with the "question" label or reach out via GitHub Discussions.

Thank you for contributing! 🎉
