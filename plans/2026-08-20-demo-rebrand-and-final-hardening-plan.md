# React Simile Timeline — v1.3.0: Demo Rebrand & Final Hardening

**Date:** 2026-08-20
**Scope:** The `demo/` site (daisyUI reskin, stale-copy fixes) and the library's popup theming, plus the two remaining actionable toolchain items. Covers **#74** (dark-theme popup colors), **#72** (deferred `@eslint-react` rules), **#42** (OIDC publishing), and demo polish. Publishes `1.3.0`. **Out of scope:** #56 (TypeScript 7 — proven still blocked, §6) and any change to the timeline component's public API.
**Goal:** The hosted demo is rebranded on a daisyUI theme (no more default purple), the dark-theme popup renders with dark colors, the lint rules parked during the ESLint 10 migration are adopted, and npm OIDC trusted publishing is live — shipped as `1.3.0`.

---

## 0. Current State (baseline)

`1.2.0` shipped to npm on 2026-08-20 (WCAG 2.1 AA release) via the `NPM_TOKEN` path after OIDC failed to authorize. The demo production-blank regression (duplicate React) is fixed and now guarded by a production-preview e2e run in CI.

| Dimension | State |
| --- | --- |
| Published version | `1.2.0` (npm, attested) |
| Open issues | 4 — #42 (p1), #74 (p2), #72 (p2), #56 (p2) |
| Demo styling | Plain Tailwind v3.4, empty `tailwind.config.js` `extend`; blue/indigo/purple hardcoded across 5 components |
| Demo e2e | Runs against the production `vite preview` build in CI (`E2E_PREVIEW=1`) |
| Lint | ESLint 10 + `@eslint-react`; 6 rules disabled (4 from #72 + 2 React-18-required context rules that stay off) |
| Release path | Token path (`release.yml`); OIDC workflow reverted in #83, preserved in #63/#82 history |

**Confirmed defects driving this plan:**

- **#74** — `EventPopup` renders through `createPortal(…, document.body)`, escaping `.timeline-root`, so the popup's CSS custom properties (`--popup-bg`, etc.) never resolve and it falls back to the light inline defaults even under the dark theme. `packages/react-simile-timeline/src/components/EventPopup.tsx:354`.
- **#42** — OIDC publish returns `404 Not Found - PUT` after signing provenance: GitHub OIDC works, npm's trusted-publisher exchange is not authorized. Root cause is the npmjs.com trusted-publisher registration, not the workflow.
- Demo hero badge was `v1.0.2` (fixed to `v1.2.0`); Footer still reads "Copyright 2024".

---

## 1. Demo rebrand on daisyUI

**The ask:** Replace the default-Tailwind purple look with a deliberate, swappable theme, and fix the stale demo copy.
**Approach:** Adopt daisyUI as a Tailwind plugin so the site is driven by one named theme (browse-and-swap), then migrate the five components off hardcoded `blue-*`/`indigo-*`/`purple-*` utilities onto daisyUI's semantic classes (`btn`, `badge`, `card`, `bg-base-*`, `text-primary`, etc.).

### 1.1 Adopt daisyUI + pick a theme

**Approach:** Add `daisyui` to the demo devDependencies, register it in `tailwind.config.js` (`plugins: [require('daisyui')]`), enable the chosen theme plus a dark variant, and set `data-theme` on the app root.
**Deliverable:** daisyUI installed; one theme active; swapping the whole site's look is a one-line `data-theme` change. **Theme selection is the maintainer's — pending pick from https://daisyui.com/themes.** Shortlist for a developer-library landing page: **`corporate`** (clean, light, professional), **`business`** (dark, serious), **`nord`** (muted blue-grey, dev-favourite), **`emerald`** (fresh light green), **`winter`** (light, cool neutral).

### 1.2 Migrate the five components

**Approach:** Rework `Header`, `Hero`, `DemoSection`, `CodeBlock`, `Footer` to daisyUI semantic classes and `base`/`primary`/`accent` color tokens. Keep the existing layout and copy; change only the styling layer. Preserve the accessibility fixes already shipped (icon-only GitHub link `aria-label`, `text-gray-700` badge contrast).
**Deliverable:** No hardcoded brand-color utilities remain; the site reads as the chosen theme; light/dark both legible.

### 1.3 Stale demo copy

**Deliverable:** Footer copyright "2024" → "2026". (Hero badge `v1.0.2` → `v1.2.0` already shipped.)

**Verification for §1:** `pnpm --filter demo build` succeeds; the production-preview e2e stays green; manual screenshot of the deployed preview in both theme states; re-run the axe gate on the demo (the rebrand must not introduce contrast violations).

---

## 2. Dark-theme popup colors (#74)

**The ask:** The event popup uses light colors in the dark theme because it portals outside the themed root.
**Approach:** Wrap the portal content in a container that re-establishes the theme — give the portal wrapper `className="timeline-root"` and the same `data-theme` the timeline is using (read from context/state), so `var(--popup-bg)` and siblings resolve to the themed values instead of the inline light fallbacks. Keeps the `document.body` portal (needed for z-index/overflow escape) while restoring the cascade.

**Deliverable:** In the dark theme, the popup background, text, title, date, link, and close button all render with the dark tokens. A unit test asserts the portal wrapper carries the theme, and an e2e opens a popup under the dark theme and checks a dark background is computed. The axe gate covers the dark-popup contrast (already scanning the popup-open state).

---

## 3. Adopt the deferred `@eslint-react` rules (#72)

**The ask:** Four rules were disabled to keep the ESLint 10 migration behaviour-preserving; adopt them now with real fixes.
**Approach:** Re-enable and remediate one rule at a time: `web-api-no-leaked-fetch` (the genuine finding — guard/cancel in-flight fetches), `no-array-index-key` (stable keys), `set-state-in-effect`, `use-state`. Each becomes `error` only after its findings are fixed. **The two React-19-only context rules (`no-context-provider`, `no-use-context`) stay off** — they conflict with the `^18 || ^19` peer floor (documented in the config).

**Deliverable:** The four rules are `error` with zero violations; `pnpm lint` clean; unit/e2e unchanged (behaviour-preserving fixes, verified by the suite).

---

## 4. OIDC trusted publishing (#42)

**The ask:** Finish the token→OIDC cutover that 1.2.0 abandoned when npm rejected the exchange.
**Approach:** The workflow was already proven to sign provenance; the blocker is the npmjs.com trusted-publisher registration. Sequence: (a) **maintainer** re-checks/fixes the trusted publisher on npmjs.com — exact `release.yml` filename, `thbst16/react-simile-timeline`, **blank** environment; (b) re-apply the OIDC `release.yml` (revert the #83 revert — the OIDC version is preserved in #63/#82); (c) dry-run the OIDC **preflight**; (d) publish `1.3.0` via OIDC; (e) delete `NPM_TOKEN` after a confirmed OIDC release.

**Special case — owner-applied and irreversible.** The npm registration and the tag push are the maintainer's. A tag before the trusted publisher is authorized fails after build (recoverable — no version burned, as seen with 1.2.0). Do **not** re-enable the OIDC workflow until the maintainer confirms the registration is fixed.

**Deliverable:** `1.3.0` published via OIDC with provenance and no `NPM_TOKEN` in the workflow, or — if the registration still can't be authorized — `1.3.0` ships on the token path again and #42 stays open with the specific npm-side blocker recorded. Delivery is not held hostage to OIDC.

---

## 5. Version bump and release

**Approach:** After §1–§4 land and CI is green, bump `packages/react-simile-timeline/package.json` to `1.3.0`, close the CHANGELOG `[Unreleased]` block as `[1.3.0]`, and (maintainer) push `v1.3.0`. The rebrand and copyright fixes are demo-only and do not change the published package, but the popup fix (#74) and lint adoption (#72) are library changes that warrant the minor bump.

**Ordering trap:** the tag must be pushed from a `main` that already contains the version bump (the release workflow guards tag == `package.json`); the 1.2.0 mis-tag came from tagging before the bump merged.

**Deliverable:** `react-simile-timeline@1.3.0` on npm, attested; demo redeployed with the new theme.

---

## 6. Explicitly out of scope — with evidence

**#56 — TypeScript 6 → 7.** Verified 2026-08-20: TypeScript `7.0.2` is published, but `typescript-eslint@8.67.0` still declares `peerDependencies.typescript: ">=4.8.4 <6.1.0"` — it cannot run on TS 7 (or even 6.1+), and `@microsoft/api-extractor@7.58.13` bundles TS 5.9.3. Adopting TS 7 would break linting and the declaration rollup. Genuinely upstream-blocked; deferred until `typescript-eslint` widens its peer range. Re-verify with `npm view typescript-eslint peerDependencies.typescript` before any future attempt.

---

## Resolution model

| Work | Mode |
| --- | --- |
| §1 demo rebrand + copy, §2 popup fix, §3 lint adoption | Autonomous — PR per concern, each re-runs the production-preview e2e + axe gate |
| §4 npm trusted-publisher registration | **Owner-applied** — maintainer's npmjs.com account |
| §4 re-enable OIDC workflow | Autonomous PR, but merged only after the maintainer confirms registration |
| §5 tag push / npm publish | **Owner-applied** — irreversible |

---

## Execution order

1. **§1 demo rebrand** (after the theme is picked) — the largest visible change; unblocks nothing else, so it goes first and can iterate on screenshots.
2. **§2 popup fix (#74)** — independent library change; re-run the axe dark-popup scan.
3. **§3 lint adoption (#72)** — behaviour-preserving; keep separate from §2 so any regression is isolated.
4. **§4 OIDC** — maintainer fixes the npm registration; then re-enable the workflow.
5. **§5 bump + release 1.3.0** — only once §1–§4 are green; maintainer pushes the tag from a bumped `main`.
6. **Verification pass** below.

---

## Verification (hard requirement)

- `pnpm lint`, `typecheck`, unit (`pnpm --filter react-simile-timeline test`) all green.
- **Production-preview e2e** (`E2E_PREVIEW=1`) green — the demo must render as its built bundle, not just in dev.
- **axe WCAG 2 A/AA gate** green after the rebrand and the popup fix — the new theme must not regress contrast.
- Dark-theme popup manually confirmed dark in a real browser against the deployed preview.
- OIDC: a real publish is the only true test; the preflight confirms npm ≥ 11.5.1 beforehand.

---

## Constraints (hard rules in force)

- **PR-only.** No direct commits to `main`; every change reviewed and green before merge.
- **No client or personal names** in code, comments, commits, or logs — role language only.
- **Owner-applied stays owner-applied.** The npm trusted-publisher registration and the `v1.3.0` tag push are the maintainer's; nothing here pushes a tag or edits the npm account.
- **Do not touch the maintainer's untracked working-tree files** (e.g. the root `src/` landing-page work).
- **Delivery wins.** If OIDC still can't be authorized, ship `1.3.0` on the token path rather than block the release.
