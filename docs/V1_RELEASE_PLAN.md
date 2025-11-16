# React Simile Timeline - V1 Release Plan

**Status**: Planning Phase
**Target Release**: v1.0.0
**Current Version**: v0.1.0-beta.3
**Sprint Duration**: 5 days
**Repository**: react-simile-timeline (production)

---

## Executive Summary

This plan outlines the transition from beta (v0.1.0-beta.3) to stable v1.0.0 release. The focus is on fixing critical errors, stabilizing the API, and clearly documenting what is and isn't included in v1.

**Key Principles:**
- API freeze after Day 2
- Clear migration path from beta to v1
- Transparent roadmap for deferred features
- Zero tolerance for security vulnerabilities
- Maintain backward compatibility where possible

---

## 1. Critical Errors to Fix Immediately

### 1.1 Demo Site Version Display
**Issue**: Footer shows `v0.1.0-alpha.0` instead of current `v0.1.0-beta.3`

**Location**: `src/components/LandingPage.tsx` (footer section)

**Fix Required**:
```tsx
// Current (WRONG):
<p>v0.1.0-alpha.0</p>

// Fixed:
<p>v{packageJson.version}</p>
```

**Files to Update**:
- [ ] `src/components/LandingPage.tsx` - Import version from package.json
- [ ] Verify version displays dynamically on demo site
- [ ] Test on Vercel deployment

**Estimated Time**: 30 minutes
**Priority**: P0 (Critical)
**Day**: Day 1

---

### 1.2 Installation Instructions Accuracy
**Issue**: Documentation may reference outdated alpha release

**Files to Audit**:
- [ ] `README.md` (production repo)
- [ ] `docs/MIGRATION.md`
- [ ] `docs/EXAMPLES.md`
- [ ] `docs/API.md`
- [ ] Demo site copy in `src/components/LandingPage.tsx`

**Fix Required**:
- Remove all references to `@alpha` tag
- Ensure `npm install react-simile-timeline` installs latest
- Update examples to use current API
- Add clear upgrade path from beta to v1

**Estimated Time**: 2 hours
**Priority**: P0 (Critical)
**Day**: Day 1

---

### 1.3 Theme Switcher UX Improvements
**Issue**: Theme switcher icons unclear, no tooltips, theme doesn't persist

**Location**: `src/components/ThemeSwitcher.tsx`

**Fixes Required**:
1. **Add Tooltips**:
   ```tsx
   <button title="Classic Vintage Theme">🎨</button>
   <button title="Dark Mode">🌙</button>
   <button title="Auto (System)">✨</button>
   ```

2. **Persist Theme Selection**:
   ```tsx
   // Already implemented via localStorage in useTheme hook
   // Verify it's working correctly
   ```

3. **Visual Feedback**:
   - Highlight active theme
   - Add hover states
   - Consider aria-pressed for accessibility

**Files to Update**:
- [ ] `src/components/ThemeSwitcher.tsx` - Add tooltips
- [ ] `src/hooks/useTheme.tsx` - Verify persistence
- [ ] Test theme switching across page reloads

**Estimated Time**: 1 hour
**Priority**: P1 (High)
**Day**: Day 3

---

### 1.4 Footer License/Copyright Update
**Issue**: License year and version may be outdated

**Location**: `src/components/LandingPage.tsx` (footer)

**Fix Required**:
```tsx
<footer>
  <p>MIT © 2024-2025 Thomas Beck</p>
  <p>v{packageJson.version}</p>
</footer>
```

**Files to Update**:
- [ ] `src/components/LandingPage.tsx`
- [ ] `LICENSE` file (verify copyright year)
- [ ] `package.json` (verify license field)

**Estimated Time**: 15 minutes
**Priority**: P2 (Medium)
**Day**: Day 1

---

## 2. Features NOT Included in V1

These features are explicitly deferred to post-v1 releases. They will remain documented in the roadmap but marked as "Future Work."

### 2.1 Deferred Features

| Feature | Reason for Deferral | Target Version |
|---------|-------------------|----------------|
| **Storybook Integration** | Requires significant setup; not blocking v1 | v1.1.0 |
| **Additional Painters** | Original/Compact/Overview sufficient for v1 | v1.2.0 |
| **Enhanced Touch Gestures** | Basic touch support working; advanced features can wait | v1.2.0 |
| **Mobile-Optimized Layouts** | Responsive design working; optimization can be iterative | v1.1.0 |
| **Additional Theme Presets** | Classic + Dark sufficient for v1 | v1.1.0 |
| **Plugin Architecture** | Major architectural change; needs design phase | v2.0.0 |
| **Real-Time Data Updates** | Complex feature; not requested by users yet | v1.3.0 |
| **Export to Image/PDF** | Nice-to-have; can be added later | v1.2.0 |

