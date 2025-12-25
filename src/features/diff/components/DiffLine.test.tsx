import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/helpers';
import { DiffLine } from './DiffLine';
import type { ParsedDiffLine } from '../types';

// Mock react-syntax-highlighter - factory must use inline function
vi.mock('react-syntax-highlighter', async () => {
  const React = await import('react');
  const MockComponent = ({ children }: { children: string }) =>
    React.createElement('span', { 'data-testid': 'syntax-highlighter' }, children);
  MockComponent.registerLanguage = vi.fn();
  return { Light: MockComponent };
});

// Mock language imports
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/typescript', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/javascript', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/python', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/json', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/css', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/xml', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/bash', () => ({ default: {} }));
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/markdown', () => ({ default: {} }));

describe('DiffLine', () => {
  it('renders header line', () => {
    const line: ParsedDiffLine = {
      type: 'header',
      content: '@@ -1,3 +1,4 @@',
      oldLineNumber: null,
      newLineNumber: null,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByText('@@ -1,3 +1,4 @@')).toBeInTheDocument();
  });

  it('renders addition line with new line number', () => {
    const line: ParsedDiffLine = {
      type: 'addition',
      content: 'const foo = "bar";',
      oldLineNumber: null,
      newLineNumber: 5,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('const foo = "bar";')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('renders deletion line with old line number', () => {
    const line: ParsedDiffLine = {
      type: 'deletion',
      content: 'const old = "removed";',
      oldLineNumber: 3,
      newLineNumber: null,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
  });

  it('renders context line with both line numbers', () => {
    const line: ParsedDiffLine = {
      type: 'context',
      content: 'unchanged line',
      oldLineNumber: 10,
      newLineNumber: 12,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('unchanged line')).toBeInTheDocument();
  });

  it('has screen reader accessible text for addition', () => {
    const line: ParsedDiffLine = {
      type: 'addition',
      content: 'new line',
      oldLineNumber: null,
      newLineNumber: 1,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByText('Added:')).toBeInTheDocument();
  });

  it('has screen reader accessible text for deletion', () => {
    const line: ParsedDiffLine = {
      type: 'deletion',
      content: 'old line',
      oldLineNumber: 1,
      newLineNumber: null,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByText('Deleted:')).toBeInTheDocument();
  });

  it('uses SyntaxHighlighter for non-header lines', () => {
    const line: ParsedDiffLine = {
      type: 'addition',
      content: 'const x = 1;',
      oldLineNumber: null,
      newLineNumber: 1,
    };

    render(
      <table>
        <tbody>
          <DiffLine line={line} language="typescript" />
        </tbody>
      </table>
    );

    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
  });
});
