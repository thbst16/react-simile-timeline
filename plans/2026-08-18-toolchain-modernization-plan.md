# React Simile Timeline — v1.1.0 Toolchain Modernization

**Date:** 2026-08-18
**Scope:** Milestone `v1.1.0 - Toolchain modernization` (#18, #19, #20, #21, #22, #23, #24, #36, #37, #42, #44). Touches `packages/react-simile-timeline` and `demo` dependency sets, `.eslintrc.cjs`, `vitest.config.ts`, `vite.config.ts`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `README.md`, `CHANGELOG.md`, the repository description, and the npm registry's trusted-publisher configuration. Explicitly **out of scope:** #25 (the WCAG 2.1 AA audit and remediation — a release of its own), every feature milestone (`v1.2.0`–`v1.4.0`, issues #1–#5), and any change to the public API surface or the `exports` map.

**Goal:** Every dependency major current, zero open security findings of any kind — Dependabot advisories and CodeQL code-scanning alerts both — the test suite exercising the components and the React version range the package actually promises, and a release path with no stored credential. On completion the repository's stated claims — peer range, accessibility, coverage — are each either proven by a test or narrowed to what is true.

---

## 0. Current State (baseline)

Measured 2026-08-18 at `main@a1d9cd9`, immediately after the `1.0.3` release.

### Dependency lag

| Package                     | Pinned   | Current | Majors behind | Issue         |
| --------------------------- | -------- | ------- | ------------: | ------------- |
| `typescript`                | 5.9.3    | 7.0.2   |             2 | #21           |
| `vite`                      | 5.4.21   | 8.2.1   |             3 | #18           |
| `vite-plugin-dts`           | 3.9.1    | 5.0.3   |             2 | #18           |
| `@vitejs/plugin-react`      | 4.7.0    | 6.0.5   |             2 | **untracked** |
| `vitest`                    | 1.6.1    | 4.1.10  |             3 | #19           |
| `jsdom`                     | 24.1.3   | 30.0.1  |             6 | #19           |
| `eslint`                    | 8.57.1   | 10.8.1  |             2 | #20           |
| `@typescript-eslint/*`      | 7.18.0   | 8.67.0  |             1 | #20           |
| `eslint-plugin-react-hooks` | 4.6.2    | 7.1.1   |             3 | #20           |
| `eslint-config-prettier`    | 9.1.2    | 10.1.8  |             1 | #20           |
| `@types/react`              | 18.3.27  | 19.2.18 |             1 | #21           |
| `@types/react-dom`          | 18.3.7   | 19.2.4  |             1 | #21           |
| `@testing-library/react`    | 14.3.1   | 16.3.2  |             2 | #21           |
| `@testing-library/jest-dom` | 6.9.1    | 7.0.1   |             1 | #21           |
| `@types/node`               | 20.19.27 | 26.2.0  |             6 | #21           |
| `tailwindcss` (demo)        | 3.4.19   | 4.3.3   |             1 | **untracked** |
| `@playwright/test` (demo)   | 1.57.0   | 1.62.1  |             0 | —             |
| `eslint-plugin-react`       | 7.37.5   | 7.37.5  |             0 | —             |

**Two majors are in the tree that no issue covers.** `@vitejs/plugin-react` is coupled to the Vite upgrade and must move with it; `tailwindcss` belongs to the demo and moves independently. Both are folded into this plan rather than discovered mid-migration.

### Security findings

**42 open across the two scanners**, which is the number the repository's Security tab reports:

| Source                | Open | Covered by |
| --------------------- | ---: | ---------- |
| Dependabot advisories |   40 | §1, §2, §3 |
| CodeQL code scanning  |    2 | §6.5       |

#### Dependabot: 40

Up from the 30 recorded in the `v1.0.3` plan five days earlier. All are dev-only — the published package has no runtime dependencies, so no consumer is exposed. The exposure is to CI and to anyone running the suite.

| Severity | Count |
| -------- | ----: |
| Critical |     2 |
| High     |    21 |
| Medium   |    16 |
| Low      |     1 |

Every advisory traces to one of three upgrades. The mapping matters, because it decides the execution order:

| Cleared by                         | Alerts | Packages                                                                                                           |
| ---------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------ |
| **#18** Vite / vite-plugin-dts     | **22** | `vite` (9), `postcss` (4), `lodash` (3), `nanoid` (2), `esbuild`, `rollup`, `vue-template-compiler`, `@babel/core` |
| **#20** ESLint / typescript-eslint | **13** | `minimatch` (4), `js-yaml` (3), `picomatch` (3), `brace-expansion` (2), `flatted`                                  |
| **#19** Vitest / jsdom             |  **5** | `vitest` (2, **both critical**), `ws` (2), `form-data`                                                             |

Two chains are worth naming:

- `vite-plugin-dts@3` pulls `@microsoft/api-extractor` (→ `lodash`) **and the entire Vue toolchain** — `vue-tsc`, `@vue/language-core`, `vue-template-compiler` — into a React library. v5 drops both paths.
- `vitest@1` carries the only **critical** advisory in the tree: arbitrary file read and execute when the Vitest UI server is listening.

#### CodeQL: 2

Both `actions/missing-workflow-permissions`, both medium, both in `ci.yml` — the `build-and-test` job at line 16 and the `e2e` job at line 80. Neither declares a `permissions` block, so both run with the repository's default `GITHUB_TOKEN` scope.

This is a gap left by the repo hardening milestone rather than new drift. `codeql.yml` and `release.yml` both scope their tokens correctly; `ci.yml` never did. CodeQL's own `analyze (actions)` job has been reporting it since CodeQL was added in #11, and the finding was never actioned. Tracked as #44.

#### One open pull request

[#33](https://github.com/thbst16/react-simile-timeline/pull/33), from Dependabot, bumping `postcss` 8.5.6 → 8.5.23 in the demo. Open since 2026-08-13 with all 8 checks green.

It is worth more than it looks. `postcss` carries four of the 40 advisories, and their patched versions are 8.5.10, 8.5.12, 8.5.18 and 8.5.23 — so this single patch-level bump clears **all four**, taking the count to 36 before any migration starts.

### Test suite

|                |                                                          Count |
| -------------- | -------------------------------------------------------------: |
| Unit tests     | **65**, 4 files, green under `TZ=UTC` and `TZ=America/Chicago` |
| Playwright e2e |                                                20, 1 spec file |
| Coverage       |                                             **Never measured** |

Issues #19 and #23 both record 55 unit tests. The real number is 65 — the `1.0.3` timezone work added ten. Recorded here so the plan does not carry a stale figure forward.

`test:coverage` is declared and has never run:

```
$ npx vitest run --coverage
MISSING DEPENDENCY  Cannot find dependency '@vitest/coverage-v8'
```

Coverage is concentrated in the pure utilities. The two most complex files in the codebase have **zero** unit tests between them:

| File                                  | LOC | Unit tests |
| ------------------------------------- | --: | ---------: |
| `src/components/TimelineProvider.tsx` | 429 |          0 |
| `src/hooks/usePan.ts`                 | 234 |          0 |

`Timeline.test.tsx` holds shallow render assertions only. No interaction is covered at the unit level; the 20 e2e tests carry the entire behavioral load.

### Claims that outrun the evidence

**React 19.** `peerDependencies` advertises `react: "^18.0.0 || ^19.0.0"` and the README markets "Built with React 18/19". Every dev dependency, the demo, and the whole suite run on React 18. React 19 support is asserted and never exercised.

**Accessibility.** The repository description asserts "WCAG 2.1 AA accessible" while the CHANGELOG lists "Full WCAG 2.1 AA compliance" under _Planned_ — the same conformance claimed as shipped and pending at once. Measured against the implementation:

|                           |                                                                                        Count |
| ------------------------- | -------------------------------------------------------------------------------------------: |
| `aria-*` / `role=` usages |                                                                                           14 |
| Components carrying any   |                                              **3** — `EventMarker`, `EventPopup`, `Timeline` |
| Components with none      | **6** — `Band`, `EventTrack`, `HotZones`, `OverviewMarkers`, `TimeScale`, `TimelineProvider` |

Issue #24 records these 14 usages as spread "across 10 components". They are not; they sit in three. Two thirds of the component surface has no ARIA at all, which makes the conformance claim weaker than the issue implies, not stronger.

### Lint

One warning, and it is a real defect rather than a style nit:

```
src/components/HotZones.tsx
  33:9  warning  The 'viewportLeftDate' object construction makes the dependencies of
                 useMemo Hook (at line 68) change on every render
```

The `useMemo` it defeats is the same class of problem measured in #36 — memoization that never hits during interaction.

### Release path

`1.0.3` published successfully with provenance on 2026-08-17. It nearly did not: `NPM_TOKEN` had expired silently between releases and was caught only by a pre-flight job added for the purpose (#41). The replacement token carries an expiry of its own.

### Repository shape

pnpm workspaces, Node `>=18`, CI matrix on Node 18/20/22/24 at `TZ=UTC` plus Node 20 at `TZ=America/Chicago`. Eight required checks. `.eslintrc.cjs` is legacy `eslintrc` format, which ESLint 9+ does not accept.

**Principle:** every number above was produced by running something. Anything this plan has not measured is a pre-flight check in §7, not an assertion.

---

## 1. Security-driven upgrades (#19)

**The ask:** clear the only critical advisory in the tree, and do it before anything else has a chance to churn the lockfile.

**Approach:** Vitest and jsdom move together — Vitest declares jsdom as a peer, so they cannot be staged apart. This is the smallest of the three upgrades and the most isolated: nothing in the build or lint path depends on it.

> **Correction (post-execution).** The independence claim held only up to **vitest 3**. `vitest@4` requires `vite ^6 || ^7 || ^8`, so it is gated on §2 (#18) — this issue is **not** independent of the build upgrade at its stated target. #19 shipped `vitest@3.2.7` + `jsdom@26.1.0` (both criticals, `ws` and `form-data` cleared); the step to `vitest@4` / `jsdom@30` was split out to #50.

### 1.1 Vitest 1 → 4, jsdom 24 → 30

**Deliverable:** `vitest@4`, `jsdom@30`, `vitest.config.ts` migrated, all 65 tests green under both `TZ=UTC` and `TZ=America/Chicago`, and the `vitest`, `ws` and `form-data` advisories gone.

> **Correction (post-execution).** `vitest@4` and `jsdom@30` are **not installable at this point in the sequence**, and neither constraint was checked when the plan was written:
>
> - `vitest@4` needs Vite 6+ → gated on #18.
> - `jsdom@30` needs Node `^22.22.2 || ^24.15.0 || >=26` → breaks the Node 18 and 20 CI legs and contradicts `engines.node: >=18`.
>
> #19 shipped `vitest@3.2.7` + `jsdom@26.1.0` — 26 is the last jsdom that keeps the promised Node range **and** drops `form-data`. The advisory goal was met in full. The remaining bump is #50, gated on #18 and on the Node-floor decision (now settled below).

Vitest 3 and 4 both changed config surface and default reporters; `environment: 'jsdom'`, `globals: true` and `setupFiles` all need re-checking against v4 rather than assumed to carry over.

**Special case:** the suite must be run under a non-UTC `TZ` at every step. A green UTC-only suite is precisely what hid the `1.0.3` date defect for eight months, and a test-runner migration is exactly where an assertion could quietly stop running.

---

## 2. Build toolchain (#18)

**The ask:** three Vite majors, two `vite-plugin-dts` majors, and the largest advisory cluster in the repository.

**Approach:** one PR, because `vite`, `@vitejs/plugin-react` and `vite-plugin-dts` are a single interlocking set, and because `vite` is a dependency of both workspace packages so they cannot move independently. This is the change most likely to alter the published artifact, so the tarball is compared byte-for-byte in kind, not merely rebuilt.

### 2.1 Vite 5 → 8, vite-plugin-dts 3 → 5, @vitejs/plugin-react 4 → 6

**Deliverable:** both packages on `vite@8`, the library on `vite-plugin-dts@5`, and the API Extractor warning gone:

```
*** The target project appears to use TypeScript 5.9.3 which is newer than the
    bundled compiler engine; consider upgrading API Extractor.
```

`vite-plugin-dts@5` drops the API Extractor rollup path that emits this, and with it the `lodash` and Vue-toolchain dependency chains.

> **Correction (post-execution).** v5 does **not** drop the API Extractor path — it drops the _bundled copy_ of `@microsoft/api-extractor` and still uses it for the type rollup, so it had to be added as a **direct** devDependency (7.58.12). That version no longer depends on `lodash`, so the advisory outcome is as predicted, by a different mechanism. Three regressions the plan did not foresee also surfaced here — see the execution record below.

### 2.2 The published artifact must not regress

**Deliverable:** a before/after comparison of the packed tarball, not just a successful build.

`1.0.3` ships 11 files at 107,595 bytes packed. The declaration bundler is changing underneath the type emit, so the risk is specifically that `dist/index.d.cts` or `dist/index.d.ts` comes out different in shape while the build still reports success.

| Must hold after the upgrade         | Baseline                                   |
| ----------------------------------- | ------------------------------------------ |
| File count                          | 11, including `LICENSE` and `style.css`    |
| `dist/index.d.cts` present          | 19,916 bytes                               |
| `attw` across four resolution modes | Clean                                      |
| Public export surface               | Identical — diff the `.d.ts`               |
| Bundle size                         | 11,737 B gzipped ESM; any change explained |

**Special case:** the root `LICENSE` reaches the tarball only because `pnpm pack` pulls it in from the workspace root. It is not in the package directory. Any change to how packing happens must be checked against the file list, not assumed.

---

## 3. Lint toolchain (#20)

**The ask:** ESLint 8 → 10, which forces the flat-config migration, plus the second-largest advisory cluster.

**Approach:** the largest single migration in the milestone and the one with no partial state — `.eslintrc.cjs` and `eslint.config.js` are not both honored by ESLint 10.

### 3.1 Flat config migration

**Deliverable:** `.eslintrc.cjs` replaced by `eslint.config.js`, with `eslint@10`, `@typescript-eslint@8`, `eslint-plugin-react-hooks@7` and `eslint-config-prettier@10`. The existing rule set is preserved; any rule that cannot be carried across is documented as a deliberate relaxation rather than dropped silently.

### 3.2 The outstanding warning is fixed, not suppressed

**Deliverable:** `HotZones.tsx:33` resolved by moving the `viewportLeftDate` construction inside the `useMemo` at line 68, so the memo actually memoizes.

### 3.3 Warnings cannot accumulate again

**Deliverable:** `--max-warnings=0` in the `lint` script, so CI fails on a warning rather than printing it. The current single warning has survived every release to date because nothing forces it to be dealt with.

---

## 4. Types and the React version promise (#21)

**The ask:** TypeScript 5.9 → 7, React 19 type packages, testing-library majors — and closing the gap between the peer range the package advertises and the one it tests.

**Approach:** the type upgrades are mechanical. The React 19 question is not, and it is the substantive decision in this milestone.

### 4.1 TypeScript 7 and the type packages

**Deliverable:** `typescript@7`, `@types/node@26`, `@testing-library/jest-dom@7`, `pnpm typecheck` clean across both packages, and `attw` still clean — a TypeScript major can change emitted declarations.

### 4.2 React 19 — proven or narrowed

**Deliverable:** a decision, applied.

The package promises `^18.0.0 || ^19.0.0` and has never been run against React 19. Two honest options:

| Option           | Effect                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. Prove it**  | CI matrix leg running the suite against React 19 alongside 18. `@testing-library/react@16` is required for React 19. The promise becomes true and stays true |
| **B. Narrow it** | Drop `^19` from `peerDependencies` until it is tested. Honest immediately, but a **breaking change** for any consumer already installing on React 19         |

**Recommendation: A.** B is semver-breaking in a minor release, and the promise has been public since `1.0.0` — narrowing it now would strand consumers who took the package at its word. The cost of A is one CI matrix dimension.

**Special case:** `@types/react@19` against a React 18 runtime is a known-awkward combination. If the matrix runs both, the type packages must be resolved per-leg, not pinned globally to 19 while the suite executes on 18.

---

## 5. Test coverage (#22, #23)

**The ask:** a coverage number that exists, and unit tests for the two files that have none.

**Approach:** #22 before #23, because there is no way to know whether #23 moved anything without a baseline first.

### 5.1 Coverage tooling (#22)

**Deliverable:** `@vitest/coverage-v8` installed, the v8 provider configured, the baseline measured and recorded, thresholds set at or slightly below that baseline so they ratchet upward, and a coverage step in CI that fails the build when thresholds are missed.

**Principle:** thresholds are set from the measured baseline, never from an aspiration. A threshold above the current number is a red build on day one and gets weakened rather than met.

### 5.2 Unit tests for the untested core (#23)

**Deliverable:** unit coverage for `TimelineProvider` (429 LOC) and `usePan` (234 LOC), plus interaction tests for `EventMarker` and `EventPopup`.

| Target                      | Cases                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `TimelineProvider`          | inline data, `dataUrl` fetch, `dataUrls` multi-source merge, fetch failure, `jumpToDate`, theme switching, band synchronization |
| `usePan`                    | drag pan, bounds clamping, keyboard arrow navigation, `+`/`-` zoom, wheel zoom                                                  |
| `EventMarker`, `EventPopup` | click, keyboard activation                                                                                                      |

Thresholds from §5.1 are raised to the new floor once these land.

---

## 6. Claims, correctness and credentials (#24, #36, #37, #42)

**The ask:** four independent items that share no dependencies with each other and none with §1–§5.

### 6.1 The accessibility claim (#24)

**Deliverable:** no conformance-level assertion anywhere in the repository description, README, or package metadata — replaced with what is implemented, e.g. "keyboard navigable, ARIA-labeled, screen-reader friendly", linking to #25 so the intent to conform stays visible. The CHANGELOG continues to list full AA conformance as planned.

The baseline in #24 needs correcting as part of this: the 14 ARIA usages sit in **3** components, not 10, with six components carrying none.

**Special case:** the repository description is a GitHub setting with no PR form. It is owner-applied.

**Special case:** an unverified accessibility conformance claim on a public package is a procurement risk for public-sector consumers who rely on that statement. This is the item with consequences outside the repository, and it is cheap. It should not sit behind three dependency majors.

### 6.2 Layout cost is linear per frame (#36)

**Deliverable:** per-pass layout cost independent of total event count for point events, a benchmark covering 1k/10k/50k in the suite, and the README performance claim re-checked against the new numbers.

Measured baseline, 1200px viewport at 100px/day:

| Events | Rendered nodes | ms per layout pass |
| -----: | -------------: | -----------------: |
|  1,000 |              1 |               0.54 |
| 10,000 |              3 |               4.00 |
| 50,000 |             11 |              18.03 |

Node count is flat — culling works. Time is linear, because `filterVisibleEvents` re-scans and re-`parseDate`s every event on every pass, and the `useMemo` keys on values that change on every pan. At 50k a single pass exceeds the 16.7 ms budget for 60 FPS before React does any work.

Directions: parse each event's bounds once at load and carry epoch numbers on the event; keep events sorted and binary-search the visible window; an interval structure or a max-end bound for duration events.

### 6.3 Duplicate READMEs (#37)

**Deliverable:** one source of truth, or a CI check that fails on drift.

`README.md` and `packages/react-simile-timeline/README.md` are byte-identical with nothing keeping them so. This has already cost twice — the dead demo link in #15 and the badge in #16 both had to be fixed in two places, and fixing only the root would have left the defect in front of every npm consumer.

**Special case:** the `1.0.2` release exists solely to add a README to the tarball. Whatever replaces the duplication must not regress that — `npm pack` must still contain one.

### 6.4 Trusted publishing (#42)

**Deliverable:** a release published with no `NPM_TOKEN` in the repository, attestations still present, and the secret deleted.

Three things must be established by running them rather than read from documentation:

| Unknown                                     | Why it matters                                                                                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm version on the runner                   | Trusted publishing needs npm ≥ 11.5.1; `release.yml` pins Node 20, which ships npm 10.8.2                                                                         |
| Whether pnpm's `--filter` path carries OIDC | pnpm 9.0.0's recursive publish rebuilds the npm invocation and forwards only `--access`, `--dry-run`, `--otp`. That path already silently swallows `--provenance` |
| Registry-side registration                  | The trusted publisher must be registered against the package on npmjs.com before the first OIDC publish                                                           |

**Special case:** the `--provenance` finding from #17 is the precedent. A flag was accepted, silently dropped, and would have produced an unattested release that looked successful. Anything in this area is verified by inspecting the published result, never by a green workflow.

### 6.5 Workflow token scope (#44)

**Deliverable:** an explicit `permissions` block on both jobs in `ci.yml`, both CodeQL alerts closed, and `gh api …/code-scanning/alerts` returning zero open.

```yaml
permissions:
  contents: read
```

`codeql.yml` and `release.yml` already scope their tokens; `ci.yml` is the only workflow that does not, at either job. This is the smallest change in the milestone — four lines — and it is the difference between "zero advisories" and "zero security findings".

**Special case:** the `e2e` job uploads a Playwright report on failure. `actions/upload-artifact@v4` goes through the Actions API rather than a token scope, so `contents: read` should be sufficient — but this is confirmed by exercising the failure path, not by reasoning about it. A permissions block that breaks artifact upload would only surface on a red build, which is exactly when the report is needed.

### 6.6 The open Dependabot pull request

**Deliverable:** #33 merged, and the four `postcss` advisories closed with it.

The bump is patch-level within `postcss@8`, dev-only, and has been green on all 8 checks since 2026-08-13. It is merged **before** §2 rather than left to be swept up by the Vite upgrade, for two reasons: it removes four advisories at zero risk, and `postcss` is a direct devDependency of `demo` as well as a transitive one of Vite, so the Vite upgrade would not necessarily move it.

**Special case:** Dependabot's configuration is deliberately dormant (`58acbf3`), so this PR exists because security updates are opened regardless of schedule. Merging it does not re-open the question of turning scheduled updates on — that stays dormant for this milestone.

---

## Resolution model

| Work item                                               | Mode                                                                  |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| §1 Vitest / jsdom (#19)                                 | Autonomous — PR, then verify                                          |
| §2 Vite / dts / plugin-react (#18)                      | Autonomous — PR, then verify                                          |
| §3 ESLint flat config (#20)                             | Autonomous — PR, then verify                                          |
| §4.1 TypeScript and type packages (#21)                 | Autonomous — PR, then verify                                          |
| §4.2 React 19 — prove or narrow                         | **Review artifact** — the maintainer decides; A recommended           |
| §5.1 Coverage tooling (#22)                             | Autonomous — PR; **baseline number reported, thresholds set from it** |
| §5.2 Unit tests (#23)                                   | Autonomous — PR, then verify                                          |
| §6.1 README and CHANGELOG wording (#24)                 | Autonomous — PR                                                       |
| §6.1 Repository description (#24)                       | **Owner-applied** — GitHub setting, no PR form                        |
| §6.2 Layout performance (#36)                           | Autonomous — PR, benchmark before and after                           |
| §6.3 README duplication (#37)                           | **Review artifact** — four options, no obvious winner; then applied   |
| §6.4 Workflow and npm changes (#42)                     | Autonomous — PR                                                       |
| §6.4 Trusted-publisher registration (#42)               | **Owner-applied** — npm registry setting                              |
| §6.4 First OIDC publish, secret deletion                | **Owner-applied — irreversible**                                      |
| §6.5 Workflow token scope (#44)                         | Autonomous — PR, then confirm the alerts close                        |
| §6.6 Merge the open Dependabot PR (#33)                 | Autonomous — merge, then confirm the advisory count drops             |
| Untracked majors: `@vitejs/plugin-react`, `tailwindcss` | Recommend + apply — folded into §2 and a demo PR                      |

**Deliverable (review artifact):** a single comment covering the §4.2 React 19 decision and the §6.3 deduplication options, each with a recommendation, for one round of approval rather than two.

---

## Execution order

The advisory-clearing upgrades come first, but **not** in severity order. #19 is smallest and most isolated; #18 clears the most alerts but touches the published artifact; #20 has no partial state. Interleaving them means a lockfile churning under three migrations at once.

1. **§6.6 Merge the open Dependabot PR (#33)** — first because it is already green and clears four advisories on its own. Merging it before the lockfile starts moving under three migrations means the `postcss` alerts are verifiably gone rather than lost in the churn.
2. **§6.5 Workflow token scope (#44)** — four lines, no dependencies, and it closes both CodeQL alerts. Doing it now means the remaining security work is a single scanner's list instead of two.
3. **§6.1 Accessibility claim (#24)** — early, despite being late in the plan's numbering. It is documentation and a repository setting, it depends on nothing, and it is the only item whose consequences reach outside the repository. It should not wait behind three dependency majors.
4. **§1 Vitest / jsdom (#19)** — the only **critical** advisory, and the upgrade with the smallest blast radius. Also establishes that the suite still passes on a new runner _before_ anything else changes underneath it. A test-runner migration performed after the build changes cannot distinguish its own breakage from the build's.
5. **§5.1 Coverage tooling (#22)** — immediately after #19, because the coverage provider must match the Vitest major, and because every later section wants a coverage number to move.
6. **§2 Vite / dts / plugin-react (#18)** — clears 22 alerts and removes the Vue toolchain. Sequenced after the test suite is on a current runner so a build regression surfaces as a test failure rather than a mystery.
7. **§3 ESLint flat config (#20)** — clears 13 alerts. Independent of the build, but sequenced after it so a flat-config migration is not debugged simultaneously with a Vite major.
8. **§4.1 TypeScript 7 and type packages (#21)** — after ESLint, because `@typescript-eslint@8` must already be in place to parse against TypeScript 7.
9. **§4.2 React 19 decision, then applied** — the review artifact goes up with §4.1 so one approval covers both.
10. **§5.2 Unit tests (#23)** — after the toolchain settles. Tests written against a runner that is about to be replaced get rewritten.
11. **§6.2 Layout performance (#36)** — needs the benchmark harness from §5.1 and the component tests from §5.2 to prove the optimization changed no behavior.
12. **§6.3 README duplication (#37)** — any time; sequenced here so it does not conflict with the README edits in §6.1 and §6.2.
13. **§6.4 Trusted publishing (#42)** — last of the code changes, so it is exercised by the actual `1.1.0` release rather than a contrived one.
14. **Pre-flight** (§7) — after all code is merged, before the version bump.
15. **Version bump PR**, then **maintainer pushes the tag**.
16. **Verification** (below), against the published package.

**Ordering trap:** #22 must follow #19, not precede it. `@vitest/coverage-v8` is versioned in lockstep with Vitest; installing the provider against Vitest 1 and then upgrading to Vitest 4 means installing it twice and re-baselining coverage twice.

**Ordering trap:** #23 must follow #21. Writing component tests against `@testing-library/react@14`, then moving to 16 for React 19, means rewriting them.

---

## 7. Pre-flight checks

**Deliverable:** each confirmed before the version bump, none assumed.

- `pnpm audit` reports **zero** advisories at every severity, and the Dependabot alert count on the repository reads 0
- **Zero open CodeQL code-scanning alerts** — the Security tab shows 0 findings from both scanners, not just one
- No open Dependabot pull requests left unmerged or unexplained
- All 8 required checks green on `main`, plus any new leg added by §4.2 and §5.1
- `attw` clean and the tarball file list unchanged from `1.0.3` — 11 files including `LICENSE` and `dist/index.d.cts`
- npm version on the release runner is ≥ 11.5.1, confirmed from a workflow log rather than inferred from the Node version
- The trusted publisher is registered on npmjs.com against `react-simile-timeline`
- Coverage thresholds are met, and the number is at or above the §5.2 floor

---

## Verification (hard requirement)

Exercise the published artifact and the running application, not the working tree. Every defect this repository has shipped was invisible to a green build.

- **Install the published `1.1.0` from npm into a scratch project and type-check it as a CommonJS consumer** under `module`/`moduleResolution: node16`. This is the check that failed against `1.0.2` with `TS7016`; it must keep passing across a TypeScript major and a declaration-bundler major.
- **Confirm the date behavior survives the runner migration** against the published package: `parseDate('2023-01-15')` under `TZ=America/Chicago` returns day 15.
- **Run the suite against both React 18 and React 19** if §4.2 lands option A, and confirm both legs are required checks — an advisory leg proves nothing, as #13 established.
- **Drive the demo at `pnpm dev`** after §2 and §6.2, with the browser console clean. A Vite major and a layout rewrite are both capable of breaking rendering while every test passes.
- **Benchmark §6.2 before and after** at 1k/10k/50k events, and confirm the per-pass time is flat rather than linear. The README claim is then re-checked against the measured number.
- Confirm: (a) `npm view react-simile-timeline@1.1.0 dist.attestations` non-empty **with no `NPM_TOKEN` in the repository**; (b) the tarball file list still has 11 files including `LICENSE`; (c) `attw --pack` clean on the published version; (d) `npm view` shows `latest: 1.1.0`; (e) zero Dependabot alerts **and** zero CodeQL code-scanning alerts.
- `pnpm lint` clean at `--max-warnings=0`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e` green; suite green under a non-UTC `TZ`.
- The repository description carries no conformance-level claim, and #25 is linked from wherever accessibility is described.

---

## Execution record (updated as the milestone runs)

The plan is the pre-work artifact; this section reconciles it against what actually shipped. Added because the milestone is being executed in sequence and several plan assumptions did not survive contact.

### Landed

| #   | Section | Shipped as | Notes                                                                                                                               |
| --- | ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| #44 | §6.5    | `43df8b5`  | ci.yml token scope; both CodeQL alerts fixed; verified by forcing a failing e2e run and confirming the artifact still uploaded      |
| #33 | §6.6    | `9333349`  | postcss 8.5.6 → 8.5.23; cleared 6 advisories (postcss + nanoid), not the 4 predicted                                                |
| #24 | §6.1    | `0ce6dea`  | WCAG claim corrected in description, both READMEs, CHANGELOG. Baseline in #24 was wrong: 14 ARIA usages in **3** components, not 10 |
| #19 | §1      | `edae45b`  | vitest 3.2.7 + jsdom 26 (not 4/30 — see §1 corrections); both criticals + ws + form-data cleared                                    |
| #18 | §2      | `0211eaa`  | vite 8, plugin-react 6, vite-plugin-dts 5, vitest 4. Node floor narrowed to 20.19; ruleset required checks 8 → 7                    |

### Three regressions §2 did not foresee (all caught by the §2.2 tarball/declaration diff)

1. **`rollupTypes` renamed `bundleTypes`** in vite-plugin-dts 5 — the old name is silently ignored, producing a 1.1 kB re-export stub instead of the 19.9 kB rolled-up declarations while the build reports success.
2. **CSS entrypoint renamed** — Vite 6 changed the default lib CSS asset name to the package name, emitting `dist/react-simile-timeline.css` and 404ing the documented `react-simile-timeline/style.css` import. Fixed with `cssFileName: 'style'`. This was also the true cause of the failed Dependabot PR (#46), first misattributed to `@vitejs/plugin-react`.
3. **vitest 3 kept a second Vite 5 in the tree** — its peer range is `^5 || ^6 || ^7`, so all 9 vite advisories would have stayed open while the upgrade looked complete. vitest 4 resolved it.

The §2.2 discipline is what surfaced all three. The plan's _method_ held even where its _claims_ did not.

### The Node floor — the miss that mattered

§0 recorded `Node >=18` but never checked Vite's `engines`. Vite 8 requires `^20.19.0 || >=22.12.0`, so the Node 18 CI leg failed (`SyntaxError: … 'node:util' does not provide an export named 'styleText'`). **Option A** was chosen: `engines.node` narrowed to `>=20.19.0`, CI matrix now 20/22/24, and the `main` ruleset's required checks reduced from 8 to 7 (the plan did not anticipate the ruleset edit; removing a required check without it deadlocks every future merge). This is the change that reopens the semver question in Constraints.

### Two cascades the plan did not model

- **Dependabot Updates workflow** was failing on a chain of security updates it could not resolve, each unblocked in turn: `form-data` (jsdom@24, #19) → `@babel/core` (@vitejs/plugin-react@4, #18) → `flatted` (eslint@8, **#20, still open**). #20 is the last known blocker of this kind.
- **Advisory count**: 42 → 34 (§6.5/§6.6) → 29 (#19) → **14** (#18). The remaining 14: 11 trace to eslint@8 / typescript-eslint@7 (**#20**), 3 are dev-only leftovers filed as **#52**.

### Issues spawned by execution (not in the original plan)

| #   | Why it exists                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------- |
| #50 | vitest 4 / jsdom 30 — split from #19; gated on #18 (done) and the Node floor (done), so now unblocked |
| #52 | esbuild, vue-template-compiler, rollup — dev-only advisories the Vite upgrade could not dislodge      |

### Order actually executed vs planned

The plan led with §6.6 and §6.5 (cheap security wins) ahead of §6.1, which matched. §1 (#19) then §2 (#18) held. **Not yet started:** §3 (#20), §4 (#21), §5 (#22, #23), §6.2 (#36), §6.3 (#37), §6.4 (#42). #20 is the recommended next step — biggest advisory cluster and the last Dependabot blocker.

---

## Constraints (hard rules in force)

- **PRs only — no direct commits** (global rule), mechanically enforced by the ruleset on `main`.
- **No plan, no milestone work.** This plan is reviewed and approved before §1 begins. The `v1.0.3` plan needed a retroactive §1 because two P0s shipped without one.
- **Publishing is owner-applied.** The tag push, the npm trusted-publisher registration, and the `NPM_TOKEN` deletion are not performed on the maintainer's behalf. `1.0.0` is permanently uninstallable on this package because a publish was reversed.
- **Do not delete or move any tag.** They are the only surviving reference to the pre-rebuild history (#8). There are 9.
- **The public API surface does not change.** This is a toolchain milestone. Any change to the `exports` map, the emitted declarations, or the exported symbol set is a defect in the upgrade, not a feature of it — the `.d.ts` is diffed, not eyeballed.
- **Semver:** `1.1.0` as a minor. ~~The dependency majors are all `devDependencies` and invisible to consumers. The one consumer-visible decision is the §4.2 peer range~~ **— superseded, see the OPEN DECISION below.** #18 raised `engines.node` from `>=18.0.0` to `>=20.19.0`, which a Node 18 consumer sees at install time. There are now **two** consumer-visible changes, not one, and whether the `engines` bump keeps this a minor is unresolved.

> **OPEN DECISION — is `1.1.0` still the right version?** The plan asserted this milestone was a clean minor on the premise that everything shipping was a `devDependency`. That premise is dead: `engines.node` narrowed to `>=20.19.0` (Vite 8's floor). The library's built output still runs on Node 18 — only the toolchain needs 20.19 — so this is arguably a minor. But a strict reading of semver treats a narrowed `engines` range as a breaking change for a Node 18 installer, which would make it **`2.0.0`**. This must be decided before the §4.2 version bump. Defaulting silently to `1.1.0` is exactly the kind of unreviewed call §1 of the `v1.0.3` plan existed to prevent.

- **Peer-dependency promise:** `react: ^18 || ^19` is either tested or narrowed by the end of this milestone. It does not survive in its current unproven state.
- **Scope discipline.** #25, the WCAG audit and remediation, is a release of its own and does not enter this milestone however tempting it is to finish the accessibility story in one pass. Feature milestones `v1.2.0`–`v1.4.0` stay closed.
- **No client or personal names anywhere** (global rule) — role language only.
- **One-off scripts live in a scratchpad**, never committed.
