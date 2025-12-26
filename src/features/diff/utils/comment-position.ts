import type { ParsedDiffLine } from '../types';

export function getDiffLinePosition(
  diffLines: ParsedDiffLine[],
  targetIndex: number
): number | null {
  if (targetIndex < 0 || targetIndex >= diffLines.length) {
    return null;
  }

  const targetLine = diffLines[targetIndex];
  if (!targetLine || targetLine.type === 'header') {
    return null;
  }

  let position = 0;
  for (let i = 0; i <= targetIndex; i += 1) {
    if (diffLines[i]?.type !== 'header') {
      position += 1;
    }
  }

  return position;
}

export function getDiffLineIndexForPosition(
  diffLines: ParsedDiffLine[],
  position: number
): number | null {
  if (position <= 0) {
    return null;
  }

  let current = 0;
  for (let i = 0; i < diffLines.length; i += 1) {
    if (diffLines[i]?.type === 'header') {
      continue;
    }
    current += 1;
    if (current === position) {
      return i;
    }
  }

  return null;
}
