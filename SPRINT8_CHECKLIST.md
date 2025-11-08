# Sprint 8: Publication Prep - Step-by-Step Checklist

**Repository**: react-simile-timeline
**Target**: v0.1.0-alpha on npm
**Status**: In Progress (Step 1 Complete)

---

## Phase 1: Local Preparation

### ✅ Step 1: Create New Directory Structure
**Status**: COMPLETE
**Location**: `/Users/thomasbeck/Documents/Code/react-simile-timeline/`

- [x] Create `react-simile-timeline` directory
- [x] Copy `/project/*` contents to root
- [x] Copy `LICENSE` file
- [x] Verify structure (92 files, 290MB with node_modules)
- [x] Confirm no `.claude/` or planning docs included

---

### ⏳ Step 2: Update package.json
**Status**: PENDING

Tasks:
- [ ] Change package name to `react-simile-timeline`
- [ ] Update repository URLs (set to new GitHub location)
- [ ] Add `files` field to control npm publish contents
- [ ] Update `author`, `keywords`, `description`
- [ ] Set `main`, `module`, `types` fields correctly
- [ ] Verify `scripts` work from root
- [ ] Add repository metadata

**Review Point**: Verify package.json metadata is correct

---

### ⏳ Step 3: Verify No Development Artifacts
**Status**: PENDING

Tasks:
- [ ] Confirm `.claude/` NOT present
- [ ] Confirm no `docs/PRD.md`, `docs/SPRINT_PLAN.md`, `docs/TECH_STACK.md`
- [ ] Verify only production-ready code exists
- [ ] Check for any leftover test files or debug scripts

**Review Point**: Final check that directory is clean

---

## Phase 2: Documentation

### ⏳ Step 4: Create CHANGELOG.md
**Status**: PENDING

Tasks:
- [ ] Use Keep a Changelog format
- [ ] Document Sprint 1: Core Infrastructure
- [ ] Document Sprint 2: Core Rendering
- [ ] Document Sprint 3: Interactions & Events
- [ ] Document Sprint 4: Polish & Refinement
- [ ] Document Sprint 5: Performance (partial)
- [ ] Document Sprint 7: Complete Sprint 5 & Polish
- [ ] Note known limitations
- [ ] Add alpha release warnings
- [ ] Include future roadmap section

**Review Point**: Review changelog content

---

### ⏳ Step 5: Create CONTRIBUTING.md
**Status**: PENDING

Tasks:
- [ ] Development setup instructions
- [ ] Code style guidelines (TypeScript strict, ESLint)
- [ ] Testing requirements (80% coverage)
- [ ] PR submission process
- [ ] Code of Conduct (Contributor Covenant)
- [ ] How to report bugs
- [ ] How to request features

**Review Point**: Review contributor guidelines

---

### ⏳ Step 6: Create User Documentation
**Status**: PENDING (docs already exist from previous sprints)

Tasks:
- [x] `docs/API.md` - Already exists
- [x] `docs/EXAMPLES.md` - Already exists
- [x] `docs/MIGRATION.md` - Already exists
- [x] `docs/PERFORMANCE.md` - Already exists
- [ ] Review and update if needed
- [ ] Ensure all are current and accurate

**Review Point**: Review all documentation for accuracy

---

### ⏳ Step 7: Update README.md
**Status**: PENDING

Tasks:
- [ ] Add installation instructions (`npm install react-simile-timeline`)
- [ ] Add quick start example
- [ ] Add feature highlights (virtualization, themes, accessibility)
- [ ] Add links to documentation
- [ ] Add badges (build status, npm version, license)
- [ ] Add live demo link (after Step 13)
- [ ] Add screenshots/GIFs

**Review Point**: Review README content

---

## Phase 3: CI/CD & Testing

### ⏳ Step 8: Create GitHub Actions Workflows
**Status**: PENDING

Tasks:
- [ ] Create `.github/workflows/ci.yml`:
  - [ ] Run tests on PR
  - [ ] Run build verification
  - [ ] Check bundle size (<150KB gzipped)
  - [ ] Run ESLint
  - [ ] Check TypeScript compilation
  - [ ] Test coverage check (80% minimum)
- [ ] Create `.github/workflows/release.yml`:
  - [ ] Automated npm publish on tag
  - [ ] GitHub release creation
  - [ ] Changelog generation
