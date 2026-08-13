# Security Policy

## Supported versions

Security fixes are applied to the latest `1.0.x` release. Older releases are not patched — upgrade to the current version to receive fixes.

| Version                 | Supported | Notes                                               |
| ----------------------- | --------- | --------------------------------------------------- |
| `1.0.2`                 | Yes       | Current release (`latest` on npm)                   |
| `1.0.1`                 | Yes       | Supported floor                                     |
| `1.0.0`                 | N/A       | **Never install.** Not available on npm — see below |
| `0.1.0` and pre-release | No        | Pre-1.0; upgrade to `1.0.1` or later                |

### About `1.0.0`

Version `1.0.0` was published to npm and subsequently unpublished. npm permanently blocks republishing an unpublished version, so `1.0.0` **cannot** be installed and never will be:

```
npm view react-simile-timeline@1.0.0
# npm error 404 No match found for version 1.0.0
```

A GitHub release and git tag for `v1.0.0` still exist, and the tag is retained because it preserves repository history. Neither is an installable target. The lowest installable release is `1.0.1`.

If a security advisory is ever filed against this package, `1.0.0` must not be listed as an affected or fixed version — it would reference something no consumer can install.

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.** A public issue discloses the problem in the act of reporting it.

Report privately through GitHub:

1. Go to the [Security tab](https://github.com/thbst16/react-simile-timeline/security)
2. Select **Report a vulnerability**
3. Complete the private advisory form

This opens a private channel visible only to the maintainers. GitHub notifies you as the report progresses.

### What to include

- Affected version(s)
- A description of the issue and its impact
- Steps to reproduce, ideally a minimal example
- Any suggested remediation

### Response expectations

This is a small, maintained-in-spare-time project. Targets are best effort, not contractual:

| Stage                                   | Target                                               |
| --------------------------------------- | ---------------------------------------------------- |
| Acknowledgement                         | Within 5 business days                               |
| Initial assessment                      | Within 10 business days                              |
| Fix or mitigation for a confirmed issue | Depends on severity; critical issues are prioritized |

If you have not heard back within 10 business days, please comment on the private advisory to bump it.

### Disclosure

Coordinated disclosure. Please allow a fix to ship before public disclosure. Reporters are credited in the advisory and the changelog unless they ask otherwise.

## Scope

### In scope

- The published `react-simile-timeline` npm package and its source under `packages/react-simile-timeline`
- The GitHub Actions workflows in `.github/workflows`, which form the release path to npm

### Out of scope

- **Development dependencies.** The package ships **zero runtime dependencies** — `react` and `react-dom` are peer dependencies supplied by the consuming application. Advisories affecting build and test tooling do not reach anyone who installs this package. Report them as regular issues.
- **The demo site.** A showcase deployment containing no user data and no authentication.
- Vulnerabilities in React itself — report those to the React project.
- Findings from automated scanners with no demonstrated exploit path against this package.

## Security posture

| Control              | Status                                                       |
| -------------------- | ------------------------------------------------------------ |
| Runtime dependencies | None; React is a peer dependency                             |
| Static analysis      | CodeQL on every PR and weekly, covering source and workflows |
| CI                   | Lint, typecheck, unit tests and e2e on Node 18/20/22/24      |
| Publishing           | Tag-triggered GitHub Actions workflow                        |
