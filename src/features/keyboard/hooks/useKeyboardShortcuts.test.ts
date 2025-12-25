import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, getShortcutsList } from './useKeyboardShortcuts';
import { useDiffStore } from '@/features/diff';

vi.mock('@/features/diff', () => ({
  useDiffStore: vi.fn(),
}));

describe('useKeyboardShortcuts', () => {
  const mockSelectNextFile = vi.fn();
  const mockSelectPreviousFile = vi.fn();

  beforeEach(() => {
    vi.mocked(useDiffStore).mockImplementation((selector) => {
      const state = {
        selectNextFile: mockSelectNextFile,
        selectPreviousFile: mockSelectPreviousFile,
      };
      return selector(state as never);
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds keydown event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useKeyboardShortcuts());

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes keydown event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('calls selectNextFile when j is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', { key: 'j' });
    window.dispatchEvent(event);

    expect(mockSelectNextFile).toHaveBeenCalledTimes(1);
  });

  it('calls selectPreviousFile when k is pressed', () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);

    expect(mockSelectPreviousFile).toHaveBeenCalledTimes(1);
  });

  it('does not trigger shortcuts when in input field', () => {
    renderHook(() => useKeyboardShortcuts());

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: 'j' });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(mockSelectNextFile).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does not trigger shortcuts when in textarea', () => {
    renderHook(() => useKeyboardShortcuts());

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = new KeyboardEvent('keydown', { key: 'k' });
    Object.defineProperty(event, 'target', { value: textarea });
    window.dispatchEvent(event);

    expect(mockSelectPreviousFile).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });
});

describe('getShortcutsList', () => {
  it('returns list of shortcuts', () => {
    const shortcuts = getShortcutsList();

    expect(shortcuts).toEqual([
      { key: 'j', description: 'Next file' },
      { key: 'k', description: 'Previous file' },
      { key: 'Space', description: 'Scroll down in diff view' },
    ]);
  });
});
