import { useCallback } from 'react';

interface AutocompleteKeyboardOptions<T> {
  isOpen: boolean;
  onSelect: (value: any) => void;
  onClose: () => void;
  onNextField?: () => void;
  onPreviousField?: () => void;
  highlightedValue?: T;
}

export const useAutocompleteKeyboard = <T,>(options: AutocompleteKeyboardOptions<T>) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
   // Shift + Tab: Close dropdown and move to previous field
   if (event.key === 'Tab' && event.shiftKey && options.isOpen) {
    event.preventDefault();
    options.onClose();
    setTimeout(() => {
      options.onPreviousField?.();
    }, 50);
    return;
  }

    // Tab: Select current option and move to next field
    if (event.key === 'Tab' && options.isOpen) {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
   
      return;
    }

      // Tab: Move to next field
      if (event.key === 'Tab' && !options.isOpen && !event.shiftKey) {
        event.preventDefault();
        setTimeout(() => {
          options.onNextField?.();
        }, 50);
        return;
      }

    // Escape: Close dropdown without selection
    if (event.key === 'Escape' && options.isOpen) {
      event.preventDefault();
      options.onClose();
      return;
    }

    // Enter: Select current option and close dropdown
    if (event.key === 'Enter' && options.isOpen) {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
      return;
    }

    // Space: Select current option and close dropdown
    if (event.key === ' ' && options.isOpen) {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
      return;
    }
  }, [options]);

  return { handleKeyDown };
}; 