### 2.2 Documentation Updates Required

**Files to Update**:
- [ ] `README.md` - Update roadmap section
- [ ] `CHANGELOG.md` - Add v1.0.0 section with deferred features note
- [ ] Create `docs/ROADMAP.md` with detailed feature timeline
- [ ] Update demo site FAQ with "What's not in v1?"

**Estimated Time**: 3 hours
**Priority**: P1 (High)
**Day**: Day 1

---

## 3. Critical/Breaking Changes for V1

### 3.1 API Stabilization and Naming Review

**Objective**: Freeze public API, eliminate ambiguity, ensure consistency

**Components to Audit**:

#### 3.1.1 Timeline Component Props
```tsx
// Current props to review:
interface TimelineProps {
  data?: TimelineEvent[];
  dataUrl?: string;
  bands: BandConfig[];
  width?: string | number;
  height?: number;
  // ... other props
}
```

**Questions to Answer**:
- [ ] Is `data` vs `dataUrl` clear? (Keep as-is, mutually exclusive)
- [ ] Should `width` accept both string and number? (Yes, for flexibility)
- [ ] Are all props documented in API.md? (Audit required)

#### 3.1.2 Band Configuration
```tsx
interface BandConfig {
  width: string;
  intervalUnit: IntervalUnit;
  intervalPixels: number;
  // ... other props
}
```

**Potential Breaking Changes**:
- [ ] Rename `intervalPixels` to `intervalWidth`? (DECISION: Keep as-is, too disruptive)
- [ ] Rename `syncWith` to `syncToBand`? (DECISION: Keep as-is, clear enough)
- [ ] Add required `id` field? (DECISION: Already optional, keep optional)

#### 3.1.3 Hook APIs
- [ ] `useTheme()` - Review return type
- [ ] `useKeyboardNav()` - Review options
- [ ] `useAccessibility()` - Review methods
- [ ] `useVirtualization()` - Review stats object
- [ ] `useEventFilter()` - Review filter options

**Action Items**:
- [ ] Create `docs/API_AUDIT.md` documenting all public APIs
- [ ] Flag any ambiguous names for renaming
- [ ] Document all default values
- [ ] Remove any experimental/internal exports

**Estimated Time**: 8 hours
**Priority**: P0 (Critical)
**Day**: Day 2

---

### 3.2 HTML Sanitization for Event Descriptions

**Security Issue**: Event descriptions may allow HTML injection

**Current Implementation**:
```tsx
// EventBubble.tsx - may render raw HTML
<div dangerouslySetInnerHTML={{ __html: event.description }} />
```

**Required Fix**:
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Sanitize all HTML before rendering:
   ```tsx
   import DOMPurify from 'dompurify';

   const sanitizedHTML = DOMPurify.sanitize(event.description, {
     ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
     ALLOWED_ATTR: ['href', 'target', 'rel']
   });
   ```

**Breaking Change**:
- Scripts and iframes will be stripped
- Some HTML tags may be removed
- Must document allowed tags

**Files to Update**:
- [ ] `package.json` - Add DOMPurify dependency
- [ ] `src/components/EventBubble.tsx` - Implement sanitization
- [ ] `src/types/events.ts` - Document allowed HTML
- [ ] `docs/MIGRATION.md` - Document breaking change
- [ ] `docs/SECURITY.md` - New file explaining sanitization

**Estimated Time**: 4 hours
**Priority**: P0 (Critical)
**Day**: Day 2

---

### 3.3 Theme API Adjustments

**Current State**: Themes use TypeScript objects with color values

**Potential Breaking Changes**:
- [ ] Move to CSS variables? (DECISION: Defer to v2.0)
- [ ] Change theme prop names? (DECISION: No changes)
- [ ] Add new required theme properties? (DECISION: All optional)

**Action Items**:
- [ ] Document current theme API as stable
- [ ] Freeze `TimelineTheme` interface
- [ ] Add deprecation warnings for any future changes
- [ ] Create `docs/THEMING.md` guide

**Estimated Time**: 2 hours
**Priority**: P2 (Medium)
**Day**: Day 3

---

### 3.4 Documentation Structure Overhaul

**Objective**: Remove beta warnings, add v1 migration guide

**Files to Update**:

