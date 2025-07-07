import { useState, useRef, useEffect } from 'react';
import { useFormKeyboardShortcuts } from './useFormKeyboardShortcuts';

interface FormWrapperOptions {
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onInactivate?: () => void;
  onActivate?: () => void;
  onReset?: () => void;
  onFocusSearch?: () => void;
  onToggleCreateMode?: () => void;
  customShortcuts?: {
    [key: string]: () => void;
  };
  autoFocusField?: string;
  helpTitle?: string;
  customHelpShortcuts?: Array<{
    shortcut: string;
    description: string;
  }>;
}

export const useFormWrapper = (options: FormWrapperOptions) => {
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Auto-focus first field on mount
  useEffect(() => {
    if (options.autoFocusField) {
      const field = document.querySelector(`[name="${options.autoFocusField}"]`) as HTMLInputElement;
      if (field) {
        field.focus();
      }
    } else if (firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [options.autoFocusField]);

  // Keyboard shortcuts
  useFormKeyboardShortcuts({
    onSubmit: options.onSubmit,
    onCancel: options.onCancel,
    onDelete: options.onDelete,
    onInactivate: options.onInactivate,
    onActivate: options.onActivate,
    onReset: options.onReset,
    onFocusSearch: options.onFocusSearch,
    onToggleCreateMode: options.onToggleCreateMode,
    onShowHelp: () => setShowHelp(true),
    customShortcuts: options.customShortcuts,
  });

  const closeHelp = () => setShowHelp(false);

  return {
    showHelp,
    closeHelp,
    formRef,
    firstFieldRef,
    helpTitle: options.helpTitle || "Atalhos do Teclado",
    customHelpShortcuts: options.customHelpShortcuts || [],
  };
}; 