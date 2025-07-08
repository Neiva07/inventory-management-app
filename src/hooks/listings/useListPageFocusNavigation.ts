import { useRef, useMemo } from 'react';
import { useFocusNavigation, FocusNavigationOptions } from './useFocusNavigation';
import { useListPageKeyboardShortcuts } from './useListPageKeyboardShortcuts';

export interface ListPageFocusNavigationOptions {
  // Focus navigation options
  fieldRefs: React.RefObject<HTMLElement>[];
  tableRef?: React.RefObject<{ restoreFocusToSelectedRow: () => void }>;
  tableData?: any[];
  onTableRowSelect?: (rowId: string) => void;
  getRowId?: (row: any) => string;
  actionButtonRefs?: React.RefObject<HTMLElement>[];
  
  // Keyboard shortcuts handlers
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
  
  // Keyboard shortcuts state
  hasSelectedItem: boolean;
  canToggleStatus?: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListPageFocusNavigationReturn {
  focusNavigation: ReturnType<typeof useFocusNavigation>;
  fieldRefs: React.RefObject<HTMLElement>[];
  tableRef?: React.RefObject<{ restoreFocusToSelectedRow: () => void }>;
  actionButtonRefs?: React.RefObject<HTMLElement>[];
}

export const useListPageFocusNavigation = (options: ListPageFocusNavigationOptions): ListPageFocusNavigationReturn => {
  const {
    fieldRefs,
    tableRef,
    tableData,
    onTableRowSelect,
    getRowId,
    onFocusSearch,
    onClearFilters,
    onEditSelected,
    onDeleteSelected,
    onToggleStatus,
    onCreateNew,
    onRefresh,
    onPreviousPage,
    onNextPage,
    onShowHelp,
    hasSelectedItem,
    canToggleStatus,
    hasNextPage,
    hasPreviousPage,
  } = options;

  const focusNavigationOptions: FocusNavigationOptions = useMemo(() => ({
    fieldRefs,
    tableRef,
    tableData,
    onTableRowSelect,
    getRowId,
  }), [fieldRefs, tableRef, tableData, onTableRowSelect, getRowId]);

  const focusNavigation = useFocusNavigation(focusNavigationOptions);

  // Set up keyboard shortcuts
  useListPageKeyboardShortcuts({
    onFocusSearch,
    onClearFilters,
    onEditSelected,
    onDeleteSelected,
    onToggleStatus,
    onCreateNew,
    onRefresh,
    onPreviousPage,
    onNextPage,
    onShowHelp,
    hasSelectedItem,
    canToggleStatus,
    hasNextPage,
    hasPreviousPage,
    onFocusFirstTableRow: focusNavigation.focusFirstTableRow,
  });

  return {
    focusNavigation,
    fieldRefs,
    tableRef,
  };
}; 