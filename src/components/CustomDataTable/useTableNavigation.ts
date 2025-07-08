import { useCallback } from 'react';

interface UseTableNavigationProps<T> {
  data: T[];
  selectedRowId?: string | null;
  onRowSelectionChange?: (rowId: string | null) => void;
  onNavigateToNextField?: () => void;
  onNavigateToPreviousField?: () => void;
  getRowId: (row: T) => string;
  onEditSelected?: (row: T) => void;
  onDeleteSelected?: (row: T) => void;
}

export const useTableNavigation = <T>({
  data,
  selectedRowId,
  onRowSelectionChange,
  onNavigateToNextField,
  onNavigateToPreviousField,
  getRowId,
  onEditSelected,
  onDeleteSelected
}: UseTableNavigationProps<T>) => {
  
  const focusRow = useCallback((index: number) => {
    const rowElement = document.querySelector(`[data-row-index="${index}"]`);
    if (rowElement) {
      (rowElement as HTMLElement).focus();
      const rowId = getRowId(data[index]);
      onRowSelectionChange?.(rowId);
    }
  }, [data, getRowId, onRowSelectionChange]);


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentRowIndex = selectedRowId 
      ? data.findIndex(row => getRowId(row) === selectedRowId)
      : -1;

    const validRowIndex = currentRowIndex >= 0 && currentRowIndex < data.length;

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          onNavigateToPreviousField?.();
        } else {
          onNavigateToNextField?.();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentRowIndex > 0) {
          focusRow(currentRowIndex - 1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentRowIndex < data.length - 1) {
          focusRow(currentRowIndex + 1);
        }
        break;

      case 'Home':
        e.preventDefault();
        if (data.length > 0) {
          focusRow(0);
        }
        break;

      case 'End':
        e.preventDefault();
        if (data.length > 0) {
          focusRow(data.length - 1);
        }
        break;

      case 'Enter':
        e.preventDefault();
        console.log('Enter', currentRowIndex,  data[currentRowIndex]);
        if (validRowIndex && onEditSelected) {
          const row = data[currentRowIndex];
          if (row) onEditSelected(row);
        }
        break;
      case ' ':
        e.preventDefault();
        // Selection is handled by the row click handler
        break;

      case 'Escape':
        e.preventDefault();
        onRowSelectionChange?.(null);
        break;

 
      case 'Delete':
        e.preventDefault();
        if (validRowIndex && onDeleteSelected) {
          const row = data[currentRowIndex];
          if (row) onDeleteSelected(row);
        }
        break;
    }
  }, [
    data,
    selectedRowId,
    getRowId,
    focusRow,
    onNavigateToNextField,
    onNavigateToPreviousField,
    onRowSelectionChange,
    onEditSelected,
    onDeleteSelected
  ]);

  return {
    handleKeyDown,
    focusRow
  };
}; 