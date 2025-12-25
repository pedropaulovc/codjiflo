import { describe, it, expect } from 'vitest';
import { highlightSyntax } from './syntax-highlighter';

describe('highlightSyntax', () => {
  it('highlights TypeScript code', () => {
    const code = 'const foo = "bar";';
    const result = highlightSyntax(code, 'typescript');

    expect(result).toContain('hljs');
    expect(result).toContain('const');
  });

  it('highlights JavaScript code', () => {
    const code = 'function test() { return 42; }';
    const result = highlightSyntax(code, 'javascript');

    expect(result).toContain('hljs');
  });

  it('highlights Python code', () => {
    const code = 'def hello(): return "world"';
    const result = highlightSyntax(code, 'python');

    expect(result).toContain('hljs');
  });

  it('auto-detects language for unknown language', () => {
    const code = 'function test() { return 42; }';
    const result = highlightSyntax(code, 'unknown-lang');

    // Should auto-detect and still highlight
    expect(result).toBeDefined();
  });

  it('handles empty code', () => {
    const result = highlightSyntax('', 'typescript');
    expect(result).toBe('');
  });

  it('highlights JSON code', () => {
    const code = '{ "key": "value" }';
    const result = highlightSyntax(code, 'json');

    expect(result).toContain('hljs');
  });

  it('highlights CSS code', () => {
    const code = '.class { color: red; }';
    const result = highlightSyntax(code, 'css');

    expect(result).toContain('hljs');
  });

  it('highlights bash code', () => {
    const code = 'echo "hello world"';
    const result = highlightSyntax(code, 'bash');

    expect(result).toContain('hljs');
  });
});
