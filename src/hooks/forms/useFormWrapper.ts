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
  onBack?: () => void;
  customShortcuts?: {
    [key: string]: () => void;
  };
  autoFocusField?: string;
  helpTitle?: string;
  customHelpShortcuts?: Array<{
    shortcut: string;
    description: string;
  }>;
  fieldRefs?: React.RefObject<HTMLElement>[];
}

export const useFormWrapper = (options: FormWrapperOptions) => {
  const [showHelp, setShowHelp] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Field navigation functions
  const focusNextField = (currentRef: React.RefObject<HTMLElement>) => {
    if (!options.fieldRefs || options.fieldRefs.length === 0) return;
    
    const fields = options.fieldRefs;
    const currentIndex = fields.findIndex(ref => ref === currentRef);
    const nextIndex = (currentIndex + 1) % fields.length;
    const nextField = fields[nextIndex];
    
    if (nextField.current) {
      if (nextField.current.tagName === 'INPUT') {
        (nextField.current as HTMLInputElement).focus();
      } else {
        const input = nextField.current.querySelector('input');
        input?.focus();
      }
    }
  };

  const focusPreviousField = (currentRef: React.RefObject<HTMLElement>) => {
    if (!options.fieldRefs || options.fieldRefs.length === 0) return;
    
    const fields = options.fieldRefs;
    const currentIndex = fields.findIndex(ref => ref === currentRef);
    const prevIndex = currentIndex === 0 ? fields.length - 1 : currentIndex - 1;
    const prevField = fields[prevIndex];
    
    if (prevField.current) {
      if (prevField.current.tagName === 'INPUT') {
        (prevField.current as HTMLInputElement).focus();
      } else {
        const input = prevField.current.querySelector('input');
        input?.focus();
      }
    }
  };

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
    onBack: options.onBack,
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
    focusNextField,
    focusPreviousField,
  };
}; 