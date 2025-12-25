import hljs from 'highlight.js/lib/core';

// Import only common languages to minimize bundle size
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import markdown from 'highlight.js/lib/languages/markdown';

// Register languages
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('markdown', markdown);

/**
 * Applies syntax highlighting to code
 * @param code - The code string to highlight
 * @param language - The language identifier
 * @returns HTML string with highlight.js classes
 */
export function highlightSyntax(code: string, language: string): string {
  try {
    // Check if language is supported
    if (hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }

    // Try auto-detection for unknown languages
    const result = hljs.highlightAuto(code);
    return result.value;
  } catch {
    // Return plain text if highlighting fails
    return escapeHtml(code);
  }
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char);
}