1. **README.md**:
   - [ ] Remove beta warnings
   - [ ] Update badges to v1.0.0
   - [ ] Add "What's New in V1" section
   - [ ] Update installation to reference v1

2. **CHANGELOG.md**:
   - [ ] Add v1.0.0 section
   - [ ] Document breaking changes
   - [ ] List deferred features
   - [ ] Migration notes from beta

3. **New: docs/MIGRATION.md**:
   - [ ] Beta to v1 upgrade guide
   - [ ] Breaking changes list
   - [ ] Code examples (before/after)
   - [ ] Deprecation timeline

4. **API.md**:
   - [ ] Audit all component docs
   - [ ] Add missing props
   - [ ] Document all defaults
   - [ ] Add code examples

5. **New: docs/BREAKING_CHANGES.md**:
   - [ ] List all v1 breaking changes
   - [ ] Severity rating (critical/major/minor)
   - [ ] Migration instructions
   - [ ] Estimated effort

**Estimated Time**: 6 hours
**Priority**: P0 (Critical)
**Day**: Day 5

---

## 4. Five-Day Sprint Schedule

### Day 1 - Kickoff & Housekeeping (Wednesday)

**Goals**: Fix environment, update documentation, establish baseline

**Morning (4 hours)**:
- [ ] Sprint kickoff meeting (30 min)
- [ ] Fix demo site version display (30 min)
- [ ] Update footer license/copyright (15 min)
- [ ] Audit README for alpha references (1 hour)
- [ ] Create V1_RELEASE_PLAN.md (this document) (1 hour)
- [ ] Set up tracking board (45 min)

**Afternoon (4 hours)**:
- [ ] Update installation instructions across all docs (2 hours)
- [ ] Create docs/ROADMAP.md with deferred features (1 hour)
- [ ] Update CHANGELOG.md for v1 prep (1 hour)

**Deliverables**:
- Demo site shows correct version
- All docs reference beta.3 (not alpha)
- Roadmap published with deferred features
- Sprint tracking board ready

**Lead**: Assigned developer
**Reviewers**: Project maintainer

---

### Day 2 - API Stabilization & Breaking Changes (Thursday)

**Goals**: Freeze API, implement security fixes, document breaking changes

**Morning (4 hours)**:
- [ ] Create docs/API_AUDIT.md (1 hour)
- [ ] Audit all exported components (1 hour)
- [ ] Audit all hooks (1 hour)
- [ ] Identify breaking changes (1 hour)

**Afternoon (4 hours)**:
- [ ] Install and configure DOMPurify (30 min)
- [ ] Implement HTML sanitization in EventBubble (2 hours)
- [ ] Write tests for sanitization (1 hour)
- [ ] Start docs/MIGRATION.md draft (30 min)

**Deliverables**:
- Complete API audit document
- HTML sanitization implemented and tested
- List of all breaking changes
- Migration guide draft started

**Lead**: Senior developer
**Reviewers**: Security reviewer

---

### Day 3 - UX/Theme Improvements (Friday)

**Goals**: Polish user experience, fix minor bugs, improve accessibility

**Morning (4 hours)**:
- [ ] Add tooltips to theme switcher (1 hour)
- [ ] Verify theme persistence (30 min)
- [ ] Improve theme switcher visual feedback (1 hour)
- [ ] Create docs/THEMING.md (1.5 hours)

**Afternoon (4 hours)**:
- [ ] Accessibility audit with axe-core (1 hour)
- [ ] Fix any accessibility violations (2 hours)
- [ ] Test keyboard navigation (1 hour)

**Deliverables**:
- Theme switcher UX improved
- Theming guide published
- Accessibility issues resolved
- WCAG 2.1 AA compliance verified

**Lead**: UX developer
**Reviewers**: Accessibility specialist

---

### Day 4 - Testing & Audit (Monday)

**Goals**: Comprehensive testing, performance validation, security audit

**Morning (4 hours)**:
- [ ] Run full test suite (30 min)
- [ ] Expand tests for BCE dates (1 hour)
- [ ] Add tests for large datasets (1000+ events) (1 hour)
- [ ] Test event overlap scenarios (1 hour)
- [ ] Fix any failing tests (30 min)

**Afternoon (4 hours)**:
- [ ] Performance testing (60fps validation) (2 hours)
- [ ] Virtualization testing with 2000+ events (1 hour)
- [ ] Bundle size analysis (1 hour)

**Deliverables**:
- All tests passing (>80% coverage maintained)
- Performance benchmarks met
- Bundle size <150KB gzipped
- Test report document

