import { useEffect, useCallback } from 'react';

interface ListPageKeyboardOptions {
  onFocusSearch: () => void;
  onClearFilters: () => void;
  onEditSelected: () => void;
  onDeleteSelected: () => void;
  onToggleStatus?: () => void;
  onCreateNew: () => void;
  onRefresh: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onShowHelp: () => void;
  hasSelectedItem: boolean;
  canToggleStatus?: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const useListPageKeyboardShortcuts = (options: ListPageKeyboardOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isTextInput = (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    );
    // Allow global shortcuts (with Ctrl/Cmd) even in non-text inputs (like Autocomplete, Select, etc.)
    if (isTextInput && !(event.ctrlKey || event.metaKey)) {
      return;
    }
    
    // Ctrl/Cmd + F: Focus search field
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopPropagation();
      options.onFocusSearch();
      return;
    }

    // Ctrl/Cmd + N: Create new item
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      options.onCreateNew();
      return;
    }

    // Ctrl/Cmd + E: Edit selected item
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      if (options.hasSelectedItem) {
        options.onEditSelected();
      }
      return;
    }

    // Ctrl/Cmd + D: Delete selected item
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      if (options.hasSelectedItem) {
        options.onDeleteSelected();
      }
      return;
    }

    // Ctrl/Cmd + I: Toggle status (activate/inactivate) selected item
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      if (options.hasSelectedItem && options.canToggleStatus && options.onToggleStatus) {
        options.onToggleStatus();
      }
      return;
    }

    // Ctrl/Cmd + R: Refresh data
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      options.onRefresh();
      return;
    }

    // Ctrl/Cmd + Left Arrow: Previous page
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
      event.preventDefault();
      if (options.hasPreviousPage) {
        options.onPreviousPage();
      }

      return;
    }

    // Ctrl/Cmd + Right Arrow: Next page
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
      event.preventDefault();
      if (options.hasNextPage) {
        options.onNextPage();
      }
      return;
    }

    // Escape: Clear filters and focus search
    if (event.key === 'Escape') {
      event.preventDefault();
      options.onClearFilters();
      return;
    }

    // F1: Show help
    if (event.key === 'F1') {
      event.preventDefault();
      options.onShowHelp();
      return;
    }
  }, [options]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 