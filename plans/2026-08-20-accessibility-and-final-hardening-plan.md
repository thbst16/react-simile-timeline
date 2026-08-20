# React Simile Timeline — v1.2.0 Accessibility & Final Hardening

**Date:** 2026-08-20
**Scope:** Every open issue worth doing, in one release: the WCAG 2.1 AA audit and remediation (#25), the OIDC publish cutover (#42/#63), the ESLint 10 migration via a plugin swap (#54, which also dissolves the #61 root cause), and the `esbuild` advisory via a pnpm major upgrade (#52). Touches `packages/react-simile-timeline` source and CSS, the `demo` e2e suite, `.github/workflows/`, `eslint.config.js`, `package.json`/`pnpm-lock.yaml`, the repository description/README, and the npm registry. Publishes `1.2.0`. **Out of scope, with evidence in §6:** #56 (TypeScript 7 — no upstream support exists) and #50 (jsdom 30 — recommended closed as net-negative). The five feature requests (#1–#5) were closed as not-planned before this plan.

**Goal:** Close every remaining issue that is both achievable and worth the effort, in a single release — leaving the tracker empty but for the one issue that is provably blocked upstream. The library becomes genuinely WCAG 2.1 AA accessible (not merely claimed), publishes without a stored credential, and carries no dev advisories.

---

## 0. Current State (baseline)

Measured 2026-08-20 at `main@bc96ced`, after `1.1.1` shipped.

### Open issues, and this plan's disposition

| #   | Item                             | Value                                             | This release                  |
| --- | -------------------------------- | ------------------------------------------------- | ----------------------------- |
| #25 | WCAG 2.1 AA audit + remediation  | **High** — public component, procurement-relevant | **In** — §1                   |
| #42 | OIDC publishing (prepped in #63) | Real, operational                                 | **In** — §2                   |
| #54 | ESLint 9 → 10                    | Low (dev-only), but cheap and clears #61's root   | **In** — §3                   |
| #52 | `esbuild` advisory               | Low (dev-only, never shipped)                     | **In** — §4, via pnpm upgrade |
| #50 | jsdom 26 → 30                    | **Negative** — a Node-floor narrow for zero gain  | **Out** — §6, recommend close |
| #56 | TypeScript 6 → 7                 | **Blocked** — no upstream support                 | **Out** — §6, proven          |

### Accessibility baseline (the substance of this release)

The repository description no longer _claims_ AA conformance (corrected in #24); this release earns it back honestly. Measured:

|                                   |                                                                                Count |
| --------------------------------- | -----------------------------------------------------------------------------------: |
| `aria-*` / `role=` usages         |                                                                                   16 |
| Components carrying any           |                                 **3 of 9** — `EventMarker`, `EventPopup`, `Timeline` |
| Components with none              | `Band`, `EventTrack`, `HotZones`, `OverviewMarkers`, `TimeScale`, `TimelineProvider` |
| `prefers-reduced-motion` handling |                                                                          **0 files** |
| Automated a11y testing            |                                                                             **None** |

Keyboard pan/zoom exists (`usePan`, Band `+`/`-`), but there is no audited traversal, no screen-reader verification, no contrast check across the three theme paths, and no visible focus management. `@axe-core/playwright` (4.13.0) is available and drops into the existing Playwright suite.

### Toolchain baseline

| Fact                          | Value                                                          |
| ----------------------------- | -------------------------------------------------------------- |
| pnpm                          | pinned `9.0.0`; latest `11.22.0`                               |
| ESLint                        | `9.39.5` (`eslint-plugin-react@7.37.5`, caps at eslint `^9.7`) |
| `@eslint-react/eslint-plugin` | `5.18.6` — flat-config native, supports ESLint 10              |
| Open advisories               | **1** — `esbuild@0.21.5`, vite's optional peer, dev-only       |
| Node floor                    | `>=20.19.0`                                                    |

### The two exclusions, measured

- **#56 TypeScript 7:** `typescript-eslint` at **every** dist-tag (`latest` 8.67.0, `canary`, `rc-v8`) declares `peerDependencies.typescript: >=4.8.4 <6.1.0`. `@microsoft/api-extractor@latest` bundles `typescript@5.9.3`. TS 7 breaks both the lint toolchain and the declaration rollup, and no published or pre-release version admits it.
- **#50 jsdom 30:** `engines.node: ^22.22.2 || ^24.15.0 || >=26.0.0` — drops Node 20 (and most of 22). Adopting it forces a second consumer-visible `engines` narrow to Node 22, and jsdom 26 carries **no** advisory. Net-negative.

**Principle:** every count and version was produced by a command against `main@bc96ced`.

---

## 1. WCAG 2.1 AA — audit and remediation (#25)

**The ask:** make the component genuinely conformant and re-assert the claim honestly. This is the release's centre of gravity; the toolchain sections are small by comparison.

**Approach:** automated gate first (so regressions can't creep back), then manual remediation by concern, then the conformance statement. Each sub-area is a shippable PR; the component's rendered behaviour changes only in additive, accessibility-serving ways (focus rings, ARIA, motion-respecting transitions) — never the timeline layout itself.

### 1.1 Automated axe gate

**Deliverable:** `@axe-core/playwright` integrated into the demo e2e suite, asserting **zero** violations on the core demos (inline data, multi-band, hot zones, dark theme, popup open). Fails CI on any violation. This is the ratchet the rest of §1 builds against.

### 1.2 Keyboard operability

**Deliverable:** every interactive element reachable and operable by keyboard alone — bands (pan/zoom already via `usePan`/`+`/`-`), event markers (Enter/Space already), popups (focus trap + Escape, already), and a documented tab order. Gaps found in the axe/manual pass are closed. A **non-pointer equivalent for pan and zoom** is confirmed (arrow keys pan, `+`/`-` zoom) and documented as the accessible interaction path.

### 1.3 Screen-reader semantics

**Deliverable:** roles and labels that read coherently — the timeline as a labelled region, bands and the event layer with appropriate roles, markers announcing title and date, the popup as a dialog (already `role="dialog"`). Verified against **two** screen readers (VoiceOver + one of NVDA/Orca). The six components with no ARIA today gain what they need; decorative elements are hidden from the tree.

### 1.4 Visible focus, contrast, and motion

**Deliverable:** three things:

- **Visible focus indicators** on every focusable element, in all three themes (classic, dark, custom-variable path).
- **Contrast verified** to AA (4.5:1 text, 3:1 UI) across classic, dark, and the custom-theme CSS-variable defaults; failing default tokens adjusted.
- **`prefers-reduced-motion` honoured** — pan/zoom momentum and theme transitions reduced or removed when the user asks, added to `timeline.css` and the animation paths (0 files handle it today).

### 1.5 Conformance statement and claim

**Deliverable:** once §1.1–§1.4 pass, a published conformance statement (what AA criteria are met, tested with which tools/readers), and the AA claim restored to the repository description, README, and CHANGELOG — this time backed by the audit. #24's corrected wording is the starting point.

---

## 2. Token-free publishing (#42, PR #63)

**The ask:** activate the OIDC cutover prepped in #63, removing the stored `NPM_TOKEN`.

**Deliverable:** trusted publisher registered on npmjs.com; #63 merged; `1.2.0` published via OIDC with automatic provenance; `NPM_TOKEN` deleted and `verify-token` removed after a confirmed OIDC publish.

**Special case — owner-applied and irreversible.** Registration and the tag push are the maintainer's; a tag before registration burns the version. Token deletion happens only after `1.2.0` is confirmed live via OIDC. The mechanics were verified when #63 was written (npm ≥ 11.5.1 upgrade; pnpm pack for the LICENSE, npm publish the tarball for the exchange).

---

## 3. ESLint 10 via `@eslint-react/eslint-plugin` (#54, closes #61's root)

**The ask:** finish ESLint 9 → 10. `eslint-plugin-react@7.37.5` caps at eslint `^9.7`; the maintained successor `@eslint-react/eslint-plugin` is flat-config-native and supports ESLint 10.

**Deliverable:** `eslint` → 10.x, `eslint-plugin-react` replaced by `@eslint-react/eslint-plugin`, `eslint.config.js` migrated. The React rule set is re-reviewed against the new plugin; every intentional difference from the current rules is documented (the plugins are not rule-for-rule identical). `pnpm lint` clean at `--max-warnings=0`.

**Special case — this dissolves #61.** `eslint-plugin-react@7.37.5` is the sole source of `minimatch@3.1.5`, whose incompatibility with the overridden `brace-expansion` was #61. Removing it lets the per-major `brace-expansion` override from #67 be simplified or dropped, and brace globs work natively. Re-verify a brace glob lints clean.

---

## 4. Clear the last advisory via a pnpm major upgrade (#52)

**The ask:** move `esbuild` off the vulnerable 0.21.5. It is vite's **optional peer**, unmovable on pnpm 9 by override, dedupe, clean re-resolve, or a direct dependency (all tried in #52).

**Approach:** pnpm 9 → 11 (or 10) resolves optional peers differently; a major upgrade is the remaining lever. This is a legitimate toolchain modernization, not a workaround.

**Deliverable:** `packageManager` bumped to pnpm 11.x, lockfile regenerated, and `esbuild` re-measured. If it resolves to ≥ 0.25.0, `pnpm audit` reaches **zero** and #52 closes. If the pnpm upgrade still does not move it, that is a recorded finding — `esbuild` is dev-only and never in the published bundle — and #52 stays open as an accepted, harmless dev advisory. **Do not claim it fixed without `pnpm audit` confirming.**

**Special case:** a pnpm major can change lockfile format and CI behaviour. `pnpm/action-setup` reads `packageManager`, so CI follows automatically, but the full 10-check matrix must pass on the new pnpm before this merges.

---

## 5. Version bump and release

**Deliverable:** `packages/react-simile-timeline/package.json` to `1.2.0`, CHANGELOG `[1.2.0]` dated. `1.2.0` as a **minor** — the accessibility remediation adds user-facing behaviour (focus indicators, reduced-motion, richer semantics) that is additive and backward-compatible; the toolchain changes are dev-only. No breaking change: props, exports, and the peer range are unchanged.

---

## 6. Explicitly out of scope — with evidence

**The ask (answered honestly):** the maintainer asked for one release covering everything, and to be told why anything cannot be included. Two items cannot, for concrete reasons:

| Item                 | Why not                                                                                                                                                                                                                                                                                                                               | Recommendation                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **#56 TypeScript 7** | `typescript-eslint` at `latest`, `canary`, and `rc-v8` all cap `peerDependencies.typescript` at `<6.1.0`; `@microsoft/api-extractor@latest` bundles TS 5.9.3. TS 7 breaks the lint toolchain and the declaration rollup, and **no published or pre-release version fixes it.** This is the absence of upstream support, not a choice. | Keep open; revisit when typescript-eslint ships TS 7 support. TS 6.0.3 is current |
| **#50 jsdom 30**     | Requires Node `^22.22.2                                                                                                                                                                                                                                                                                                               |                                                                                   | ^24.15.0 |     | >=26`— a second consumer-visible`engines` narrow (drops Node 20), for **zero** benefit: jsdom 26 carries no advisory and the suite passes on it. | **Close as not-planned** — the cost (dropping a supported runtime) exceeds any gain. Reopen only if the Node floor is raised for another reason |

The five feature requests (#1 filtering, #3 search, #2 clustering, #4 era bands, #5 export) were closed as not-planned: the component's core mission is complete, and each was an enhancement a consumer can achieve outside the library or that overlaps shipped functionality (era bands vs. hot zones). Not required.

---

## Resolution model

| Work item                                                   | Mode                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| §1.1 axe gate                                               | Autonomous — PR                                                                |
| §1.2–§1.4 remediation                                       | Autonomous — PR per concern; rendered changes additive only                    |
| §1.3 screen-reader passes                                   | **Manual verification** — two readers, findings recorded                       |
| §1.5 conformance claim + description                        | Autonomous PR for README/CHANGELOG; **owner-applied** for the repo description |
| §2 trusted-publisher registration, tag push, token deletion | **Owner-applied — irreversible**                                               |
| §3 ESLint 10 plugin swap (#54)                              | Autonomous — PR; rule-set diff documented                                      |
| §4 pnpm major upgrade (#52)                                 | Autonomous — PR; **report `pnpm audit`, do not claim without it**              |
| §5 version bump                                             | Autonomous — PR                                                                |
| §6 close #50; keep #56 open                                 | Recorded — issue actions                                                       |

---

## Execution order

1. **§3 ESLint 10 + §4 pnpm upgrade** — the toolchain moves first, together, since both touch the lockfile and CI; landing them before the large §1 body of work means the accessibility PRs build on the final toolchain. #61's root closes here.
2. **§1.1 axe gate** — before remediation, so each fix is measured against a failing baseline and regressions are caught immediately.
3. **§1.2–§1.4 remediation** — keyboard, semantics, focus/contrast/motion, in that order; each a PR, each re-running axe.
4. **§1.3 manual screen-reader passes** — after the semantic PRs, since they are what the reader consumes.
5. **§1.5 conformance statement + claim** — only once §1.1–§1.4 are green and the manual passes are clean.
6. **§6** — close #50, update #56.
7. **Pre-flight** — `pnpm audit` reported (zero if §4 succeeded), all 10 checks green, axe green, tarball declarations diffed against `1.1.1`, `attw` clean.
8. **§5 version bump**, then **§2 OIDC activation + tag push** (owner), then token deletion.
9. **Verification** (below) against published `1.2.0`.

**Ordering trap:** the conformance _claim_ (§1.5) must not be restored until the audit actually passes — re-asserting AA before the work is done repeats exactly the defect #24 corrected.

---

## Verification (hard requirement)

Exercise the real thing.

- **axe-core reports zero violations** in CI across the core demos, and fails on an injected violation (prove the gate bites).
- **Keyboard-only walkthrough** of the demo — every control reachable and operable, focus visible throughout, pan/zoom driveable without a pointer.
- **Two screen readers** announce the timeline, bands, markers (title + date), and popup coherently; findings recorded and remediated.
- **Contrast checked** to AA on classic, dark, and custom-variable themes; **`prefers-reduced-motion`** verified to quiet pan/zoom and theme transitions.
- `npm view react-simile-timeline@1.2.0 dist.attestations` non-empty **with no `NPM_TOKEN` in the workflow**.
- `pnpm audit` result reported; **zero** if §4 moved esbuild, otherwise the finding recorded.
- ESLint runs a brace `{a,b}` glob without crashing (#61); `pnpm lint` clean at `--max-warnings=0` on ESLint 10.
- Published tarball 11 files; declarations diffed against `1.1.1`; `attw` clean; CJS `node16` consumer type-checks on React 18 and 19.
- `pnpm test` (120+) green under `TZ=UTC` and non-UTC; all 10 required checks green.

---

## Constraints (hard rules in force)

- **PRs only — no direct commits** (global rule), enforced by the ruleset (now 10 required checks).
- **The timeline's rendered layout does not change.** Accessibility remediation is additive — focus indicators, ARIA, motion handling — never a change to event positioning or the public API. Declarations diffed against `1.1.1`.
- **Semver: `1.2.0` as a minor.** Additive accessibility behaviour; dev-only toolchain changes. Props, exports, and the `react: ^18 || ^19` peer range unchanged. If anything forces a breaking change, stop and re-decide.
- **Publishing is owner-applied and irreversible.** Registration, tag push, and token deletion are the maintainer's; token deletion only after a confirmed OIDC publish.
- **Do not delete or move any tag** (#8) — 11 tags, the only pre-rebuild reference.
- **Do not claim an advisory or a conformance level without proof** — `pnpm audit` for the advisory, the axe gate + manual passes for AA. The unverified-claim defect (#24) and the silently-failed override (#52) are the precedents.
- **No client or personal names anywhere** (global rule) — role language only.
- **One-off scripts live in a scratchpad**; the maintainer's untracked working-tree files are not touched.
