import { useCallback } from 'react';

interface UseTableSelectionProps<T> {
  onRowSelectionChange?: (rowId: string | null) => void;
  onRowClick?: (row: T, rowId: string) => void;
  onRowDoubleClick?: (row: T, rowId: string) => void;
  selectionMode?: 'single' | 'multiple';
}

export const useTableSelection = <T>({
  onRowSelectionChange,
  onRowClick,
  onRowDoubleClick,
  selectionMode = 'single'
}: UseTableSelectionProps<T>) => {
  
  const handleRowClick = useCallback((row: T, rowId: string) => {
    if (selectionMode === 'single') {
      onRowSelectionChange?.(rowId);
    }
    onRowClick?.(row, rowId);
  }, [onRowSelectionChange, onRowClick, selectionMode]);

  const handleRowDoubleClick = useCallback((row: T, rowId: string) => {
    onRowDoubleClick?.(row, rowId);
  }, [onRowDoubleClick]);

  return {
    handleRowClick,
    handleRowDoubleClick
  };
}; 