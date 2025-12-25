import { useMemo } from 'react';
import type { ParsedDiffLine } from '../types';
import { highlightSyntax } from '../utils';
import { cn } from '@/utils/cn';

interface DiffLineProps {
  line: ParsedDiffLine;
  language: string;
}

const LINE_STYLES = {
  addition: 'bg-green-50',
  deletion: 'bg-red-50',
  context: 'bg-white',
  header: 'bg-gray-100 text-gray-600 font-semibold',
};

const GUTTER_STYLES = {
  addition: 'text-green-700 bg-green-100',
  deletion: 'text-red-700 bg-red-100',
  context: 'text-gray-500 bg-gray-50',
  header: 'text-gray-500 bg-gray-100',
};

const LINE_MARKERS = {
  addition: '+',
  deletion: '−',
  context: ' ',
  header: '',
};

/**
 * Single line in the unified diff view
 * S-1.4: AC-1.4.1 through AC-1.4.10
 */
export function DiffLine({ line, language }: DiffLineProps) {
  // AC-1.4.5: Syntax highlighting
  const highlightedCode = useMemo(() => {
    if (line.type === 'header') return line.content;
    return highlightSyntax(line.content, language);
  }, [line.content, line.type, language]);

  return (
    <tr className={cn('hover:brightness-95', LINE_STYLES[line.type])}>
      {/* AC-1.4.4: Line numbers */}
      <td
        className={cn(
          'px-2 py-0.5 text-right text-xs select-none w-12 border-r border-gray-200',
          GUTTER_STYLES[line.type]
        )}
      >
        {line.oldLineNumber ?? ''}
      </td>
      <td
        className={cn(
          'px-2 py-0.5 text-right text-xs select-none w-12 border-r border-gray-200',
          GUTTER_STYLES[line.type]
        )}
      >
        {line.newLineNumber ?? ''}
      </td>

      {/* AC-1.4.10: +/- markers for accessibility */}
      <td className="px-1 py-0.5 text-center select-none w-6 text-xs font-mono" aria-hidden="true">
        {LINE_MARKERS[line.type]}
      </td>

      {/* AC-1.4.9: Screen reader accessible */}
      <td className="py-0.5 overflow-hidden">
        <span className="sr-only">
          {line.type === 'addition' && 'Added: '}
          {line.type === 'deletion' && 'Deleted: '}
        </span>
        {/* AC-1.4.6: Preserve indentation */}
        <pre className="font-mono text-sm whitespace-pre pl-2 pr-4">
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </td>
    </tr>
  );
}
