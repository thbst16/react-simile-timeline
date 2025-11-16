# Migration Guide: Beta → V1.0

**Version**: Migrating from v0.1.0-beta.x to v1.0.0
**Last Updated**: 2025-11-16
**Estimated Migration Time**: 15-30 minutes

---

## Overview

This guide helps you upgrade from React Simile Timeline **v0.1.0-beta.x** to **v1.0.0 stable**.

**Good News**: V1.0 introduces minimal breaking changes and maintains backward compatibility for most features.

**Key Changes**:
- ✅ HTML sanitization (security enhancement)
- ✅ API freeze (no more breaking changes until v2.0)
- ✅ Improved documentation
- ✅ Performance optimizations

---

## Quick Start Migration

### 1. Update Package

```bash
# npm
npm install react-simile-timeline@latest

# yarn
yarn upgrade react-simile-timeline@latest

# pnpm
pnpm update react-simile-timeline@latest
```

### 2. Review Event Descriptions

If your timeline uses HTML in event descriptions, review the [HTML Sanitization](#html-sanitization) section below.

### 3. Run Your Tests

```bash
npm test
```

### 4. Verify No Console Warnings

Check browser console for deprecation warnings (there are none in v1.0, but good practice).

---

## Breaking Changes

### 1. HTML Sanitization (Security Enhancement)

**Severity**: 🔴 HIGH (Security)
**Impact**: Event descriptions containing HTML
**Action Required**: Review event descriptions

#### What Changed

Event descriptions containing HTML are now **automatically sanitized** using [DOMPurify](https://github.com/cure53/DOMPurify) to prevent XSS attacks.

#### Before (Beta)

```tsx
// Beta: HTML was rendered without sanitization (UNSAFE!)
const event = {
  title: 'My Event',
  description: '<script>alert("XSS")</script><p>Content</p>'
};
```

#### After (V1.0)

```tsx
// V1.0: Scripts are automatically stripped
const event = {
  title: 'My Event',
  description: '<script>alert("XSS")</script><p>Content</p>'
  // Rendered as: <p>Content</p>
  // Script tag removed automatically
};
```

#### Allowed HTML Tags

These tags are **safe and allowed**:

**Text Formatting**:
- `<b>`, `<i>`, `<em>`, `<strong>`, `<u>`, `<s>`, `<sup>`, `<sub>`, `<mark>`

**Links**:
- `<a href="..." target="..." rel="...">`

**Structure**:
- `<p>`, `<br>`, `<div>`, `<span>`

**Lists**:
- `<ul>`, `<ol>`, `<li>`

**Tables**:
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`

**Headers**:
- `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`

**Other**:
- `<blockquote>`, `<code>`, `<pre>`, `<hr>`

#### Blocked Content

These are **automatically removed**:

**Scripts and Dangerous Tags**:
- `<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`

**Event Handlers**:
- `onclick`, `onerror`, `onload`, `onmouseover`, etc.

**Dangerous URLs**:
- `javascript:`, `data:`, `vbscript:`

**Forms** (for security):
- `<form>`, `<input>`, `<button>`, `<textarea>`, `<select>`

#### Migration Steps

1. **Review Event Data**: Check if you use HTML in event descriptions
   ```tsx
   // Search your event data for HTML tags
   events.filter(e => e.description?.includes('<'))
   ```

2. **Test Sanitization**: Verify allowed tags still work
   ```tsx
   const testEvent = {
     title: 'Test',
     description: '<p>This <b>works</b></p><script>alert(1)</script>'
   };
   // Renders as: <p>This <b>works</b></p>
   // Script removed ✓
   ```

3. **Replace Blocked Tags**: If you used forms or scripts, use alternatives
   ```tsx
   // Before (blocked):
   description: '<button onclick="doSomething()">Click</button>'

   // After (use onEventClick prop):
   <Timeline
     data={events}
     onEventClick={(event) => handleEventClick(event)}
   />
   ```

#### Why This Change?

- **Security**: Prevents XSS attacks from malicious event data
- **Best Practice**: Industry standard for user-generated content
- **No Impact**: Most users don't use scripts in descriptions

See [SECURITY.md](./SECURITY.md) for detailed sanitization documentation.

---

## Non-Breaking Changes

### 1. API Stability

All public APIs are now **frozen until v2.0**. This includes:

- ✅ Component props (Timeline, Band, EventBubble)
- ✅ Hook signatures (useTheme, useKeyboardNav, etc.)
- ✅ Type definitions (TimelineEvent, BandConfig, etc.)
- ✅ Painter interfaces (OriginalPainter, CompactPainter, OverviewPainter)

**What This Means**:
- Your code will continue to work in all v1.x releases
- New features will be added as optional props
- No surprises or breaking changes

### 2. Performance Improvements

V1.0 includes several performance optimizations:

- ⚡ **Bundle Size**: 50.96 KB gzipped (66% under 150KB target)
- ⚡ **60fps Scrolling**: Maintained with 1000+ events
- ⚡ **Virtualization**: Automatic for large datasets
- ⚡ **Render Optimization**: Memoized expensive calculations

**No Action Required** - These improvements are automatic.

### 3. Theme Enhancements

New theme features (backward compatible):

```tsx
// Classic Vintage theme (new)
import { ThemeSwitcher } from 'react-simile-timeline';

<ThemeSwitcher />

// Themes available:
// - 'light' (Classic Vintage)
// - 'dark' (Dark Mode)
// - 'auto' (System Preference)
```

**Migration**: No changes needed. Your existing themes continue to work.

### 4. Accessibility Improvements

- ✅ WCAG 2.1 AA compliant
- ✅ Improved keyboard navigation
- ✅ Better screen reader support
- ✅ Enhanced focus management

**No Action Required** - Improvements are automatic.

---

## Deprecated Features

**None** - V1.0 introduces no deprecations.

Future deprecations will follow this process:
1. Announced in minor version (v1.x)
2. Console warnings added
3. Removed in v2.0 (minimum 6 months notice)

---

## New Features in V1.0

### 1. HTML Sanitization

See [Breaking Changes](#html-sanitization) above.

### 2. Frozen API

All APIs are stable and documented. See [API.md](../project/API.md).

### 3. Performance Monitoring

Built-in performance hooks:

```tsx
import { usePerformanceMonitor } from 'react-simile-timeline';

const perf = usePerformanceMonitor({ targetFps: 60 });

// Display metrics
<div>FPS: {perf.metrics.fps}</div>
```

### 4. Theme System

Enhanced theme support:

```tsx
import { useTheme, ThemeProvider } from 'react-simile-timeline';

// Wrap your app
<ThemeProvider>
  <Timeline data={events} bands={bands} />
</ThemeProvider>

// Use theme in components
const { theme, mode, setMode } = useTheme();
```

### 5. Panning Bounds

Prevents scrolling into empty space:

```tsx
// Automatic in v1.0
<Timeline
  data={events}
  bands={bands}
  // Panning bounds enabled by default
/>
```

---

## Testing Your Migration

### 1. Run Test Suite

```bash
npm test
```

### 2. Visual Testing

Check these scenarios:

- ✅ Events render correctly
- ✅ HTML in descriptions displays safely
- ✅ Themes switch properly
- ✅ No console errors/warnings
- ✅ Performance is smooth (60fps)

### 3. Accessibility Testing

```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run accessibility audit
# (Built-in: useAccessibility hook)
```

### 4. Browser Testing

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## Rollback Plan

If you encounter issues, you can rollback:

```bash
# Rollback to latest beta
npm install react-simile-timeline@beta

# Or specific beta version
npm install react-simile-timeline@0.1.0-beta.1
```

**Report Issues**: [GitHub Issues](https://github.com/thbst16/react-simile-timeline/issues)

---

## Common Migration Issues

### Issue 1: Scripts Not Executing

**Problem**: Event descriptions with `<script>` tags don't work

**Cause**: HTML sanitization removes scripts (security feature)

**Solution**: Use event callbacks instead
```tsx
<Timeline
  onEventClick={(event) => {
    // Your custom logic here
    console.log('Event clicked:', event);
  }}
/>
```

### Issue 2: Styles Not Applied

**Problem**: Inline styles in event descriptions removed

**Cause**: Sanitization removes `style` attributes

**Solution**: Use CSS classes instead
```tsx
// Before (removed):
description: '<div style="color: red;">Text</div>'

// After (works):
description: '<div class="text-red">Text</div>'
// Add CSS class to your stylesheet
```

### Issue 3: Forms Not Working

**Problem**: Forms in event descriptions don't render

**Cause**: Form elements blocked for security

**Solution**: Use custom event bubbles
```tsx
// Create custom event bubble component
const CustomBubble = ({ event, onClose }) => (
  <div>
    <h3>{event.title}</h3>
    {/* Your custom form here */}
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  </div>
);

// Use with Timeline
<Timeline
  customBubble={CustomBubble}
  // ...
/>
```

---

## Version Comparison Table

| Feature | Beta | V1.0 | Notes |
|---------|------|------|-------|
| **HTML Sanitization** | ❌ None | ✅ DOMPurify | Breaking change |
| **API Stability** | ⚠️ May change | ✅ Frozen | No breaking changes until v2.0 |
| **Bundle Size** | 40.6 KB | 50.9 KB | Slightly larger (DOMPurify added) |
| **Performance** | 60fps | 60fps | Maintained |
| **Test Coverage** | 80% | 80%+ | Maintained |
| **Accessibility** | WCAG AA | WCAG AA | Maintained |
| **Themes** | 2 | 3 | Classic Vintage added |
| **Documentation** | Basic | Complete | Migration, API, Security guides |

---

## Getting Help

### Documentation

- **API Reference**: [API.md](../project/API.md)
- **Security Guide**: [SECURITY.md](./SECURITY.md)
- **Theme Guide**: [THEMING.md](./THEMING.md)
- **Breaking Changes**: [BREAKING_CHANGES.md](./BREAKING_CHANGES.md)
- **Roadmap**: [ROADMAP.md](./ROADMAP.md)

### Community

- **GitHub Issues**: [Report Bugs](https://github.com/thbst16/react-simile-timeline/issues)
- **GitHub Discussions**: [Ask Questions](https://github.com/thbst16/react-simile-timeline/discussions)
- **Examples**: [Demo Site](https://react-simile-timeline.vercel.app)

### Support

For commercial support or custom features, contact the maintainers.

---

## Upgrade Checklist

Use this checklist to track your migration:

- [ ] Updated to v1.0.0
- [ ] Reviewed event descriptions for HTML content
- [ ] Tested HTML sanitization with sample data
- [ ] Ran test suite (all passing)
- [ ] Checked browser console (no errors)
- [ ] Verified performance (60fps maintained)
- [ ] Tested accessibility (keyboard nav, screen readers)
- [ ] Updated documentation/comments
- [ ] Deployed to staging environment
- [ ] Monitored for issues
- [ ] Deployed to production

---

## Timeline

```
Beta.1 (Nov 2025)
  ↓
Beta.2-3 (Future)
  ↓
V1.0.0-rc.1 (This Week)  ← You are here
  ↓
V1.0.0 (7-10 days)
  ↓
V1.1.0 (Q1 2026)
  ↓
V2.0.0 (Q4 2026)
```

---

## Feedback

We'd love to hear about your migration experience!

- ⭐ **GitHub Stars**: [Star the repo](https://github.com/thbst16/react-simile-timeline)
- 💬 **Discussions**: [Share feedback](https://github.com/thbst16/react-simile-timeline/discussions)
- 🐛 **Issues**: [Report problems](https://github.com/thbst16/react-simile-timeline/issues)

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Maintainer**: React Simile Timeline Team
