import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import type { ParsedDiffLine } from '../types';
import { cn } from '@/utils/cn';
import { Button } from '@/components';

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface DiffLineProps {
  line: ParsedDiffLine;
  language: string;
  onStartComment?: () => void;
  showCommentButton?: boolean;
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

// Custom style to match diff view - minimal styling, let parent handle background
const codeStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  background: 'transparent',
  fontSize: '0.875rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  whiteSpace: 'pre',
  overflow: 'visible',
};

/**
 * Single line in the unified diff view
 * S-1.4: AC-1.4.1 through AC-1.4.10
 */
export function DiffLine({ line, language, onStartComment, showCommentButton = false }: DiffLineProps) {
  return (
    <tr className={cn('group hover:brightness-95', LINE_STYLES[line.type])} data-testid="diff-line">
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
      <td className="relative px-1 py-0.5 text-center select-none w-8 text-xs font-mono">
        <span aria-hidden="true">{LINE_MARKERS[line.type]}</span>
        {showCommentButton && onStartComment && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100">
            <Button
              label="+"
              variant="secondary"
              size="icon"
              ariaLabel="Add comment"
              onClick={onStartComment}
            />
          </div>
        )}
      </td>

      {/* AC-1.4.9: Screen reader accessible */}
      <td className="py-0.5 overflow-hidden pl-2 pr-4">
        <span className="sr-only">
          {line.type === 'addition' && 'Added: '}
          {line.type === 'deletion' && 'Deleted: '}
        </span>
        {/* AC-1.4.5: Syntax highlighting, AC-1.4.6: Preserve indentation */}
        {line.type === 'header' ? (
          <pre className="font-mono text-sm whitespace-pre m-0">{line.content}</pre>
        ) : (
          <SyntaxHighlighter
            language={language}
            useInlineStyles={true}
            customStyle={codeStyle}
            PreTag="span"
            CodeTag="span"
          >
            {line.content}
          </SyntaxHighlighter>
        )}
      </td>
    </tr>
  );
}