**Lead**: QA engineer
**Reviewers**: Tech lead

---

### Day 5 - Documentation & Release Candidate (Tuesday)

**Goals**: Finalize docs, tag RC, prepare release notes

**Morning (4 hours)**:
- [ ] Complete docs/MIGRATION.md (2 hours)
- [ ] Complete docs/BREAKING_CHANGES.md (1 hour)
- [ ] Update README.md for v1 (1 hour)

**Afternoon (4 hours)**:
- [ ] Update CHANGELOG.md with v1.0.0 section (1 hour)
- [ ] Final review of all documentation (1 hour)
- [ ] Tag v1.0.0-rc.1 (30 min)
- [ ] Deploy to demo site (30 min)
- [ ] Write release notes (1 hour)

**Deliverables**:
- Complete migration guide
- Complete breaking changes doc
- v1.0.0-rc.1 tagged and deployed
- Release notes ready

**Lead**: Project maintainer
**Reviewers**: All team members

---

## 5. Migration Guide Outline

**File**: `docs/MIGRATION.md`

```markdown
# Migration Guide: Beta → V1

## Overview
This guide helps you upgrade from v0.1.0-beta.x to v1.0.0.

## Breaking Changes

### 1. HTML Sanitization (Security)
**Impact**: High
**Affected**: Event descriptions with HTML content

**Before (beta.3)**:
```tsx
// HTML was rendered without sanitization
event.description = '<script>alert("XSS")</script>';
```

**After (v1.0.0)**:
```tsx
// Scripts are automatically stripped
// Only safe HTML tags allowed: b, i, em, strong, a, p, br, ul, ol, li
```

**Migration**: Review event descriptions; remove any scripts or iframes.

### 2. API Naming (If Any)
**Impact**: Low
**Affected**: TBD after Day 2 audit

### 3. Theme API (If Any)
**Impact**: None (stable)

## Deprecations
- None in v1.0.0

## New Features
- HTML sanitization with DOMPurify
- Improved theme switcher UX
- Better documentation

## Upgrade Steps
1. Update package: `npm install react-simile-timeline@latest`
2. Review event descriptions for HTML content
3. Test theme switching
4. Run your test suite
5. Verify no console warnings
```

---

## 6. Breaking Changes Document Outline

**File**: `docs/BREAKING_CHANGES.md`

```markdown
# Breaking Changes - V1.0.0

## HTML Sanitization
**Severity**: Critical (Security)
**Category**: Security Enhancement

**What Changed**:
Event descriptions containing HTML are now sanitized using DOMPurify.

**Allowed Tags**:
- Text formatting: `<b>`, `<i>`, `<em>`, `<strong>`
- Links: `<a href="..." target="..." rel="...">`
- Structure: `<p>`, `<br>`, `<ul>`, `<ol>`, `<li>`

**Blocked Tags**:
- Scripts: `<script>`, `<iframe>`, `<object>`
- Forms: `<form>`, `<input>`, `<button>`
- Events: `onclick`, `onerror`, etc.

**Migration Effort**: Low (1-2 hours)

**Action Required**:
Review and clean event description HTML.

---

## API Changes
(To be filled after Day 2 audit)
```

---

## 7. Roadmap Document Outline

**File**: `docs/ROADMAP.md`

```markdown
# React Simile Timeline - Product Roadmap

## V1.0.0 (Current Release) - Stable Foundation
**Status**: In Progress
**Target**: [Date]

**Goals**:
- API freeze and stabilization
- Security hardening (HTML sanitization)
- Production-ready quality
- Comprehensive documentation

**Included**:
- ✅ 3 painter types (Original, Compact, Overview)
- ✅ Classic + Dark themes
- ✅ Touch support (basic)
- ✅ Keyboard navigation
- ✅ WCAG 2.1 AA accessibility
- ✅ Virtualization for 1000+ events
- ✅ 100% Simile JSON compatibility

**Not Included** (Deferred):
- ❌ Storybook integration
- ❌ Additional painters
- ❌ Advanced touch gestures
- ❌ Mobile-optimized layouts
- ❌ Plugin architecture
- ❌ Export to image/PDF
- ❌ Real-time updates

---

## V1.1.0 - UX Enhancements
**Target**: [Date +6 weeks]

**Goals**:
- Improve mobile experience
- Add more themes
- Enhance touch gestures

**Features**:
- Mobile-optimized layouts
- 2-3 additional theme presets
- Improved touch gesture support
- Storybook integration

---

## V1.2.0 - Advanced Features
**Target**: [Date +12 weeks]

**Goals**:
- Export capabilities
- Additional visualization options

**Features**:
- Export to PNG/SVG
- Export to PDF
- 1-2 additional painter types
- Enhanced filtering UI

---

## V1.3.0 - Real-Time & Performance
**Target**: [Date +18 weeks]

**Goals**:
- Real-time data support
- Performance optimizations

**Features**:
- Real-time event updates
- WebSocket support
- Optimized bundle size
- Advanced virtualization

---

## V2.0.0 - Plugin Architecture
**Target**: [Date +24 weeks]

**Goals**:
- Extensibility framework
- Community contributions

**Features** (Breaking Changes):
- Plugin architecture
- Custom painter API
- Theme plugin system
- Event transformer plugins
```

