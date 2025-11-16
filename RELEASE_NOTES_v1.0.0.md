# React Simile Timeline v1.0.0 - First Stable Release 🎉

**Release Date**: November 16, 2025
**npm**: https://www.npmjs.com/package/react-simile-timeline
**Demo**: https://react-simile-timeline.vercel.app

---

## 🎉 First Stable Release

This is the **first stable release** of React Simile Timeline. The API is now frozen and will remain backward compatible through all 1.x versions. No breaking changes will be introduced until v2.0.0.

---

## 🔒 Security

### HTML Sanitization
Event descriptions containing HTML are now automatically sanitized using [DOMPurify](https://github.com/cure53/DOMPurify) to prevent XSS attacks.

**Allowed tags**: Text formatting (b, i, em, strong, etc.), links, structure (p, div, span), lists, tables, headers, code blocks

**Blocked content**: Scripts, iframes, event handlers, dangerous URLs (javascript:, data:, vbscript:)

**Features**:
- Smart URL validation with regex pattern matching
- Memoized sanitization for optimal performance
- Comprehensive test coverage (467 lines of tests)

---

## 📚 Documentation

New comprehensive documentation guides:

- **[MIGRATION.md](docs/MIGRATION.md)** (491 lines): Complete beta → v1.0 upgrade guide
  - Quick start migration steps
  - Detailed breaking changes documentation
  - Migration impact by use case
  - Upgrade checklist and timeline

- **[BREAKING_CHANGES.md](docs/BREAKING_CHANGES.md)** (605 lines): HTML sanitization documentation
  - Comprehensive allowed/blocked tags reference
  - Security rationale and best practices
  - Migration examples for common scenarios

- **[SECURITY.md](docs/SECURITY.md)** (681 lines): Security documentation and XSS prevention
  - DOMPurify configuration details
  - Attack vectors and prevention strategies
  - Vulnerability reporting process

- **[THEMING.md](docs/THEMING.md)** (992 lines): Complete theming guide and API reference
  - Built-in themes documentation
  - Custom theme creation tutorial
  - Accessibility guidelines

**Total**: 2,769 lines of comprehensive documentation

---

## 🔐 API Stability

All public APIs are now **frozen until v2.0.0**:

- ✅ Component props (Timeline, Band, EventBubble)
- ✅ Hook signatures (useTheme, useKeyboardNav, etc.)
- ✅ Type definitions (TimelineEvent, BandConfig, etc.)
- ✅ Painter interfaces (OriginalPainter, CompactPainter, OverviewPainter)

**What this means**: Your code will continue to work in all v1.x releases without breaking changes.

---

## ⚡ Performance

- **Bundle size**: 50.98 KB gzipped (66% under 150KB target)
- **Scrolling**: 60fps maintained with 1000+ events
- **Sanitization**: Memoized for optimal performance
- **Rendering**: Efficient event layout with virtualization

---

## ✅ Testing

- **399/399 tests passing** (100% pass rate)
- **Comprehensive sanitization test suite** (467 lines)
  - XSS prevention tests (script injection, event handlers, dangerous URLs)
  - Allowed HTML tag verification
  - Edge case handling (empty content, unicode, HTML entities)
  - Performance and regression tests

---

## 🚨 Breaking Changes

### HTML Sanitization

Event descriptions containing HTML will be automatically sanitized. This may affect:

- **Scripts**: `<script>` tags removed → Use `onEventClick` prop instead
- **Event Handlers**: `onclick`, `onerror` removed → Use React event handlers
- **Forms**: Form elements blocked → Use custom event bubbles
- **Styles**: Inline styles removed → Use CSS classes instead

**Migration Guide**: See [MIGRATION.md](docs/MIGRATION.md) and [BREAKING_CHANGES.md](docs/BREAKING_CHANGES.md) for complete migration instructions.

---

## 📊 Quality Metrics

- ✅ **TypeScript**: Strict mode, 0 errors
- ✅ **ESLint**: 0 warnings
- ✅ **Prettier**: All files formatted
- ✅ **Tests**: 399/399 passing
- ✅ **Build**: Success
- ✅ **Accessibility**: WCAG 2.1 AA compliant
- ✅ **Backward Compatibility**: Beta releases upgrade seamlessly (except sanitization)

---

## 📦 Installation

```bash
# npm
npm install react-simile-timeline

# yarn
yarn add react-simile-timeline

# pnpm
pnpm add react-simile-timeline
```

---

## 🔄 Upgrading from Beta

```bash
# Update to latest version
npm install react-simile-timeline@latest
```

**Migration steps**:
1. Review event descriptions for HTML content
2. Test HTML sanitization with your data
3. Run your test suite
4. Check browser console for warnings

See [MIGRATION.md](docs/MIGRATION.md) for detailed upgrade instructions.

---

## 🎯 What's Next

**v1.x Roadmap** (No breaking changes):
- Storybook integration
- Additional painter types
- Enhanced touch gesture support
- Mobile-optimized layouts
- Additional theme presets
- Plugin architecture for custom painters

**v2.0** (Future, with breaking changes):
- Planned for Q4 2026
- Will include deprecation notices in v1.x releases
- Minimum 6 months notice before removal

See [ROADMAP.md](docs/ROADMAP.md) for complete roadmap.

---

## 🙏 Acknowledgments

Thanks to everyone who tested the beta releases and provided feedback!

---

## 📝 Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

**Questions or Issues?**
- 📖 Documentation: https://github.com/thbst16/react-simile-timeline/tree/main/docs
- 🐛 Report Issues: https://github.com/thbst16/react-simile-timeline/issues
- 💬 Discussions: https://github.com/thbst16/react-simile-timeline/discussions
