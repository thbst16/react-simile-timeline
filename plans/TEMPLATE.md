<!--
  PLAN TEMPLATE — copy this file to start a new plan.
  Save as: plans/YYYY-MM-DD-<kebab-slug>-plan.md
    YYYY-MM-DD  = the date the plan is written
    <kebab-slug>= 2-4 word hyphenated topic (e.g. repo-hardening, toolchain-modernization)
  Delete every <!-- guidance --> comment as you fill each section in.
  Keep the section order and the `---` dividers exactly as below.
-->

# React Simile Timeline — <Descriptive Title>

**Date:** <YYYY-MM-DD>
**Scope:** <The packages, files, workflows, and settings this plan touches. Name the milestone and issue numbers it covers. State explicitly what is OUT of scope so the boundary is unambiguous — adjacent milestones are the usual thing to exclude.>
**Goal:** <The target end-state in 1-3 sentences — the observable outcome, not the task list. Someone should be able to tell from this line alone whether the plan succeeded.>

---

## 0. Current State (baseline)

<!-- The measured starting point. Facts and counts (use a table when quantitative), the ask
     driving this plan, and any confirmed defects with the command output or file:line that
     proves them. Every later section anchors back to this baseline.

     For a library, useful baseline dimensions include: published version vs. repo version,
     npm download trend, test count and pass/fail state, coverage, bundle size, dependency
     lag, advisory counts, and the state of CI. -->

---

## 1. <First work area>

<!-- One numbered top-level section per coherent work area. Prefer one section per issue, or
     one per tightly-coupled group of issues. Use these bold inline labels where they apply: -->
**The ask:** <what is being requested / the problem being solved>
**Approach:** <how it will be done, at a decision-useful level of detail>

### 1.1 <Sub-area>

**Deliverable:** <the concrete artifact or end-state that proves this sub-area is done>

<!-- Add ### 1.2, 1.3 … as needed. Use **Special case:** for carve-outs and ordering traps,
     **Principle:** for a design rule the rest of the plan leans on. -->

---

## 2. <Nth work area>

<!-- Repeat the section 1 shape for each work area. -->

---

## Resolution model

<!-- OPTIONAL but recommended when the work mixes changes that ship as a PR with changes that
     cannot — repository settings, npm registry actions, and third-party dashboards have no PR
     form. A two-column table: work item -> mode.

     Modes: "Autonomous" (apply as a PR, then verify), "Owner-applied" (repo settings, registry,
     or anything requiring credentials the agent should not exercise), "Review artifact"
     (surface for a decision first), "Recommend + apply" (act, note the decision).

     If a review artifact is produced, define it here. -->

| Work item | Mode |
|---|---|
| <item> | Autonomous — PR, then verify |
| <item> | Owner-applied — repository settings |
| <item> | Review artifact — the maintainer decides |

---

## Execution order

<!-- Ordered, dependency-aware. Each item references the section it executes (§N) and says why
     it sits in that position — what it unblocks or de-risks. Call out ordering traps explicitly;
     they are the main reason this section exists. End with the verification pass. -->

1. **<Section §N>** — <why first / what it unblocks>.
2. …
N. **Verification** (below) across every affected area.

---

## Verification (hard requirement)

<!-- How the work is proven done. Exercise the real thing rather than reading code — a config
     that is present in a file can still be inert in practice.

     Pick the proof that matches the change:
       - Library behavior  -> `pnpm test`, and the failing case reproduced before/after
       - Cross-environment -> run under multiple TZ / Node versions, not just the default
       - Rendering / UI    -> drive the demo at `pnpm dev`, check the browser console
       - Packaging         -> `npm pack`, inspect tarball contents, `attw` for type resolution
       - Repo config       -> `gh api` / `gh repo view`, and attempt the action being blocked
     List concrete pass/fail checks. Note any check expected to fail and why. -->

- Verify by exercising it, not by reading code: <the specific commands, flows, or endpoints>.
- Confirm: (a) <check>; (b) <check>; (c) <check>.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` clean for any code change; browser console
  clean for any demo change.

---

## Constraints (hard rules in force)

<!-- Always the LAST section. List only the rules that bind THIS plan plus the always-on
     globals. Do not restate the whole rulebook. -->

- **PRs only — no direct commits** (global rule). Stage every file change as a reviewed PR.
- **No client or personal names anywhere** (global rule) — use role language ("the maintainer",
  "the reporter", "a contributor") in code, comments, commit messages, and policy text.
- **Owner-applied work stays owner-applied** — repository settings, npm publishing, and
  registry actions are not exercised on the maintainer's behalf.
- **One-off scripts live in a scratchpad**, never committed to the repository.
- **Scope discipline** — name the adjacent milestone whose work is deliberately excluded.
- <Any plan-specific rule: a semver constraint, a peer-range promise, a public API surface that
  must not change, a published artifact that must stay byte-comparable.>