---

## 8. Testing Checklist

### 8.1 Unit Tests
- [ ] All existing tests pass
- [ ] BCE date handling
- [ ] Large dataset (2000+ events)
- [ ] Event overlap scenarios
- [ ] HTML sanitization
- [ ] Theme persistence
- [ ] Keyboard navigation

### 8.2 Integration Tests
- [ ] Timeline rendering with real data
- [ ] Multi-band synchronization
- [ ] Theme switching
- [ ] Event filtering
- [ ] Virtualization activation

### 8.3 E2E Tests
- [ ] Demo site loads
- [ ] All 3 demo timelines work
- [ ] Theme switcher functional
- [ ] Event clicks work
- [ ] Keyboard shortcuts work

### 8.4 Performance Tests
- [ ] 60fps with 1000 events
- [ ] Virtualization reduces DOM nodes
- [ ] Bundle size <150KB gzipped
- [ ] First contentful paint <1s
- [ ] Time to interactive <2s

### 8.5 Accessibility Tests
- [ ] axe-core audit passes
- [ ] Keyboard navigation complete
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast 4.5:1
- [ ] Focus indicators visible

### 8.6 Security Tests
- [ ] HTML sanitization blocks XSS
- [ ] No console errors/warnings
- [ ] Dependencies have no known vulnerabilities
- [ ] HTTPS enforced on demo site

---

## 9. Release Checklist

### Pre-Release (RC Phase)
- [ ] All Day 1-5 tasks complete
- [ ] v1.0.0-rc.1 tagged
- [ ] RC deployed to demo site
- [ ] Community testing period (3-5 days)
- [ ] Critical bugs fixed

### Release Day
- [ ] Final review of all documentation
- [ ] Update CHANGELOG.md with release date
- [ ] Tag v1.0.0
- [ ] Build and publish to npm
- [ ] Update npm dist-tags (latest → v1.0.0)
- [ ] Deploy to production (Vercel)
- [ ] Create GitHub release with notes
- [ ] Announce on social media/blog
- [ ] Update demo site with v1 announcement

### Post-Release
- [ ] Monitor npm downloads
- [ ] Monitor GitHub issues
- [ ] Respond to community feedback
- [ ] Plan v1.1.0 sprint
- [ ] Update project status in CLAUDE.md

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes cause user complaints | Medium | High | Clear migration guide, RC testing period |
| HTML sanitization breaks existing apps | Low | Medium | Document allowed tags, provide examples |
| Timeline slips beyond 5 days | Medium | Low | Focus on P0/P1 items, defer P2 if needed |
| Security vulnerability discovered | Low | Critical | Security audit on Day 4, DOMPurify integration |
| Performance regression | Low | High | Benchmark testing on Day 4 |
| Documentation gaps | Medium | Medium | Peer review all docs on Day 5 |

---

## 11. Success Metrics

### Code Quality
- ✅ TypeScript: 0 errors (strict mode)
- ✅ ESLint: 0 warnings
- ✅ Prettier: 100% formatted
- ✅ Test coverage: >80%
- ✅ Bundle size: <150KB gzipped

### Performance
- ✅ 60fps scrolling (1000 events)
- ✅ First contentful paint: <1s
- ✅ Time to interactive: <2s
- ✅ Virtualization: Renders <10% of events

### Accessibility
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation: 100% coverage
- ✅ Screen reader compatible
- ✅ Color contrast: 4.5:1 minimum

### Documentation
- ✅ All components documented
- ✅ Migration guide complete
- ✅ Breaking changes listed
- ✅ Examples for common use cases

### Community
- ✅ Demo site live and working
- ✅ npm package published
- ✅ GitHub release created
- ✅ Roadmap visible to users

