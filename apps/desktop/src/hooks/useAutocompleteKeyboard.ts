import { useCallback } from 'react';
import { useNavigationMode } from '../context/navigationMode';
import { isNavForward, isNavBackward } from '../lib/navigationKeys';

interface AutocompleteKeyboardOptions<T> {
  isOpen: boolean;
  multiple?: boolean;
  onSelect: (value: any) => void;
  onClose: () => void;
  onNextField?: () => void;
  onPreviousField?: () => void;
  highlightedValue?: T;
}

export const useAutocompleteKeyboard = <T,>(options: AutocompleteKeyboardOptions<T>) => {
  const { navigationMode } = useNavigationMode();

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // ── Navigation keys (Tab in tab-mode, Enter in enter-mode) ──

    // Backward nav + open: close dropdown and move to previous field
    if (isNavBackward(event, navigationMode) && options.isOpen) {
      event.preventDefault();
      options.onClose();
      setTimeout(() => {
        options.onPreviousField?.();
      }, 50);
      return;
    }

    // Backward nav + closed: move to previous field
    if (isNavBackward(event, navigationMode) && !options.isOpen) {
      event.preventDefault();
      setTimeout(() => {
        options.onPreviousField?.();
      }, 50);
      return;
    }

    // Forward nav + open + multi-select: select option, close, stay on field
    if (isNavForward(event, navigationMode) && options.isOpen && options.multiple) {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
      return;
    }

    // Forward nav + open + single-select: select option, close, go to next field
    if (isNavForward(event, navigationMode) && options.isOpen) {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
      setTimeout(() => {
        options.onNextField?.();
      }, 50);
      return;
    }

    // Forward nav + closed: move to next field
    if (isNavForward(event, navigationMode) && !options.isOpen) {
      event.preventDefault();
      setTimeout(() => {
        options.onNextField?.();
      }, 50);
      return;
    }

    // ── Non-navigation keys ──

    // Escape: close dropdown without selection
    if (event.key === 'Escape' && options.isOpen) {
      event.preventDefault();
      options.onClose();
      return;
    }

    // Enter in tab-mode: select option without navigating
    // (In enter-mode, Enter is the navigation key — handled above)
    if (event.key === 'Enter' && options.isOpen && navigationMode === 'tab') {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
      return;
    }

    // Space: select current option and close dropdown
    if (event.key === ' ' && options.isOpen) {
      event.preventDefault();
      if (options.highlightedValue) {
        options.onSelect(options.highlightedValue);
      }
      options.onClose();
      return;
    }
  }, [options, navigationMode]);

  return { handleKeyDown };
};
