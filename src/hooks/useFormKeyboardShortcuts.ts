import { useEffect, useCallback } from 'react';

interface FormKeyboardHandlers {
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onInactivate?: () => void;
  onActivate?: () => void;
  onReset?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
  onToggleCreateMode?: () => void;
  // Form-specific shortcuts
  customShortcuts?: {
    [key: string]: () => void;
  };
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

    // Ctrl/Cmd + T: Toggle create mode
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
      event.preventDefault();
      handlers.onToggleCreateMode?.();
      return;
    }

    // Handle custom shortcuts
    if (handlers.customShortcuts) {
      const key = event.key.toLowerCase();
      const shortcut = `${event.ctrlKey || event.metaKey ? 'Ctrl/Cmd + ' : ''}${key.toUpperCase()}`;
      
      if (handlers.customShortcuts[shortcut]) {
        event.preventDefault();
        handlers.customShortcuts[shortcut]();
        return;
      }
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