---

## 12. Team Assignments

| Role | Name | Responsibilities |
|------|------|-----------------|
| **Project Lead** | [TBD] | Overall coordination, final decisions, release |
| **Senior Dev** | [TBD] | API audit, breaking changes, architecture |
| **UX Dev** | [TBD] | Theme switcher, accessibility, UX polish |
| **QA Engineer** | [TBD] | Testing, performance, quality assurance |
| **Tech Writer** | [TBD] | Documentation, migration guide, release notes |
| **Security Reviewer** | [TBD] | HTML sanitization review, security audit |

---

## 13. Communication Plan

### Internal
- Daily standup (15 min)
- End-of-day status update (Slack/Email)
- Blockers escalated immediately
- Demo at end of sprint

### External
- RC announcement on GitHub
- Community testing invitation
- Release notes on GitHub + npm
- Blog post (optional)
- Social media announcement

---

## 14. Rollback Plan

If critical issues are discovered during RC testing:

1. **Severity Assessment**: Determine if issue is blocking
2. **Fix or Defer**:
   - P0 bug → Fix immediately, delay release
   - P1 bug → Fix if possible, or defer to v1.0.1
   - P2 bug → Defer to v1.0.1
3. **Communication**: Notify community of delay
4. **New RC**: Tag new RC with fixes
5. **Re-test**: Repeat testing cycle

**Abort Criteria**:
- Security vulnerability discovered
- Data loss bug
- Complete loss of functionality

---

## 15. Next Steps After V1

### Immediate (v1.0.1)
- Bug fixes from v1.0.0 feedback
- Documentation improvements
- Minor UX tweaks

### Short-term (v1.1.0)
- Storybook integration
- Mobile-optimized layouts
- Additional themes
- Enhanced touch gestures

### Medium-term (v1.2.0)
- Export to image/PDF
- Additional painter types
- Advanced filtering UI

### Long-term (v2.0.0)
- Plugin architecture
- Breaking API improvements
- Major feature additions

---

## Appendix A: File Change List

### Files to Create
- [ ] `docs/V1_RELEASE_PLAN.md` (this file)
- [ ] `docs/MIGRATION.md`
- [ ] `docs/BREAKING_CHANGES.md`
- [ ] `docs/ROADMAP.md`
- [ ] `docs/THEMING.md`
- [ ] `docs/SECURITY.md`
- [ ] `docs/API_AUDIT.md`

### Files to Update
- [ ] `README.md`
- [ ] `CHANGELOG.md`
- [ ] `package.json`
- [ ] `src/components/LandingPage.tsx`
- [ ] `src/components/ThemeSwitcher.tsx`
- [ ] `src/components/EventBubble.tsx`
- [ ] `docs/API.md`
- [ ] `docs/EXAMPLES.md`
- [ ] `.claude/CLAUDE.md`

### Files to Review (No Changes Expected)
- [ ] `LICENSE`
- [ ] `CONTRIBUTING.md`
- [ ] All test files
- [ ] All source files (API audit)

---

## Appendix B: Commit Message Templates

```
# Day 1 commits
docs: update demo site version display to beta.3
docs: remove alpha references from installation instructions
docs: add v1 roadmap with deferred features
chore: update copyright year to 2024-2025

# Day 2 commits
docs: add API audit document
feat: implement HTML sanitization with DOMPurify
docs: start migration guide for v1
security: sanitize event descriptions to prevent XSS

# Day 3 commits
feat: add tooltips to theme switcher
feat: improve theme switcher visual feedback
docs: add theming guide
fix: accessibility violations in keyboard navigation

# Day 4 commits
test: add tests for BCE date handling
test: add tests for large datasets (2000+ events)
test: verify HTML sanitization
perf: validate 60fps with 1000 events

# Day 5 commits
docs: complete migration guide beta → v1
docs: document breaking changes for v1
docs: update README for v1 release
chore: tag v1.0.0-rc.1
```

---

## Appendix C: Resources

### Tools
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- [bundlephobia](https://bundlephobia.com/) - Bundle size analysis
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Performance profiling

### References
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

### Documentation
- Current README: [react-simile-timeline](https://github.com/thbst16/react-simile-timeline)
- Demo Site: [react-simile-timeline.vercel.app](https://react-simile-timeline.vercel.app)
- npm Package: [npmjs.com/package/react-simile-timeline](https://www.npmjs.com/package/react-simile-timeline)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Author**: Claude Code (AI Assistant)
**Approved By**: [Project Maintainer]
