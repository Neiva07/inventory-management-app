import { useEffect, useCallback } from 'react';

interface FormKeyboardHandlers {
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onInactivate?: () => void;
  onActivate?: () => void;
  onReset?: () => void;
  onAddVariant?: () => void;
  onAddPrice?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
}

export const useFormKeyboardShortcuts = (handlers: FormKeyboardHandlers) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl/Cmd + Enter: Submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handlers.onSubmit();
      return;
    }

    // Ctrl/Cmd + D: Delete
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      handlers.onDelete?.();
      return;
    }

    // Ctrl/Cmd + I: Inactivate/Activate
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      handlers.onInactivate?.();
      handlers.onActivate?.();
      return;
    }

    // Ctrl/Cmd + O: Add new variant
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
      event.preventDefault();
      handlers.onAddVariant?.();
      return;
    }

    // Ctrl/Cmd + P: Add new price
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      handlers.onAddPrice?.();
      return;
    }

    // Ctrl/Cmd + R: Reset form
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      handlers.onReset?.();
      return;
    }

    // Ctrl/Cmd + F: Focus search field
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      handlers.onFocusSearch?.();
      return;
    }

    // F1: Show help
    if (event.key === 'F1') {
      event.preventDefault();
      handlers.onShowHelp?.();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 