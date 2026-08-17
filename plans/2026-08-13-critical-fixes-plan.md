# React Simile Timeline — v1.0.3 Critical Fixes Release

**Date:** 2026-08-13
**Scope:** Milestone `v1.0.3 - Critical fixes` (#13, #14, #15, #16, #17) plus the mechanics of publishing `1.0.3` to npm. Touches `packages/react-simile-timeline` (already changed — see §1), `README.md`, `CHANGELOG.md`, `.github/workflows/release.yml`, and the npm registry. Explicitly **out of scope:** every issue in `v1.1.0` (#18–#24), all feature milestones, the dormant Dependabot limits, and the 30 open advisories — those are `v1.1.0` work and must not be pulled forward to make this release look cleaner.

**Goal:** Publish `1.0.3` to npm: the first release since December 2025 that fixes anything real. On completion, a consumer installing `react-simile-timeline` gets correct calendar days outside UTC, working TypeScript types from CommonJS, documentation whose links resolve and whose claims are true, and a provenance-attested artifact.

---

## 0. Current State (baseline)

Measured 2026-08-13 at `main@58acbf3`.

### Milestone position

| Issue                  | State                | Note                                      |
| ---------------------- | -------------------- | ----------------------------------------- |
| #13 timezone P0        | **Merged** `38ddffd` | Shipped before this plan existed — see §1 |
| #14 CJS types P0       | **Merged** `d7484a7` | Shipped before this plan existed — see §1 |
| #15 dead demo links    | Open                 | §2                                        |
| #16 doc corrections    | Open                 | §2                                        |
| #17 published artifact | Open                 | §3                                        |

**Both P0s are already on `main` and neither passed through a reviewed plan.** That is the defect this plan opens by correcting, not by glossing over.

### Registry and repository

| Fact                   | Value                                                  |
| ---------------------- | ------------------------------------------------------ |
| `package.json` version | `1.0.2`                                                |
| npm `latest`           | `1.0.2`                                                |
| npm versions present   | `0.1.0`, `1.0.1`, `1.0.2`                              |
| `1.0.0`                | Permanently uninstallable (published then unpublished) |
| Downloads              | 228 in the trailing year; 12 in the last 30 days       |
| Runtime dependencies   | None; React is a peer                                  |

### Tarball as it stands on this branch

|                |                                     |
| -------------- | ----------------------------------- |
| Packed         | 105.5 kB                            |
| Unpacked       | 402.7 kB                            |
| Files          | 10                                  |
| **Sourcemaps** | **271.3 kB — 67% of unpacked size** |

`dist/index.d.cts` (19.9 kB) is present, which it was not in `1.0.2`.

### Release path

`.github/workflows/release.yml` fires on `v*` tags only. It already grants `id-token: write` but publishes without `--provenance`, so no attestation is produced. Last successful run: 2025-12-19.

**Principle:** every claim in this plan was measured, not recalled. Anything not yet verified is marked as a pre-flight check in §4 rather than asserted.

---

## 1. Retroactive record: what already shipped

**The ask:** #13 and #14 were executed and merged without a plan. Before anything else moves, record what they changed, surface the scope decisions that were never reviewed, and decide whether each stands.

**Approach:** enumerate the unreviewed calls explicitly. Each is either accepted or reverted here — not left implicit because the code is already on `main`.

### 1.1 #13 — date-only strings parse as local midnight

**Deliverable:** the record below, and a decision on each unreviewed item.

In scope as written: `parseDate` builds date-only strings as local midnight; native ISO bounds preserved; regression tests; CHANGELOG entry.

Decisions taken **without review**:

| Decision                                                                                   | Rationale given                                                                             | Stands? |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------- |
| Fixed the `centerDate` prop at three call sites                                            | Same root cause on the public API; fixing `parseDate` alone left the documented prop broken | Decide  |
| Unparseable `centerDate` now falls back to the median event date instead of `Invalid Date` | Strictly better failure mode, but it is a behavior change nobody asked for                  | Decide  |
| Rewrote two pre-existing `getMedianDate` test expectations                                 | They compared against `new Date(...)` and only held under UTC                               | Decide  |
| Made the `America/Chicago` CI leg blocking                                                 | It was advisory only because it was expected to fail                                        | Decide  |

### 1.2 #14 — emit `index.d.cts`

**Deliverable:** the record below, and a decision on each unreviewed item.

In scope as written: emit `index.d.cts`; `attw` clean across resolution modes; `attw` as a CI gate; decide the `style.css` question.

Decisions taken **without review**:

| Decision                                                     | Rationale given                                                             | Stands? |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- | ------- |
| Added a root-level `style.css` re-exporting `dist/style.css` | Pre-`exports` resolvers (webpack 4) could not resolve the documented import | Decide  |
| Excluded the CSS entrypoint from the `attw` gate             | `attw` resolves entrypoints as JS/TS modules; a stylesheet never is one     | Decide  |
| Added `@arethetypeswrong/cli` as a dev dependency            | Needed to run the gate in CI                                                | Decide  |

**Special case:** if any decision above is rejected, it is reverted in its own PR **before** the release, not folded into another issue's work. A release should not carry changes nobody agreed to.

---

## 2. Documentation accuracy (#15, #16)

**The ask:** the README points users at a dead demo, and the CHANGELOG misstates its own release dates by a year.

**Approach:** two PRs, because the dead links are user-facing and shippable immediately while the corrections are bookkeeping.

### 2.1 Dead demo links (#15)

**Deliverable:** both README links pointing at the deployment that actually exists. `README.md:13` and `README.md:272` reference `react-simile-timeline.vercel.app` (404); the live site is `react-simile-timeline-demo.vercel.app`, already correct in the repository `homepageUrl`. All other outbound links verified in the same pass.

### 2.2 Corrections (#16)

**Deliverable:** four fixes.

- CHANGELOG entries for `1.0.0`/`1.0.1`/`1.0.2` dated **2025**-12-19, not 2024
- TypeScript badge sourced dynamically or updated from the hardcoded `5.0`
- A note on the `v1.0.0` GitHub release stating it is uninstallable and directing users to `1.0.1`+
- The "efficient virtualization for large event sets" claim in the README either verified against the implementation or removed

**Special case:** the `v1.0.0` **tag** is not touched. As established in #8, the tags are the only surviving reference to the pre-rebuild repository history. The note goes on the release, not the tag.

---

## 3. Published artifact (#17)

**The ask:** the release publishes without provenance, and two-thirds of the tarball is sourcemaps while the README advertises a small footprint.

### 3.1 Provenance

**Deliverable:** `--provenance` on the publish step, or `publishConfig.provenance: true`. `id-token: write` is already granted, so this is a one-flag change that produces a verifiable link between the tarball and the commit that built it. Confirmed absent today: `npm view react-simile-timeline@1.0.2 dist.attestations` returns empty.

### 3.2 Sourcemaps — decision required

**Deliverable:** a decision, applied.

271.3 kB of the 402.7 kB unpacked size is `index.js.map` + `index.cjs.map`. The README advertises "~12KB gzipped", true of the JS bundle and misleading about install footprint.

| Option                               | Effect                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| **A. Exclude maps**                  | Unpacked drops to ~131 kB; consumers lose stepping into library source when debugging |
| **B. Keep maps, correct the README** | Debuggability retained; the size claim becomes accurate                               |

Neither is obviously right for a library with 12 downloads a month. This is a **review artifact** — the maintainer decides.

### 3.3 Tag/version guard

**Deliverable:** the release workflow verifies the pushed tag matches `package.json` version before publishing. `1.0.0` was published and unpublished, which permanently burned that version number; a mismatched tag is one way to repeat that.

---

## 4. Release execution

**The ask:** turn a green `main` into a published `1.0.3`.

**Approach:** the version bump is a PR like anything else — `main` is now gated and will reject a direct push. The tag is the trigger, and pushing it is the irreversible step.

### 4.1 Pre-flight checks

**Deliverable:** each confirmed before tagging, none assumed.

- `NPM_TOKEN` repository secret still valid — the workflow last ran 2025-12-19 and npm tokens expire
- `pnpm publish` supports `--provenance` on the pinned pnpm version, or `publishConfig` is used instead
- All 8 required checks green on `main`
- `attw` clean and `dist/index.d.cts` present in a fresh `npm pack`

### 4.2 Version bump

**Deliverable:** one PR setting `packages/react-simile-timeline/package.json` to `1.0.3` and changing the CHANGELOG heading from `[1.0.3] - Unreleased` to a dated entry. Merged through the ruleset like any other change.

### 4.3 Tag and publish

**Deliverable:** `v1.0.3` tag on the merge commit, pushed, triggering `release.yml`.

**Special case:** pushing the tag publishes to npm. It is outward-facing and effectively irreversible — npm's unpublish window is narrow and, once used, permanently burns the version number. This is exactly how `1.0.0` was lost. **The maintainer pushes the tag.**

---

## Resolution model

| Work item                                    | Mode                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| §1 Accept or revert the unreviewed decisions | **Review artifact** — the maintainer decides, per item |
| §2.1 Dead demo links (#15)                   | Autonomous — PR                                        |
| §2.2 Corrections (#16)                       | Autonomous — PR                                        |
| §2.2 Note on the `v1.0.0` GitHub release     | **Owner-applied** — release body, no PR form           |
| §3.1 Provenance flag (#17)                   | Autonomous — PR                                        |
| §3.2 Sourcemaps                              | **Review artifact** — then applied                     |
| §3.3 Tag/version guard                       | Autonomous — PR                                        |
| §4.1 Pre-flight checks                       | Autonomous — report results                            |
| §4.2 Version bump                            | Autonomous — PR                                        |
| §4.3 **Tag push / npm publish**              | **Owner-applied — irreversible**                       |

**Deliverable (review artifact):** a single comment listing the §1 decisions and the §3.2 sourcemap options, each with a recommendation, for one round of approval rather than seven.

---

## Execution order

1. **§1 Retroactive decisions** — first, because everything downstream ships on top of code that has not been agreed to. A rejected decision is reverted before the release, not after.
2. **§2.1 Dead links (#15)** — highest user-facing value per unit of effort, and independent of everything else. Also the first change to traverse the new ruleset, which usefully confirms the gate works on a trivial PR.
3. **§2.2 Corrections (#16)** — bookkeeping; unblocks an accurate CHANGELOG for the release entry.
4. **§3 Artifact (#17)** — provenance and the tag guard must land **before** the tag is pushed, or the release publishes without them and the flag has to wait for `1.0.4`.
5. **§4.1 Pre-flight** — after all code is merged, before the version bump. A dead `NPM_TOKEN` discovered here costs nothing; discovered after tagging it costs a burned version number.
6. **§4.2 Version bump** — the last PR.
7. **§4.3 Tag push** — maintainer only.
8. **Verification** (below), against the published package.

---

## Verification (hard requirement)

Exercise the published artifact, not the working tree. The `1.0.2` defects were invisible precisely because nobody checked the thing consumers actually install.

- **Install the published `1.0.3` from npm into a scratch project and type-check it as a CommonJS consumer** under `module`/`moduleResolution: node16`. This is the check that failed against `1.0.2` with `TS7016`; passing it is the proof #14 reached consumers, not just `main`.
- **Confirm the date fix in the published package**, not the repo: `parseDate('2023-01-15')` under `TZ=America/Chicago` returns day 15.
- Confirm: (a) `npm view react-simile-timeline@1.0.3 dist.attestations` is non-empty; (b) the tarball file list matches the §3.2 decision; (c) `attw --pack` clean on the published version; (d) `npm view` shows `latest: 1.0.3`.
- Both README demo links return 200.
- All 8 required checks green on `main` after every merge; `pnpm lint`, `typecheck`, and the suite green under a non-UTC `TZ`.
- The `v1.0.0` GitHub release carries its note, and **all 8 tags still exist**.

---

## Constraints (hard rules in force)

- **PRs only — no direct commits** (global rule). Now mechanically enforced: the ruleset rejects direct pushes to `main`.
- **No plan, no milestone work** — this plan is reviewed and approved before §1 begins. The absence of one is why #13 and #14 need §1 at all.
- **Publishing is owner-applied.** The tag push, and therefore the npm publish, is not performed on the maintainer's behalf. It is outward-facing and effectively irreversible.
- **Do not delete or move any tag.** They are the only surviving reference to the pre-rebuild history (#8).
- **No client or personal names anywhere** (global rule) — role language only.
- **Scope discipline.** The 30 open Dependabot advisories and every dependency major are `v1.1.0` work. They do not enter this release, however tempting it is to ship a cleaner audit.
- **Semver:** `1.0.3` as a patch was decided when the backlog was filed, on the basis that a bug fix is a patch even when it changes rendered output. The CHANGELOG carries the behavior-change warning instead.
- **One-off scripts live in a scratchpad**, never committed.
