# React Simile Timeline — Repo Hardening

**Date:** 2026-08-12
**Scope:** Repository configuration and CI/CD only — `.github/workflows/*`, `.github/dependabot.yml`, `SECURITY.md`, GitHub repository settings, rulesets, and branch/issue hygiene. Covers milestone **Repo hardening** (issues #6–#12). Explicitly **out of scope:** any change under `packages/` or `demo/`, any dependency version bump, any published release, and every issue in the `v1.0.3` and `v1.1.0` milestones. No library code is touched and nothing is published to npm by this plan.

**Goal:** `main` becomes a protected branch that can only be changed through a PR with green CI, and the repository reports its own vulnerabilities instead of hiding them. On completion, every subsequent milestone flows through an enforced review path that did not exist before.

---

## 0. Current State (baseline)

Measured 2026-08-12 against `thbst16/react-simile-timeline` at commit `0399e49`.

| Control | Measured state | Evidence |
|---|---|---|
| Branch protection on `main` | **None** | `GET /branches/main/protection` → 404; `GET /rulesets` → `[]` |
| Direct pushes to `main` | 12 of the last 12 commits | `git log` — includes all three releases |
| Dependabot alerts | **Disabled** | `GET /dependabot/alerts` → 403 "Dependabot alerts are disabled" |
| Dependabot version updates | No `dependabot.yml` | File absent |
| Code scanning | **None** | No CodeQL workflow present |
| Security policy | **None** | `isSecurityPolicyEnabled: false` |
| `deleteBranchOnMerge` | `false` | `gh repo view` |
| Known advisories | 1 critical, 30 high, 15 moderate, 1 low | `pnpm audit` — all in the dev/build tree |
| Issue triage | 5 issues, 0 labels, 0 milestones | Now resolved by the backlog filing |

### Confirmed defects in CI

Four independent problems in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

| Defect | Detail |
|---|---|
| pnpm version mismatch | Workflow pins pnpm **8**; root `package.json` declares `"packageManager": "pnpm@9.0.0"`. CI and local dev resolve dependency trees differently. |
| Outdated action | `pnpm/action-setup@v2`; v4 is current. |
| No Node matrix | Runs on Node 20 only. `engines` claims `>=18`; Node 18 and 24 support is asserted and never exercised. |
| No concurrency group | Superseded runs continue to completion on every rapid push. |

### The structural finding

CI has been green while the test suite is red. `dateUtils.test.ts` fails on any machine at a
negative UTC offset and passes on GitHub's UTC runners. This plan does not fix that defect
(it is issue #13, milestone `v1.0.3`), but it establishes the CI changes that make the fix
verifiable — specifically a non-UTC `TZ` leg.

**Principle:** every control below is measured before and after. A control that cannot be
demonstrated with a command is not considered delivered.

---

## 1. Vulnerability visibility (#6)

**The ask:** The repository carries 31 high-or-critical advisories and reported none of them
for roughly eight months, because alerting is switched off.

**Approach:** Split into two phases with different timing. Alerting is pure upside and lands
immediately. Automated version updates are deliberately deferred — see the sequencing carve-out.

### 1.1 Alerting (immediate)

**Deliverable:** Dependabot **alerts** and **security updates** enabled in
Settings → Code security. `GET /dependabot/alerts` returns a JSON array rather than a 403,
and the Security tab enumerates the known advisories.

### 1.2 Version updates (deferred)

**Special case:** `.github/dependabot.yml` is written as part of this milestone but **must not
be activated until `v1.1.0` has landed.**

Every major dependency is currently 1–6 majors behind. Switching on version updates today
would open roughly two dozen major-bump PRs against an unprotected branch, and those PRs
would duplicate — and conflict with — the deliberate, sequenced upgrades already scoped as
issues #18–#21. The automation would generate noise that hides the actual work.

**Deliverable:** `.github/dependabot.yml` committed with `open-pull-requests-limit: 0` (or the
file held in the PR and merged post-`v1.1.0`), configured for:
- `npm` at the workspace root, weekly, minor and patch **grouped** into a single PR
- `github-actions`, weekly
- A recorded decision, in the issue, on when the limit is raised

---

## 2. Branch protection (#7)

**The ask:** Nothing prevents a direct push to `main`. This violates the standing PR-only rule
and is how two red-CI commits reached the default branch.

**Approach:** A repository **ruleset** rather than legacy branch protection — rulesets are the
current mechanism, support bypass actors cleanly, and are visible via the API.

**Principle:** This is the keystone of the milestone. Everything in `v1.0.3` and `v1.1.0`
depends on the enforced path this creates. It is also the reason §6 must land first — see the
ordering carve-out below.

### 2.1 Ruleset definition

**Deliverable:** An **Active** ruleset targeting `main` that:
- Requires a pull request before merging
- Requires status checks to pass, naming **every** check the settled workflows emit
- Requires branches to be up to date before merging
- Blocks force pushes
- Blocks branch deletion

### 2.2 The required-check ordering trap

**Special case:** Required status checks are pinned **by name**. Pinning `build-and-test`
today and then adding a Node matrix in §6 renames the emitted checks to
`build-and-test (18)`, `build-and-test (20)`, and so on. The originally-required check would
then never report, and **every PR would block forever on a check that no longer exists.**

The mitigation is ordering, not cleverness: §6 and §4 land first so the full set of check
names is stable and observable, and only then does this section pin them.

### 2.3 Review requirement

**Deliverable:** A recorded decision on required approvals. Sole maintainer implies 0 approvals
with the PR itself as the gate; raise to 1 if a second maintainer joins. Either choice is
acceptable — leaving it undecided is not.

---

## 3. Branch hygiene (#8)

**The ask:** `origin/dev` is ten commits behind `main` with **zero unique commits**
(`git log main..origin/dev` is empty). Commit `e4d7729` narrowed CI to `main` only, so anything
pushed to `dev` runs no tests at all.

**Approach:** Delete rather than resurrect. A branch that is strictly behind and silently
untested is worse than no branch — a contributor branching from it gets stale code and no
signal.

**Deliverable:** `origin/dev` deleted; local `dev` and `release/v1.0.0` deleted; the branching
model stated in `CONTRIBUTING.md` so the next long-lived branch is a deliberate choice. If a
`dev` branch is wanted later, it is recreated from `main` **and** added to the CI trigger in
the same change.

---

## 4. Static analysis (#9)

**The ask:** No code scanning on a public package that other projects install.

**Approach:** GitHub-native CodeQL, so results land on the Security tab consumers actually check.

**Deliverable:** `.github/workflows/codeql.yml` for `javascript-typescript`, triggered on push
to `main`, PRs to `main`, and a weekly schedule. First run completes, results appear on the
Security tab, and every finding is either fixed or dismissed **with a stated reason** — an
untriaged backlog of findings is the same failure mode as disabled alerts.

**Sequencing note:** lands before §2 so its check name is available to pin.

---

## 5. Security policy (#10)

**The ask:** `isSecurityPolicyEnabled: false`. A reporter's only available channel today is a
public issue, which discloses the vulnerability in the act of reporting it.

**Deliverable:**
- `SECURITY.md` at the repository root: supported-versions table (currently `1.0.x`), private
  reporting instructions, and a stated response window
- GitHub **private vulnerability reporting** enabled in settings
- Policy visible on the Security tab

**Special case:** The supported-versions table must state that **`1.0.0` is unavailable on
npm** and that the supported floor is `1.0.1`. Version `1.0.0` was published and unpublished;
npm permanently blocks republishing it, so a security advisory naming `1.0.0` as a fixed or
affected version would reference an uninstallable target.

---

## 6. CI workflow correctness (#11)

**The ask:** Four defects (§0) that make CI results untrustworthy and unrepresentative of the
support matrix the package advertises.

**Approach:** One PR covering all four, because they touch the same file and the resulting
check names must settle in a single step — a second reshuffle after §2 pins them re-triggers
the trap in §2.2.

### 6.1 Toolchain alignment

**Deliverable:** `pnpm/action-setup` at v4, with the explicit `version:` input dropped so the
pnpm version derives from `packageManager` in the root `package.json`. CI and local development
resolve identical trees.

### 6.2 Support matrix

**Deliverable:** A Node matrix over 18 / 20 / 22 / 24, **or** a narrowed `engines` field with
the real floor documented. The current state — claiming `>=18` while testing only 20 — is not
an option that survives this plan.

### 6.3 Concurrency

**Deliverable:** A `concurrency` group keyed on workflow and ref with
`cancel-in-progress: true`, applied to `ci.yml`.

### 6.4 Timezone leg

**Deliverable:** At least one matrix leg running with a non-UTC `TZ`.

**Principle:** This is the single highest-value line in the milestone. UTC-only CI is precisely
what allowed a real correctness bug (#13) to sit green for eight months. The leg is added here,
in the CI milestone, so that the fix in `v1.0.3` has something to prove itself against.

---

## 7. Repository settings and triage (#12)

**The ask:** Assorted settings gaps found during the audit.

**Deliverable:**
- `deleteBranchOnMerge` set to `true`
- Issues #1–#5 labeled and milestoned *(completed during backlog filing — verify only)*
- A custom Open Graph image, ideally a timeline screenshot, since the package is a visual
  component and is shared as a link
- A recorded decision on enabling Discussions

---

## Resolution model

This milestone splits unusually cleanly, and the split matters: **roughly half of it cannot be
delivered by a pull request at all.** Repository settings are applied by the repo owner through
the GitHub UI, per the decision recorded when the backlog was filed.

| Work item | Mode |
|---|---|
| §1.1 Enable Dependabot alerts + security updates | **Owner-applied** — settings toggle, no PR exists for this |
| §1.2 `dependabot.yml` | Autonomous — PR, held inactive until post-`v1.1.0` |
| §2 Branch protection ruleset | **Owner-applied** — settings; check names supplied by this plan after §6 lands |
| §3 Remote branch deletion | **Owner-applied**; local branch deletion autonomous |
| §4 `codeql.yml` | Autonomous — PR |
| §5 `SECURITY.md` | Autonomous — PR |
| §5 Private vulnerability reporting | **Owner-applied** — settings toggle |
| §6 CI workflow changes | Autonomous — PR |
| §7 `deleteBranchOnMerge`, OG image, Discussions | **Owner-applied** — settings |
| §2.3 Approval count; §7 Discussions | **Review artifact** — decisions, recorded in the issues |

**Deliverable (review artifact):** after §6 lands, a list of the exact status-check names the
workflows now emit, posted to #7 so the ruleset pins the right strings on the first attempt.

---

## Execution order

Dependency-aware. The ordering exists mainly to avoid the required-check deadlock in §2.2 and
the PR flood in §1.2.

1. **§1.1 Dependabot alerts** (#6) — first because it is instant, owner-applied, carries zero
   risk, and immediately surfaces the 31 advisories that the `v1.1.0` milestone will clear.
   Unblocks nothing; costs nothing to do now.
2. **§6 CI workflow correctness** (#11) — before any protection is applied, so the emitted
   check names settle while `main` is still writable. Also lands the non-UTC `TZ` leg that
   `v1.0.3` depends on.
3. **§4 CodeQL** (#9) — immediately after §6 so its check name joins the same settled set.
4. **Review artifact** — post the observed check names to #7.
5. **§2 Branch protection** (#7) — pins the names from step 4. **This is the gate.** Everything
   from here on, in this plan and every later milestone, flows through a PR.
6. **§5 Security policy** (#10) — first change to exercise the newly enforced PR path, which is
   deliberate: a small, low-risk PR is the right way to confirm the gate works.
7. **§3 Branch hygiene** (#8) — after protection, so the deletion-blocking rule is already in
   force for `main` and only the stale branches go.
8. **§7 Repository settings** (#12) — housekeeping, no dependencies.
9. **§1.2 `dependabot.yml`** — written now, **activated only after `v1.1.0`**. Recorded as a
   follow-up on #6 so it is not silently forgotten.
10. **Verification** (below) across every control.

---

## Verification (hard requirement)

Exercise the real repository and real workflow runs. Reading YAML does not prove a control is
in force — several of these settings can be present in a file and inert in practice.

- **Protection is real, not just configured.** Attempt a direct push of a trivial commit to
  `main` and confirm it is **rejected**. This is the only check that proves the milestone
  succeeded. A ruleset that exists but does not block is the exact failure this plan targets.
- **Required checks resolve.** Open a throwaway PR and confirm every required check appears and
  reports. A check stuck permanently pending means §2.2 was mis-sequenced — fix the ruleset
  before merging anything.
- **Confirm via API, not the UI:**
  - `gh api repos/thbst16/react-simile-timeline/rulesets --jq '.[].name'` → non-empty
  - `gh api repos/thbst16/react-simile-timeline/dependabot/alerts --jq 'length'` → a count, not a 403
  - `gh repo view --json deleteBranchOnMerge,isSecurityPolicyEnabled` → `true`, `true`
  - `gh run list --workflow=codeql.yml --limit 1` → a completed run
  - `git fetch --prune && git branch -a` → no `dev`, no `release/v1.0.0`
- **CI is green on every matrix leg**, including the non-UTC `TZ` leg. Expect the `TZ` leg to
  **fail** on `dateUtils.test.ts` until #13 lands — this is the correct and desired outcome, and
  it must be recorded on #13 rather than worked around by removing the leg.
- **No library regression.** `pnpm lint`, `pnpm build:lib`, `pnpm typecheck` clean. No file under
  `packages/` or `demo/` appears in any diff from this milestone.

---

## Constraints (hard rules in force)

- **PRs only — no direct commits** (global rule). Every file change in this plan is staged as a
  reviewed PR. The settings changes have no PR form and are owner-applied; that carve-out is
  explicit in the resolution model, not an exception being taken quietly.
- **No client or personal names anywhere** (global rule) — role language only ("the repo owner",
  "the reporter", "a contributor") in workflows, policy text, and commit messages.
- **Owner-applied means owner-applied.** Repository settings, rulesets, Dependabot toggles, and
  remote branch deletion are not to be changed via the API on the owner's behalf. This was
  decided when the backlog was filed and binds this plan.
- **One-off scripts live in a scratchpad**, never committed to the repository.
- **Scope discipline.** No dependency bumps and no library code in this milestone, however
  tempting the adjacency — the 31 advisories are `v1.1.0` work and the two P0 defects are
  `v1.0.3` work. This milestone delivers the path, not the payload.
- **Solve it or name the blocker.** If a control cannot be applied, say which one and why rather
  than substituting a weaker version of it.
