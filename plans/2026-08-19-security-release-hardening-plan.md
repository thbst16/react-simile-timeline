# React Simile Timeline — v1.1.1 Security & Release Hardening

**Date:** 2026-08-19
**Scope:** The toolchain and release follow-ups left open after `v1.1.0` shipped: the three open Dependabot advisories (#52), the OIDC publish cutover (#42, prepped in PR #63), the latent `brace-expansion`/`minimatch` incompatibility (#61), and the deferred CI required-checks decision. Touches `packages/react-simile-timeline` build config and dev dependencies, `.github/workflows/release.yml` and `ci.yml`, the `main` branch ruleset, and the npm registry's trusted-publisher configuration. Publishes `1.1.1`. **Explicitly out of scope:** #50 (jsdom 30), #56 (TypeScript 7), #25 (WCAG audit), and every feature milestone (`v1.2.0`–`v1.4.0`, #1–#5) — see §5 for why each is excluded and what unblocks it.

**Goal:** Zero open security findings, a release pipeline with no stored credential, and the last of the override-fragility removed — closing the maintenance debt carried out of `v1.1.0`. **Not everything remaining fits here, and this plan says so:** the actionable items are completed; three upgrades gated on external maintainers are formally deferred with explicit unblock triggers rather than pretended into a schedule.

---

## 0. Current State (baseline)

Measured 2026-08-19 at `main@fda65f4`, immediately after the `1.1.0` release.

### Security findings

3 open, all Dependabot, all **dev-only** — the published package has zero runtime dependencies, so no consumer is exposed. Zero CodeQL. Down from 42 at the start of the `v1.1.0` work.

| Alert | Severity | Package | Patched at | Reaches the tree via |
| --- | --- | --- | --- | --- |
| #14 | **high** | `rollup` | 4.59.0 | `vite-plugin-dts` (peer) — **only** path |
| #8 | medium | `vue-template-compiler` | (no fix; 2.x EOL) | `vite-plugin-dts` → `unplugin-dts` → `@vue/language-core` — **only** path |
| #9 | medium | `esbuild` | 0.25.0 | `vite` (optional peer) — **not** the dts plugin |

**Verified not fixable by `pnpm.overrides`.** A clean lockfile re-resolve with `rollup: ^4.59.0` and `esbuild: ^0.25.0` overrides left both at their vulnerable versions (4.53.5, 0.21.5). These are declared as **peer** dependencies of the build tooling, and pnpm overrides do not force peer resolutions — which is why the #20 overrides could fix regular transitives (`flatted`, `minimatch`) but cannot touch these.

**Consequence for the fix:** `rollup` and `vue-template-compiler` come *only* through `vite-plugin-dts`; removing that plugin clears both. `esbuild` comes through `vite` itself and needs separate handling.

### Release pipeline

`release.yml` publishes with provenance via a stored `NPM_TOKEN`. That token expired silently once between `1.0.2` and `1.0.3` (#41) and was caught only by a preflight added for the purpose. PR **#63** (draft) preps the OIDC cutover that removes the credential entirely; it is not yet activated because the trusted publisher must first be registered on npmjs.com (owner-applied).

### Latent lockfile hazard (#61)

The `brace-expansion` overrides from #20 resolve it tree-wide to `5.0.9`, but `minimatch@3.1.5` (pulled by `eslint-plugin-react@7.37.5`) needs the 1.x API. Any ESLint config using a brace `{a,b}` glob crashes with `TypeError: expand is not a function`. #37 worked around it with de-braced globs; the incompatibility is still in the tree.

### CI

Eleven checks. Three added during `v1.1.0` — `unit-react18`, `coverage`, `readme-sync` — **pass but are not in the `main` ruleset's required set**, so they do not block merges. The ruleset requires the original 7 (build-and-test ×4, e2e, the two CodeQL analyses; #51 removed the Node-18 leg).

### Version

`package.json` and npm `latest` both at `1.1.0`.

### Disposition of every open item

| Item | This release? |
| --- | --- |
| #52 — 3 advisories (`rollup`, `vue-template-compiler`, `esbuild`) | **In** — §1 |
| #42 / PR #63 — OIDC publishing | **In** — §2 |
| #61 — `brace-expansion`/`minimatch` | **In** — §3 |
| CI required-checks | **In** — §4 |
| #54 — ESLint 10 | **Decision** — §1.3 folds it in via a plugin swap, or §5 defers it |
| #50 — jsdom 30 | **Out** — §5, needs a Node-22 floor decision |
| #56 — TypeScript 7 | **Out** — §5, upstream-blocked |
| #25 — WCAG audit | **Out** — §5, its own release |
| #1–#5 — features | **Out** — `v1.2.0`+ roadmap |

**Principle:** every version, path, and override-failure above was produced by running a command against `main@fda65f4`, not recalled.

---

## 1. Clear the advisories (#52, and #54 by consequence)

**The ask:** remove the three dev-only advisories. Two of the three, plus the #61 hazard, trace to build tooling that can be replaced.

**Approach:** the common root of the two `vite-plugin-dts` advisories is the plugin itself. `@microsoft/api-extractor` — the tool that actually rolls the declarations up — is already a direct dependency (added in #18). The plugin is now largely a wrapper. Replacing the wrapper with a direct declaration-rollup step removes `rollup` and `vue-template-compiler` from the tree entirely. `esbuild` and ESLint's plugin are handled alongside.

### 1.1 Replace `vite-plugin-dts` with a direct declaration rollup

**Deliverable:** `vite-plugin-dts` and its `unplugin-dts` / `@vue/language-core` subtree gone; declarations produced by `tsc` (emit per-file `.d.ts`) followed by `@microsoft/api-extractor` (roll up to the single entry), wired into `pnpm build:lib`. The `rollup` (#14) and `vue-template-compiler` (#8) advisories clear.

**Special case — the declarations must not change.** This is the #18/#36 discipline: `dist/index.d.ts` and `dist/index.d.cts` are diffed byte-for-byte against the `1.1.0` published artifact. The whole point of api-extractor was that its rollup output is identical; a different bundler (`rollup-plugin-dts`, `dts-bundle-generator`) is **not** acceptable here precisely because it would change the output. If the direct api-extractor path cannot reproduce the bytes, the plugin stays and this sub-area is abandoned rather than shipping a changed type surface.

### 1.2 Resolve or account for `esbuild` (#9)

**Deliverable:** `esbuild` at ≥ 0.25.0, or a recorded finding that it cannot be moved.

`esbuild` is `vite@8`'s **optional** peer (Vite 8 itself uses rolldown/oxc, not esbuild), stuck at 0.21.5. Vite 8's declared peer range is `^0.27.0 || ^0.28.0` — *above* the patched 0.25.0 — so the vulnerable pin comes from somewhere resolving the optional peer low, possibly `vite-plugin-dts`'s own esbuild peer. **Re-measure after §1.1:** removing the plugin may let vite's optional peer float up to a patched version on its own. If it does not, try `pnpm dedupe` and a scoped override; if it still resists (optional peers are override-resistant, per §0), record it as a single lone dev-only medium and file a focused issue. Do not claim it fixed without `pnpm audit` confirming.

### 1.3 ESLint 10 via a plugin swap (#54) — **decision**

**Deliverable:** a decision, applied or deferred.

#54 was filed as "blocked on `eslint-plugin-react` supporting ESLint 10." It is not strictly blocked: **`@eslint-react/eslint-plugin` (5.18.6) is flat-config-native and supports ESLint 10**, and is the maintained successor. Two honest options:

| Option | Effect |
| --- | --- |
| **A. Swap the plugin, take ESLint 10** | Removes `eslint-plugin-react@7.37.5`, the sole source of `minimatch@3.1.5` — so **#61 dissolves as a side effect** and brace globs work again. But the React lint rule set changes (different plugin, different rules); every intentional difference must be reviewed and documented, which is real work |
| **B. Stay on ESLint 9, defer #54** | No lint churn. #61 is handled directly in §3 instead. ESLint 10 waits for `eslint-plugin-react` or a later dedicated pass |

**Recommendation: B for this release.** This is a *security and release* hardening pass; swapping a lint plugin and re-reviewing its rule set is a behavior change that belongs in its own focused change, not bundled with a security release. #61 is cheaply fixed on its own (§3). Record #54 as deferred with the plugin-swap path documented (§5), so it is a scoped task rather than an open-ended wait.

---

## 2. Token-free publishing (#42, PR #63)

**The ask:** remove the stored `NPM_TOKEN` and its silent-expiry failure mode. The workflow is prepped in #63; this release activates it.

**Approach:** the security release is the natural place to also harden the release *pipeline* — and `1.1.1` becomes the proof publish. The mechanics were verified when #63 was written (npm ≥ 11.5.1 upgrade on the runner; pack with pnpm for the LICENSE, publish the tarball with npm for the OIDC exchange).

### 2.1 Register and activate

**Deliverable:** the trusted publisher registered on npmjs.com (GitHub Actions, `thbst16/react-simile-timeline`, `release.yml`), #63 merged, and the `1.1.1` tag published via OIDC with automatic provenance.

**Special case — owner-applied and irreversible.** Registration is done by the maintainer on npmjs.com; the tag push is the maintainer's. A tag pushed before registration fails the OIDC exchange and burns the version number — the same failure mode `NPM_TOKEN` had. The `preflight` job added in #63 confirms the npm version; registration itself can only be confirmed by the real publish.

### 2.2 Retire the credential

**Deliverable:** after a successful OIDC publish, the `NPM_TOKEN` secret deleted (`gh secret delete NPM_TOKEN`) and the `verify-token` job removed from `release.yml`. This is the plan's final §6.4-equivalent step and closes #42.

**Special case:** deletion happens *after* `1.1.1` is confirmed live via OIDC, never before. If the OIDC publish fails, the token path is the fallback and the secret stays.

---

## 3. Close the lockfile hazard (#61)

**The ask:** the `brace-expansion` override forced `minimatch@3.1.5` onto an incompatible major; brace globs in ESLint config crash.

**Approach:** if §1.3 lands option A, this dissolves and §3 is dropped. Under the recommended option B, fix it directly.

### 3.1 Scope the override per-major

**Deliverable:** the `brace-expansion` override rewritten so each consumer stays within its own major —

```json
"brace-expansion@1": "^1.1.16",
"brace-expansion@2": "^2.1.2"
```

— so `minimatch@3.x` keeps a patched **1.x** `brace-expansion` (advisory `<1.1.16` is fixed at `1.1.16`, still 1.x, API-compatible) while other consumers get their patched majors. Then the de-braced-glob workaround from #37 can be reverted, and a brace glob is added back to prove it (`eslint.config.js` `scripts/**/*.{js,mjs}`). Verified by `pnpm audit` staying clean on `brace-expansion` **and** ESLint running a brace glob without crashing.

---

## 4. Enforce the new CI checks (required-checks decision)

**The ask:** `unit-react18`, `coverage` and `readme-sync` pass but do not block merges.

**Deliverable:** the three added to the `main` ruleset's required status checks, taking it from 7 to 10. Applied with the same `gh api` ruleset flow used in #51 (which removed the Node-18 leg). Confirmed by reading the ruleset back and by a trivial PR that must wait on all ten.

**Special case:** repository-settings change, owner-applied — the ruleset is not edited on the maintainer's behalf without confirmation, same as the #51 precedent.

---

## 5. Explicitly out of scope — deferred with triggers

**The ask (answered honestly):** *can everything remaining be done in one release?* No — and pretending otherwise would schedule work that depends on other maintainers shipping. Each deferral below names the specific event that unblocks it, so it is a tracked trigger, not an open-ended wait.

| Item | Why it cannot be in this release | Unblock trigger |
| --- | --- | --- |
| **#50 — jsdom 30** | jsdom 30's `engines.node` is `^22.22.2 \|\| ^24.15.0 \|\| >=26` — it drops **Node 20**, which this package supports (floor 20.19). Taking it means raising the floor to Node 22, a *second* consumer-visible `engines` narrow one release after `1.1.0` did the first | A decision to raise the floor to Node 22 (its own semver conversation), **or** a jsdom line that supports Node 20 (not coming). jsdom 26 has no open advisory, so there is no security pressure |
| **#56 — TypeScript 7** | The native-compiler rewrite. `typescript-eslint@8` caps its peer at `<6.1.0`, and `@microsoft/api-extractor` bundles TS 5.9.3 — §1.1 keeps api-extractor, so this stays blocked even after the dts rework | `typescript-eslint` ships a major admitting TS 7 **and** api-extractor supports it (or the rollup moves off api-extractor). No security or functional pressure; TS 6.0.3 is current |
| **#54 — ESLint 10** | See §1.3. *Not* hard-blocked — `@eslint-react/eslint-plugin` supports ESLint 10 — but the plugin swap is a lint-behavior change that does not belong in a security release | A dedicated lint pass, or folded into the next feature milestone's setup. Path documented in §1.3 |
| **#25 — WCAG 2.1 AA audit** | A full accessibility audit + remediation (axe in CI, screen-reader passes, contrast across three theme paths, focus management, reduced-motion). Sizeable, and a different discipline from toolchain | Its own release and plan. Referenced from the description already (corrected in #24) |
| **#1–#5 — features** | Filter/search, clustering, era bands, export — product roadmap on `v1.2.0`–`v1.4.0`, each needing its own plan | Their milestones |

---

## Resolution model

| Work item | Mode |
| --- | --- |
| §1.1 Drop `vite-plugin-dts`, direct api-extractor rollup (#52) | Autonomous — PR, declarations diffed byte-for-byte |
| §1.2 `esbuild` re-measure and attempt (#9) | Autonomous — PR; **report the audit result, do not claim without it** |
| §1.3 ESLint 10 plugin swap (#54) | **Review artifact** — decide A/B; B recommended |
| §2.1 Register trusted publisher | **Owner-applied** — npm registry setting |
| §2.1 Merge #63, push `1.1.1` tag | **Owner-applied — irreversible** |
| §2.2 Delete `NPM_TOKEN`, remove `verify-token` | **Owner-applied** — after a confirmed OIDC publish |
| §3 `brace-expansion` per-major override (#61) | Autonomous — PR |
| §4 Add three checks to the ruleset | **Owner-applied** — repository setting |
| §5 Deferrals | Recorded — issues updated with triggers |
| Version bump to `1.1.1` | Autonomous — PR |

**Deliverable (review artifact):** the §1.3 ESLint-10 A/B decision, surfaced with the recommendation before §1 is finalized.

---

## Execution order

1. **§1.1 Drop `vite-plugin-dts`** — first and largest. Everything else is smaller and independent. Clears the HIGH `rollup` advisory and the MEDIUM `vue-template-compiler`, and must prove byte-identical declarations before anything builds on it.
2. **§1.2 `esbuild`** — immediately after, re-measured against the post-§1.1 tree, because §1.1 changes what pulls it.
3. **§3 `brace-expansion` per-major override (#61)** — independent; small; unblocks brace globs.
4. **§1.3 decision applied** — if the maintainer chooses A (plugin swap), it supersedes §3; if B, §3 stands and #54 is deferred per §5.
5. **§4 Ruleset checks** — after the code PRs are green, so the newly-required checks are known-passing before they gate.
6. **Pre-flight** — `pnpm audit` at zero, all checks green on `main`, tarball declarations byte-identical to `1.1.0`, `attw` clean.
7. **Version bump to `1.1.1`** — the last PR.
8. **§2 OIDC activation + tag push** — maintainer registers, merges #63, tags `v1.1.1`; publishes token-free.
9. **§2.2** — delete the secret after the publish is confirmed live.
10. **Verification** (below), against the published `1.1.1`.

**Ordering trap:** §2.2 (delete the token) must come *after* a confirmed OIDC publish, never with the #63 merge — the token is the fallback until OIDC is proven on a real release.

---

## Verification (hard requirement)

Exercise the published `1.1.1` and the real audit, not the working tree.

- `pnpm audit` reports **zero** advisories at every severity, and the repository's Dependabot alert count reads **0** (not merely "overridden" — the vulnerable versions must be gone from the tree; confirm with `pnpm why`).
- **Declarations byte-identical to `1.1.0`:** `dist/index.d.ts` and `dist/index.d.cts` from a fresh `1.1.1` pack diff clean against the published `1.1.0`. This is the proof §1.1 changed the build without changing the type surface.
- `attw --pack` clean across all four resolution modes on the published tarball; 11 files including `LICENSE`.
- **OIDC publish with no `NPM_TOKEN`:** `npm view react-simile-timeline@1.1.1 dist.attestations` non-empty, and the `release.yml` run shows the OIDC exchange with the secret absent from the workflow.
- A CommonJS `node16` consumer type-checks against the published `1.1.1` on both React 18 and React 19 — the #14 regression guard, still green.
- ESLint runs a brace `{a,b}` glob without crashing (#61 closed).
- The `main` ruleset lists ten required checks; a PR waits on all ten.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` green under `TZ=UTC` and a non-UTC `TZ`; 120 tests; 20 e2e.

---

## Constraints (hard rules in force)

- **PRs only — no direct commits** (global rule), enforced by the ruleset on `main`.
- **The public API and the emitted declarations do not change.** This is a maintenance release: `dist/index.d.ts` / `dist/index.d.cts` are diffed byte-for-byte against `1.1.0`, and any difference is a defect in §1.1, not a feature.
- **Semver: `1.1.1` as a patch.** Every change is dev-only dependency, CI, or build-internal — nothing a consumer's code or types touch. If §1.3 option A is taken and the lint rule set changes, that is still dev-only. If anything forces a consumer-visible change, stop and re-decide the version.
- **Publishing is owner-applied and irreversible.** Trusted-publisher registration, the tag push, and the token deletion are the maintainer's. `1.0.0` is permanently uninstallable because a publish was reversed.
- **Do not delete or move any tag** (#8) — the 10 tags are the only reference to pre-rebuild history.
- **Do not claim an advisory fixed without `pnpm audit` confirming it** — the override that silently failed (§0) is the precedent.
- **Scope discipline.** #50, #56, #25 and the feature milestones stay out (§5); this release does not grow to swallow them, however close the toolchain work sits to #54 and #56.
- **No client or personal names anywhere** (global rule) — role language only.
- **One-off scripts live in a scratchpad**, never committed. The maintainer's untracked working-tree files are not touched.
