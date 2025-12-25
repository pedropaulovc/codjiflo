import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/helpers';
import { DiffLine } from './DiffLine';
import type { ParsedDiffLine } from '../types';

// Mock the syntax highlighter to avoid complex output
vi.mock('../utils', () => ({
  highlightSyntax: (code: string) => code,
}));

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
});
