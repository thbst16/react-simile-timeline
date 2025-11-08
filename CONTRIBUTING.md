# Contributing to React Simile Timeline

Thank you for your interest in contributing to React Simile Timeline! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Questions and Support](#questions-and-support)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers have the right to remove, edit, or reject comments, commits, code, issues, and other contributions that do not align with this Code of Conduct. Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by opening an issue or contacting the project maintainers.

## Getting Started

### Prerequisites

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher (comes with Node.js)
- **Git**: Latest version recommended

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/react-simile-timeline.git
   cd react-simile-timeline
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/thbst16/react-simile-timeline.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Available Scripts

```bash
# Start development server (http://localhost:5173)
npm run dev

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Build the library for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Run TypeScript type checking
npm run type-check

# Format code with Prettier
npm run format
```

### Project Structure

```
react-simile-timeline/
├── src/
│   ├── components/      # React components
│   ├── core/            # Core logic (Ether, EventSource, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── painters/        # Event painters
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Public API exports
├── public/              # Static assets
├── docs/                # Documentation
└── tests/               # Test files (co-located with source)
```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the code style guidelines (see below)
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

Before submitting:

```bash
# Run all tests
npm run test

# Check test coverage
npm run test:coverage

# Run linter
npm run lint

# Type check
npm run type-check

# Build to ensure no errors
npm run build
```

### 4. Commit Your Changes

We use conventional commits for clear commit history:

```bash
git commit -m "feat: add new painter type for dense timelines"
git commit -m "fix: resolve event overlap in compact painter"
git commit -m "docs: update API documentation for Timeline component"
git commit -m "test: add tests for date parsing edge cases"
```

**Commit message format:**
```
<type>: <short description>

<optional longer description>

<optional footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

## Code Style Guidelines

### TypeScript

- **Strict Mode**: TypeScript strict mode is enabled
- **No `any`**: Use proper types or `unknown` if needed
- **Explicit Return Types**: All functions must have explicit return types
- **Interface over Type**: Use `interface` for object types
- **Type Inference**: Use where obvious, but prefer explicit types for function parameters and returns

```typescript
// ✅ Good
interface EventData {
  title: string;
  start: Date;
  end?: Date;
}

function formatEvent(event: EventData): string {
  return `${event.title} at ${event.start}`;
}

// ❌ Bad
function formatEvent(event: any) {
  return `${event.title} at ${event.start}`;
}
```

### React

- **Functional Components**: Use functional components with hooks only
- **Hooks**: Use custom hooks for reusable logic
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Props Destructuring**: Destructure props in function signature

```typescript
// ✅ Good
interface TimelineProps {
  data: EventData[];
  onEventClick?: (event: EventData) => void;
}

export function Timeline({ data, onEventClick }: TimelineProps): JSX.Element {
  const sortedData = useMemo(() => data.sort(byDate), [data]);

  const handleClick = useCallback((event: EventData) => {
    onEventClick?.(event);
  }, [onEventClick]);

  return <div>{/* ... */}</div>;
}
```

### Naming Conventions

- **Components**: PascalCase (`Timeline`, `EventBubble`)
- **Hooks**: camelCase with `use` prefix (`useTimelineScroll`, `usePanZoom`)
- **Utilities**: camelCase (`parseDate`, `formatLabel`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ZOOM_LEVEL`)
- **Types/Interfaces**: PascalCase (`EventData`, `BandConfig`)

### File Organization

- **One component per file**
- **Co-locate tests**: `Component.tsx` and `Component.test.tsx`
- **Export from index.ts**: Public API exports only
- **Group related files**: Keep related code together

### Formatting

- **Prettier**: Code is auto-formatted with Prettier
- **ESLint**: Follow ESLint rules (run `npm run lint`)
- **Line Length**: 100 characters max (configured in Prettier)
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings, double for JSX attributes

```bash
# Format all code
npm run format
```

## Testing Requirements

### Minimum Coverage

- **Overall**: 80% minimum coverage
- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

### Testing Guidelines

**Unit Tests:**
- Test all utility functions
- Test custom hooks
- Test core logic (Ether, EventSource, etc.)

**Component Tests:**
- Test component rendering
- Test user interactions
- Test accessibility features
- Test edge cases

**Integration Tests:**
- Test component interactions
- Test data flow
- Test state management

### Writing Tests

Use Vitest and Testing Library:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from './Timeline';

describe('Timeline', () => {
  it('renders events correctly', () => {
    const events = [
      { title: 'Event 1', start: new Date('2024-01-01') }
    ];

    render(<Timeline data={events} />);

    expect(screen.getByText('Event 1')).toBeInTheDocument();
  });
});
```

### Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npm run test -- Timeline.test.tsx
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm run test`)
- [ ] Code coverage meets 80% minimum
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (if needed)

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub from your fork to `thbst16/react-simile-timeline:main`

3. **Fill out the PR template** with:
   - Clear description of changes
   - Related issue numbers (if applicable)
   - Screenshots (for UI changes)
   - Testing notes
   - Breaking changes (if any)

4. **Wait for review** - Maintainers will review your PR and may request changes

5. **Address feedback** - Make requested changes and push updates

6. **Merge** - Once approved, a maintainer will merge your PR

### PR Guidelines

- **Keep PRs focused**: One feature/fix per PR
- **Write clear descriptions**: Explain what and why
- **Update tests**: Add/update tests for your changes
- **Update docs**: Keep documentation in sync
- **Follow code style**: Match existing code style
- **Be responsive**: Respond to review feedback promptly

## Reporting Bugs

### Before Reporting

1. **Check existing issues**: Search for similar issues
2. **Verify it's a bug**: Ensure it's not expected behavior
3. **Test latest version**: Verify bug exists in latest release
4. **Gather information**: Collect browser, OS, version info

### Bug Report Template

When opening an issue, include:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.0]
- React Simile Timeline version: [e.g., 0.1.0-alpha.0]
- React version: [e.g., 18.3.0]

**Additional context**
Any other context about the problem.
```

## Requesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, screenshots, or examples.

**Would you be willing to contribute this feature?**
Yes/No - Are you willing to implement this feature yourself?
```

### Feature Guidelines

- **Align with project goals**: Features should fit the project's purpose
- **Consider scope**: Start small, iterate
- **Discuss first**: Open an issue to discuss before implementing
- **Maintain compatibility**: Don't break existing APIs without discussion

## Questions and Support

### Getting Help

- **Documentation**: Check [docs/](./docs/) folder
- **Examples**: See [docs/EXAMPLES.md](./docs/EXAMPLES.md)
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions

### Response Times

This is an open source project maintained in free time:
- Bug reports: Within 1 week
- Feature requests: Within 2 weeks
- Pull requests: Within 1 week
- Questions: Best effort

## License

By contributing to React Simile Timeline, you agree that your contributions will be licensed under the MIT License.

---

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

**Happy coding!** 🎉
