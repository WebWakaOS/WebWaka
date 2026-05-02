/**
 * AIInsightWidget tests — Wave 3 A7-1
 * Uses lightweight React element introspection (no jsdom/DOM required).
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AIInsightWidget } from './AIInsightWidget.js';

/** Recursively stringify a React element tree for text-based assertions */
function stringify(el: unknown): string {
  if (el == null || typeof el === 'boolean') return '';
  if (typeof el === 'string' || typeof el === 'number') return String(el);
  if (Array.isArray(el)) return el.map(stringify).join('');
  const e = el as React.ReactElement<Record<string, unknown>>;
  if (!e.props) return '';
  const tag = typeof e.type === 'string' ? e.type : 'comp';
  const cls = e.props.className ? ` class="${e.props.className as string}"` : '';
  const role = e.props.role ? ` role="${e.props.role as string}"` : '';
  const data = e.props['data-capability'] ? ` data-capability="${e.props['data-capability'] as string}"` : '';
  const children = stringify(e.props.children);
  return `<${tag}${cls}${role}${data}>${children}</${tag}>`;
}

describe('AIInsightWidget (A7-1)', () => {
  describe('loading state', () => {
    it('renders role=status', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio', loading: true,
      }));
      expect(html).toContain('role="status"');
    });

    it('does not render Apply button when loading', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio', loading: true, onApply: vi.fn(),
      }));
      expect(html).not.toContain('Apply suggestion');
    });
  });

  describe('error state', () => {
    it('renders role=alert with error message', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'inventory_ai', title: 'Reorder', error: 'AI unavailable',
      }));
      expect(html).toContain('role="alert"');
      expect(html).toContain('AI unavailable');
    });

    it('renders Try again button when onRetry provided', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'inventory_ai', title: 'Reorder', error: 'Oops', onRetry: vi.fn(),
      }));
      expect(html).toContain('Try again');
    });
  });

  describe('content state', () => {
    it('renders content text', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio', content: 'A great bakery since 2005.',
      }));
      expect(html).toContain('A great bakery since 2005.');
    });

    it('renders Apply suggestion button when onApply + content provided', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio', content: 'Some bio', onApply: vi.fn(),
      }));
      expect(html).toContain('Apply suggestion');
    });

    it('renders capability badge', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'shift_summary_ai', title: 'Summary', content: 'All good.',
      }));
      expect(html).toContain('shift_summary_ai');
    });

    it('calls onApply callback', () => {
      const onApply = vi.fn();
      const el = React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio', content: 'Bio text', onApply,
      });
      (el.props as { onApply: (c: string) => void }).onApply('Bio text');
      expect(onApply).toHaveBeenCalledWith('Bio text');
    });
  });

  describe('variants', () => {
    it('suggestion variant uses blue border', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio', content: 'x', variant: 'suggestion',
      }));
      expect(html).toContain('border-blue-200');
    });

    it('warning variant uses amber border', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'inventory_ai', title: 'Low Stock', content: 'x', variant: 'warning',
      }));
      expect(html).toContain('border-amber-200');
    });

    it('info variant uses indigo border', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'shift_summary_ai', title: 'Summary', content: 'x', variant: 'info',
      }));
      expect(html).toContain('border-indigo-200');
    });
  });

  describe('no suggestion available', () => {
    it('renders fallback text when content is undefined', () => {
      const html = stringify(React.createElement(AIInsightWidget, {
        capability: 'bio_generator', title: 'Bio',
      }));
      expect(html).toContain('No suggestion available');
    });
  });
});
