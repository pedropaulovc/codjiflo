import { useEffect, useRef, useCallback } from 'react';
import { getShortcutsList } from '../hooks';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal displaying available keyboard shortcuts
 * S-1.5: AC-1.5.4, AC-1.5.5
 */
export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const shortcuts = getShortcutsList();

  // Close on Escape
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Focus trap and escape handling
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        <h2 id="shortcuts-title" className="text-xl font-bold mb-4">
          Keyboard Shortcuts
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">Key</th>
              <th className="text-left py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map(({ key, description }) => (
              <tr key={key} className="border-b last:border-0">
                <td className="py-2">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {key}
                  </kbd>
                </td>
                <td className="py-2 text-gray-700">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
