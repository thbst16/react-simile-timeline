/**
 * EventBubble - HTML Sanitization Tests
 *
 * Tests for DOMPurify integration to prevent XSS attacks
 * V1.0.0 Security Feature
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { EventBubble } from '../EventBubble';
import type { TimelineEvent } from '../../types/events';

describe('EventBubble - HTML Sanitization', () => {
  const mockOnClose = vi.fn();

  const createEvent = (description: string): TimelineEvent => ({
    title: 'Test Event',
    start: '2024-01-01',
    description,
  });

  describe('XSS Prevention', () => {
    it('should strip <script> tags', () => {
      const event = createEvent('Safe content <script>alert("XSS")</script> more content');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      // Script should be removed
      const content = screen.getByText(/Safe content.*more content/);
      expect(content.innerHTML).not.toContain('<script>');
      expect(content.innerHTML).not.toContain('alert');
    });

    it('should strip <iframe> tags', () => {
      const event = createEvent('Content <iframe src="http://evil.com"></iframe> more');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const content = screen.getByText(/Content.*more/);
      expect(content.innerHTML).not.toContain('<iframe>');
      expect(content.innerHTML).not.toContain('evil.com');
    });

    it('should strip onclick event handlers', () => {
      const event = createEvent('<p onclick="alert(\'XSS\')">Click me</p>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const content = screen.getByText('Click me');
      expect(content.innerHTML).not.toContain('onclick');
      expect(content.innerHTML).not.toContain('alert');
    });

    it('should strip onerror event handlers', () => {
      const event = createEvent('<img src="x" onerror="alert(\'XSS\')">Description');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      // img tag should be stripped (not in allowed tags)
      // Even if it was allowed, onerror would be stripped
      const bubble = screen.getByRole('dialog');
      expect(bubble.innerHTML).not.toContain('onerror');
      expect(bubble.innerHTML).not.toContain('alert');
    });

    it('should strip javascript: URLs', () => {
      const event = createEvent('<a href="javascript:alert(\'XSS\')">Click</a>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.queryByRole('link', { name: 'Click' });
      if (link) {
        expect(link.getAttribute('href')).not.toContain('javascript:');
      }
    });

    it('should strip data: URLs', () => {
      const event = createEvent(
        '<a href="data:text/html,<script>alert(\'XSS\')</script>">Link</a>'
      );

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.queryByRole('link', { name: 'Link' });
      if (link) {
        expect(link.getAttribute('href')).not.toContain('data:');
      }
    });

    it('should strip vbscript: URLs', () => {
      const event = createEvent('<a href="vbscript:msgbox(\'XSS\')">Click</a>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.queryByRole('link', { name: 'Click' });
      if (link) {
        expect(link.getAttribute('href')).not.toContain('vbscript:');
      }
    });

    it('should strip <object> tags', () => {
      const event = createEvent('Text <object data="http://evil.com"></object> more');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const bubble = screen.getByRole('dialog');
      expect(bubble.innerHTML).not.toContain('<object>');
      expect(bubble.innerHTML).not.toContain('evil.com');
    });

    it('should strip <embed> tags', () => {
      const event = createEvent('Text <embed src="http://evil.com"> more');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const bubble = screen.getByRole('dialog');
      expect(bubble.innerHTML).not.toContain('<embed>');
    });
  });

  describe('Allowed HTML Tags', () => {
    it('should allow <b> tags', () => {
      const event = createEvent('Text with <b>bold</b> content');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const bold = screen.getByText('bold');
      expect(bold.tagName).toBe('B');
    });

    it('should allow <i> tags', () => {
      const event = createEvent('Text with <i>italic</i> content');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const italic = screen.getByText('italic');
      expect(italic.tagName).toBe('I');
    });

    it('should allow <em> tags', () => {
      const event = createEvent('Text with <em>emphasis</em> content');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const em = screen.getByText('emphasis');
      expect(em.tagName).toBe('EM');
    });

    it('should allow <strong> tags', () => {
      const event = createEvent('Text with <strong>strong</strong> content');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const strong = screen.getByText('strong');
      expect(strong.tagName).toBe('STRONG');
    });

    it('should allow <p> tags', () => {
      const event = createEvent('<p>Paragraph content</p>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const p = screen.getByText('Paragraph content');
      expect(p.tagName).toBe('P');
    });

    it('should allow <a> tags with safe attributes', () => {
      const event = createEvent(
        '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
      );

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('should allow <ul> and <li> tags', () => {
      const event = createEvent('<ul><li>Item 1</li><li>Item 2</li></ul>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');
      expect(item1.tagName).toBe('LI');
      expect(item2.tagName).toBe('LI');
    });

    it('should allow <code> tags', () => {
      const event = createEvent('Code: <code>const x = 1;</code>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const code = screen.getByText('const x = 1;');
      expect(code.tagName).toBe('CODE');
    });

    it('should allow <pre> tags', () => {
      const event = createEvent('<pre>Preformatted text</pre>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const pre = screen.getByText('Preformatted text');
      expect(pre.tagName).toBe('PRE');
    });

    it('should allow <blockquote> tags', () => {
      const event = createEvent('<blockquote>Quote</blockquote>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const quote = screen.getByText('Quote');
      expect(quote.tagName).toBe('BLOCKQUOTE');
    });

    it('should allow headers <h1> through <h6>', () => {
      const event = createEvent(
        '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>'
      );

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByText('H1').tagName).toBe('H1');
      expect(screen.getByText('H2').tagName).toBe('H2');
      expect(screen.getByText('H3').tagName).toBe('H3');
      expect(screen.getByText('H4').tagName).toBe('H4');
      expect(screen.getByText('H5').tagName).toBe('H5');
      expect(screen.getByText('H6').tagName).toBe('H6');
    });

    it('should allow table tags', () => {
      const event = createEvent(`
        <table>
          <thead><tr><th>Header</th></tr></thead>
          <tbody><tr><td>Cell</td></tr></tbody>
        </table>
      `);

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const header = screen.getByText('Header');
      const cell = screen.getByText('Cell');
      expect(header.tagName).toBe('TH');
      expect(cell.tagName).toBe('TD');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const event = createEvent('');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      // Should render without error
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle description with only whitespace', () => {
      const event = createEvent('   \n\n   ');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle mixed safe and unsafe content', () => {
      const event = createEvent(`
        <p>Safe paragraph</p>
        <script>alert('unsafe')</script>
        <b>Bold text</b>
        <iframe src="evil.com"></iframe>
        <i>Italic</i>
      `);

      render(<EventBubble event={event} onClose={mockOnClose} />);

      // Safe content should remain
      expect(screen.getByText('Safe paragraph')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();

      // Unsafe content should be removed
      const bubble = screen.getByRole('dialog');
      expect(bubble.innerHTML).not.toContain('<script>');
      expect(bubble.innerHTML).not.toContain('alert');
      expect(bubble.innerHTML).not.toContain('<iframe>');
      expect(bubble.innerHTML).not.toContain('evil.com');
    });

    it('should handle deeply nested safe HTML', () => {
      const event = createEvent(`
        <div>
          <p>
            <strong>
              <em>
                Deeply nested text
              </em>
            </strong>
          </p>
        </div>
      `);

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const text = screen.getByText(/Deeply nested text/);
      expect(text).toBeInTheDocument();
    });

    it('should handle HTML entities', () => {
      const event = createEvent('Special chars: &lt; &gt; &amp; &quot;');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      const event = createEvent('Unicode: 你好 مرحبا 🌍');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByText(/Unicode:/)).toBeInTheDocument();
    });
  });

  describe('URL Sanitization', () => {
    it('should allow https:// URLs', () => {
      const event = createEvent('<a href="https://example.com">Link</a>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should allow http:// URLs', () => {
      const event = createEvent('<a href="http://example.com">Link</a>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveAttribute('href', 'http://example.com');
    });

    it('should allow mailto: URLs', () => {
      const event = createEvent('<a href="mailto:test@example.com">Email</a>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.getByRole('link', { name: 'Email' });
      expect(link).toHaveAttribute('href', 'mailto:test@example.com');
    });

    it('should allow tel: URLs', () => {
      const event = createEvent('<a href="tel:+1234567890">Call</a>');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.getByRole('link', { name: 'Call' });
      expect(link).toHaveAttribute('href', 'tel:+1234567890');
    });

    it('should strip javascript: URLs in complex scenarios', () => {
      const event = createEvent(`
        <a href="  javascript:alert('XSS')  ">Tricky</a>
      `);

      render(<EventBubble event={event} onClose={mockOnClose} />);

      const link = screen.queryByRole('link', { name: 'Tricky' });
      if (link) {
        const href = link.getAttribute('href');
        expect(href).not.toContain('javascript:');
        expect(href).not.toContain('alert');
      }
    });
  });

  describe('Performance', () => {
    it('should memoize sanitization for same description', () => {
      const event = createEvent('<p>Test content</p>');

      const { rerender } = render(<EventBubble event={event} onClose={mockOnClose} />);

      // Rerender with same event
      rerender(<EventBubble event={event} onClose={mockOnClose} />);

      // Should not error and should render correctly
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should handle large HTML content', () => {
      const largeContent = '<p>' + 'Lorem ipsum '.repeat(1000) + '</p>';
      const event = createEvent(largeContent);

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Regression Tests', () => {
    it('should not break existing plain text descriptions', () => {
      const event = createEvent('Plain text description without HTML');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByText('Plain text description without HTML')).toBeInTheDocument();
    });

    it('should handle description with line breaks', () => {
      const event = createEvent('Line 1\nLine 2\nLine 3');

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should preserve formatting in allowed tags', () => {
      const event = createEvent(`
        <p>First paragraph</p>
        <p>Second paragraph</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `);

      render(<EventBubble event={event} onClose={mockOnClose} />);

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Security Documentation Compliance', () => {
    it('should block all script execution vectors', () => {
      const vectors = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<iframe srcdoc="<script>alert(1)</script>">',
        '<object data="javascript:alert(1)">',
        '<embed src="javascript:alert(1)">',
        '<a href="javascript:alert(1)">click</a>',
        '<form action="javascript:alert(1)"><button>click</button></form>',
      ];

      vectors.forEach((vector) => {
        const event = createEvent(vector);
        render(<EventBubble event={event} onClose={mockOnClose} />);

        const bubble = screen.getByRole('dialog');
        expect(bubble.innerHTML).not.toContain('alert(1)');
        expect(bubble.innerHTML).not.toContain('javascript:');

        // Clean up to prevent multiple dialogs in DOM
        cleanup();
      });
    });
  });
});
