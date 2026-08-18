# Plans

Implementation plans for major work on the React Simile Timeline library. A plan is written and reviewed **before** the work starts, then executed against. Small single-file fixes don't need one; reach for a plan when the change is multi-part or cross-cutting — a release milestone, a breaking or additive public API change, a dependency/toolchain migration, a packaging or distribution change, a CI/repository-configuration change, or a broad test/quality sweep.

**To start a plan, copy [`TEMPLATE.md`](TEMPLATE.md).** Don't improvise a new shape — every plan follows the same structure so they read consistently and stay reviewable.

## The standard

### Naming

`YYYY-MM-DD-<kebab-slug>-plan.md`

- `YYYY-MM-DD` — date the plan was written
- `<kebab-slug>` — 2-4 word hyphenated topic, normally the milestone name
- always ends `-plan.md`

### Header block

Bold key-value lines (not YAML frontmatter), directly under the `# React Simile Timeline — <Title>` H1:

- **Date:** — when written
- **Scope:** — the packages/files/workflows touched, the milestone and issue numbers covered, and explicitly what is **out** of scope
- **Goal:** — the target end-state in 1-3 sentences (observable outcome, not the task list)

### Section order (numbered top-level, `---` between each)

| Section                                | Purpose                                                                                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `## 0. Current State (baseline)`       | Measured starting point — counts (table when quantitative), the ask, confirmed defects with the command output or `file:line` that proves them. Every later section anchors here.       |
| `## 1..N. <work area>`                 | One section per coherent work area, normally one per issue or tightly-coupled issue group, each with **The ask:** / **Approach:** / **Deliverable:** labels and `### N.M` sub-sections. |
| `## Resolution model`                  | _(optional)_ Table splitting work by mode: Autonomous / Owner-applied / Review artifact / Recommend+apply. Define any review artifact here.                                             |
| `## Execution order`                   | Ordered, dependency-aware list; each item references the section it executes (§N) and what it unblocks. Call out ordering traps explicitly. Ends with the verification pass.            |
| `## Verification (hard requirement)`   | How the work is proven done — exercise the real thing over code-reading, concrete pass/fail checks, plus `pnpm lint` / `typecheck` / `test`.                                            |
| `## Constraints (hard rules in force)` | **Always last.** Only the rules binding this plan plus the always-on globals (PR-only, no names, owner-applied stays owner-applied).                                                    |

### Conventions

- Top-level sections numbered from **0** (Current State).
- `---` horizontal rule between every top-level section.
- Bold inline labels: **The ask:**, **Approach:**, **Deliverable:**, **Special case:**, **Principle:**.
- Tables for baseline counts and resolution-mode splits.
- Role language for people ("the maintainer", "the reporter", "a contributor") — **never personal names** (global rule).

### Repository context a plan should respect

- **Monorepo, pnpm workspaces.** `packages/react-simile-timeline` is the published library; `demo/` is the Vercel-deployed demo and the home of the Playwright e2e suite. State which of the two a plan touches.
- **Published to npm** as `react-simile-timeline`. Anything affecting the public API, `exports` map, emitted types, or tarball contents is a distribution change and needs a semver decision in the plan.
- **Peer-dependency promise.** `react: ^18 || ^19`. A plan that changes what is actually tested must either honor that range or narrow it.
- **Release is tag-triggered.** `.github/workflows/release.yml` fires on `v*` tags only; nothing publishes automatically. Plans that end in a release say who pushes the tag.
- **Milestones map to plans.** Each GitHub milestone should have at most one plan, named after it.

### Verification expectations by change type

| Change type       | Proof                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Library behavior  | `pnpm test`, with the failing case reproduced before and after                                    |
| Cross-environment | Run under multiple `TZ` values and Node versions — UTC-only CI has already hidden one real defect |
| Rendering / UI    | Drive the demo via `pnpm dev`, check the browser console                                          |
| Packaging         | `npm pack` and inspect tarball contents; `attw` for type-resolution across module modes           |
| Repository config | `gh api` / `gh repo view`, **and** attempt the action being blocked                               |

## Index

| Plan                                                       | Scope                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [repo hardening](2026-08-12-repo-hardening-plan.md)        | Milestone `Repo hardening` (#6–#12). Protect `main` behind an enforced PR + green-CI path, switch on vulnerability alerting, fix four CI defects including the missing non-UTC `TZ` leg, add CodeQL and a security policy, and clear stale branches. Config only — no library code, no release. **Complete 2026-08-13, 7/7.** |
| [v1.0.3 critical fixes](2026-08-13-critical-fixes-plan.md) | Milestone `v1.0.3 - Critical fixes` (#13–#17) and the npm release. Retroactively records the two P0s merged before this plan existed and puts their unreviewed scope decisions up for accept-or-revert; then dead demo links, doc corrections, npm provenance and the sourcemap decision, and the tag-and-publish mechanics. **Complete 2026-08-17, 6/6 — `1.0.3` published and attested.** |
| [v1.1.0 toolchain modernization](2026-08-18-toolchain-modernization-plan.md) | Milestone `v1.1.0 - Toolchain modernization` (#18–#24, #36, #37, #42). Every dependency major current and all 40 advisories cleared, ESLint on flat config, coverage measured for the first time, unit tests for the two untested core files, the React 19 peer promise proven or narrowed, the unverified WCAG claim corrected, and the release credential replaced with trusted publishing. Excludes #25, the WCAG audit itself. |