- [ ] Create `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] Create `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`

**Review Point**: Review CI/CD configuration

---

### ⏳ Step 9: Local Verification
**Status**: PENDING

Tasks:
- [ ] Run `npm install`
- [ ] Run `npm run dev` (verify dev server works)
- [ ] Run `npm run build` (verify build succeeds)
- [ ] Run `npm run test` (verify all tests pass)
- [ ] Run `npm run lint` (verify no lint errors)
- [ ] Check build output size

**Review Point**: Confirm all scripts work correctly

---

### ⏳ Step 10: Test Package Installation
**Status**: PENDING

Tasks:
- [ ] Run `npm pack` to create tarball
- [ ] Inspect tarball contents (`tar -tzf react-simile-timeline-*.tgz`)
- [ ] Create test project in separate directory
- [ ] Install tarball: `npm install /path/to/tarball`
- [ ] Test import: `import { Timeline } from 'react-simile-timeline'`
- [ ] Verify TypeScript types work
- [ ] Test tree-shaking

**Review Point**: Confirm package works when installed externally

---

## Phase 4: Publication

### ⏳ Step 11: Create GitHub Repository
**Status**: PENDING

Tasks:
- [ ] Create new repo on GitHub: `react-simile-timeline`
- [ ] Set repository description
- [ ] Add topics/tags (react, typescript, timeline, visualization)
- [ ] Set MIT license in GitHub settings
- [ ] Configure issues, discussions settings
- [ ] Add `.gitignore` file

**Review Point**: Confirm repo settings are correct

---

### ⏳ Step 12: Initialize Git & Push
**Status**: PENDING

Tasks:
- [ ] `git init` in react-simile-timeline directory
- [ ] Create initial commit with all files
- [ ] Add remote: `git remote add origin git@github.com:username/react-simile-timeline.git`
- [ ] Push: `git push -u origin main`
- [ ] Verify all files pushed correctly

**Review Point**: Verify GitHub repo looks correct online

---

### ⏳ Step 13: Deploy Demo
**Status**: PENDING

Choose platform:
- [ ] Option A: Vercel
- [ ] Option B: Netlify
- [ ] Option C: GitHub Pages

Tasks:
- [ ] Deploy Sprint5PerformanceDemo
- [ ] Configure build settings
- [ ] Verify demo is accessible
- [ ] Update README with live demo link
- [ ] Update GitHub repo description with demo link

**Review Point**: Test live demo functionality

---

### ⏳ Step 14: Create Release Draft
**Status**: PENDING

Tasks:
- [ ] Go to GitHub Releases
- [ ] Draft new release: v0.1.0-alpha
- [ ] Add release notes:
  - [ ] Feature highlights (all sprints)
  - [ ] Known limitations
  - [ ] Alpha warnings
  - [ ] Migration notes
- [ ] Add screenshots/GIFs
- [ ] Mark as pre-release
- [ ] Save as draft (don't publish yet)

**Review Point**: Review release notes

---

### ⏳ Step 15: Final Pre-Publish Check
**Status**: PENDING

Tasks:
- [ ] All CI checks passing
- [ ] Documentation complete
- [ ] Demo accessible
- [ ] npm package tested locally
- [ ] Release notes ready
- [ ] Team/stakeholder review (if applicable)
- [ ] Decision: Go/No-Go for npm publish

**Commands for publishing:**
```bash
npm run build
npm run test:coverage
npm pack --dry-run
npm publish --tag alpha
git tag v0.1.0-alpha
git push --tags
```

**Review Point**: Final approval before npm publish

---

## Progress Summary

- **Completed**: 1/15 steps (6.7%)
- **Current**: Step 1 ✅
- **Next**: Step 2 - Update package.json
- **Estimated Time Remaining**: 2-3 days

---

## Notes

- This checklist can be resumed at any time
- Current working directory: `/Users/thomasbeck/Documents/Code/react-simile-timeline/`
- Original development repo: `/Users/thomasbeck/Documents/Code/reactjs-simile-timeline-conversion/`
- All steps require review/approval before proceeding to next step

---

**Last Updated**: 2025-11-07
**Updated By**: Claude Code (Sprint 8 Execution)
