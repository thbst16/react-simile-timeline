# Accessibility Conformance Statement

**Component:** `react-simile-timeline`
**Target standard:** [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/), **Level AA**
**Conformance status:** Conforms to WCAG 2.1 Level AA.
**Last reviewed:** 2026-08-20 (release `1.2.0`)

This statement covers the rendered output of the `<Timeline>` component and its
sub-components. It does not cover application code a consumer wraps around the
component, nor the content of the data a consumer supplies (see
[Consumer responsibilities](#consumer-responsibilities)).

---

## How conformance was verified

Conformance is held by an automated gate in continuous integration plus a
documented manual audit. The automated checks run on every pull request and
block merge on any regression.

| Method | Tool | What it covers | Where |
| --- | --- | --- | --- |
| Automated rule scan | [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` rule tags | The machine-detectable slice — contrast, names, roles, ARIA misuse — scanned on the default page, the dark theme, and with an event popup open. Zero violations required. | `demo/tests/a11y.spec.ts` |
| Keyboard operability | Playwright | Tab reaches the timeline and every marker; arrows pan and `+`/`-` zoom while the timeline is focused; a marker opens the popup with `Enter`; focus is trapped in the popup and restored on `Escape`. | `demo/tests/keyboard.spec.ts` |
| Screen-reader semantics | Playwright accessibility-tree assertions | The name/role/value data a screen reader consumes: the timeline as a labelled region, the event layer as a named group, markers announcing title and date, and decorative bands/axes hidden from the tree. | `demo/tests/screenreader.spec.ts` |
| Reduced motion | Playwright emulated media | Animations and transitions are present by default and removed under `prefers-reduced-motion: reduce`. | `demo/tests/reduced-motion.spec.ts` |
| Contrast | Manual audit against the WCAG contrast formula | Every default theme token pair (classic and dark), text and non-text. | See [Contrast](#contrast-1) below. |

**Recommended additional verification.** Automated tools and accessibility-tree
assertions cover the programmatically determinable criteria, but they are not a
substitute for testing with a real assistive technology. Consumers with a
specific screen-reader requirement are encouraged to verify with their target
reader (for example VoiceOver on macOS/iOS, NVDA or JAWS on Windows, or Orca on
Linux). The component's semantics are built and asserted against the standard
accessibility tree those readers consume.

---

## Criteria met

### Perceivable

- **1.1.1 Non-text Content (A).** Event images carry alternative text (the event
  title). Purely decorative elements — the overview mini-map, the time axis, and
  un-annotated hot-zone highlights — are hidden from the accessibility tree.
- **1.3.1 Info and Relationships (A).** Structure is conveyed through roles and
  names: the timeline is a `region`, the event layer a labelled `group`, each
  marker a `button`, the details popup a `dialog`, and an annotated period a
  `note`.
- **1.4.3 Contrast (Minimum) (AA).** All text meets or exceeds 4.5:1 in both
  built-in themes (measured minimum 5.50:1).
- **1.4.11 Non-text Contrast (AA).** Focus indicators and meaningful graphics
  meet or exceed 3:1 (focus rings 4.13–6.81:1; event dots 3.34–4.29:1).

### Operable

- **2.1.1 Keyboard (A).** Every interactive element is operable by keyboard: the
  timeline band takes a tab stop and pans with the arrow keys and zooms with
  `+`/`-`; markers are reached by `Tab` and activated with `Enter`/`Space`; the
  popup is fully keyboard-operable. This is the accessible, non-pointer
  equivalent for pan and zoom.
- **2.1.2 No Keyboard Trap (A).** The popup deliberately traps focus while open
  (it is a modal dialog) and releases it on `Escape` or close, returning focus
  to the marker that opened it. Nothing else traps focus.
- **2.4.3 Focus Order (A).** Focus order follows reading order — the timeline
  band, then its markers; opening the popup moves focus into the dialog and
  closing it restores focus to the opener.
- **2.4.7 Focus Visible (AA).** A visible focus indicator is shown on every
  focusable element when reached by keyboard, via the themeable
  `--focus-ring-color` variable.

### Understandable

- **3.2.1 On Focus / 3.2.2 On Input (A).** Moving focus to the timeline or a
  marker does not trigger a change of context; the popup opens only on explicit
  activation.

### Robust

- **4.1.2 Name, Role, Value (A).** Interactive elements expose an accessible
  name, role, and state — markers report `aria-pressed` and advertise their
  shortcuts with `aria-keyshortcuts`; the popup is `aria-modal` with a labelled
  dialog; the timeline region carries an `aria-roledescription`.

### Beyond AA

- **2.3.3 Animation from Interactions (AAA).** Although an AAA criterion, the
  component honours `prefers-reduced-motion`: event and popup fade-ins and
  theme-change transitions are removed, and a pan stops on release rather than
  gliding with momentum. No animation runs longer than 0.2s or is essential, so
  **2.2.2 Pause, Stop, Hide (A)** does not apply.

---

## Contrast

Every default theme token pair was measured against the WCAG contrast formula.
Results (worst case per category):

| Theme | Category | Minimum measured | Requirement |
| --- | --- | --- | --- |
| Classic | Text | 5.50:1 | 4.5:1 |
| Classic | Non-text (focus ring, dots) | 3.34:1 | 3:1 |
| Dark | Text | 6.46:1 | 4.5:1 |
| Dark | Non-text (focus ring, dots) | 4.29:1 | 3:1 |

The thin dividers between bands sit below 3:1 (1.32:1 classic, 1.47:1 dark).
These are decorative separators, not controls or state indicators, and are
exempt under 1.4.11.

---

## Consumer responsibilities

The component is a building block; a few things are the consuming application's
responsibility:

- **Custom themes.** When overriding the CSS-variable palette, keep text at
  ≥4.5:1 against its background and set `--focus-ring-color` to ≥3:1 against the
  surfaces it appears on. The two built-in themes already satisfy this.
- **Event description HTML.** Event descriptions are rendered as HTML for Simile
  compatibility. Sanitize untrusted description content before passing it in.
- **Surrounding page structure.** Provide the page-level landmarks, headings,
  and language attributes the timeline is embedded within.

---

## Feedback

Accessibility issues can be reported on the project's
[issue tracker](https://github.com/thbst16/react-simile-timeline/issues). The
audit that established this statement is tracked in
[#25](https://github.com/thbst16/react-simile-timeline/issues/25).
