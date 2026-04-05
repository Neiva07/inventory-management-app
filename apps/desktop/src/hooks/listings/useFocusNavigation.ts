import { useCallback } from 'react';

export interface FocusNavigationOptions {
  fieldRefs: React.RefObject<HTMLElement>[];
  tableRef?: React.RefObject<{ restoreFocusToSelectedRow: () => void }>;
  tableData?: any[];
  onTableRowSelect?: (rowId: string) => void;
  getRowId?: (row: any) => string;
  actionButtonRefs?: React.RefObject<HTMLElement>[];
}

export interface FocusNavigationReturn {
  focusNextField: (currentRef: React.RefObject<HTMLElement>) => void;
  focusPreviousField: (currentRef: React.RefObject<HTMLElement>) => void;
  focusFirstTableRow: () => void;
  focusLastTableRow: () => void;
  focusLastFieldBeforeTable: () => void;
}

export const useFocusNavigation = (options: FocusNavigationOptions): FocusNavigationReturn => {
  const { fieldRefs, tableRef, tableData, onTableRowSelect, getRowId, actionButtonRefs } = options;

  const focusElement = useCallback((ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return;

    if (ref.current.tagName === 'INPUT') {
      (ref.current as HTMLInputElement).focus();
    } else {
      const input = ref.current.querySelector('input');
      if (input) {
        input.focus();
      } else {
        ref.current.focus();
      }
    }
  }, []);

  const blurElement = useCallback((ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return;

    if (ref.current.tagName === 'INPUT') {
      (ref.current as HTMLInputElement).blur();
    } else {
      const input = ref.current.querySelector('input');
      if (input) {
        input.blur();
      } else {
        ref.current.blur();
      }
    }
  }, []);

  const focusNextField = useCallback((currentRef: React.RefObject<HTMLElement>) => {
    const allRefs = [...fieldRefs];
    const currentIndex = allRefs.findIndex(ref => ref === currentRef);
    
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % allRefs.length;
    const nextField = allRefs[nextIndex];
    
    focusElement(nextField);
  }, [fieldRefs, actionButtonRefs, focusElement]);

  const focusPreviousField = useCallback((currentRef: React.RefObject<HTMLElement>) => {
    const allRefs = [...fieldRefs];
    const currentIndex = allRefs.findIndex(ref => ref === currentRef);
    
    if (currentIndex === -1) return;
    
    const prevIndex = currentIndex === 0 ? allRefs.length - 1 : currentIndex - 1;
    const prevField = allRefs[prevIndex];
    
    focusElement(prevField);
  }, [fieldRefs, actionButtonRefs, focusElement]);

    const focusLastFieldBeforeTable = useCallback(() => {
    if (fieldRefs.length > 0) {
      const lastElementBeforeTable = fieldRefs[fieldRefs.length - 1];
      focusElement(lastElementBeforeTable);
      // Clear table selection when navigating back to fields
      onTableRowSelect?.(null);
    }
  }, [fieldRefs, focusElement, onTableRowSelect]);

  const focusFirstTableRow = useCallback(() => {

    // Focus the first row of the table
    if (tableData && tableData.length > 0) {
        // Blur the last field before focusing table
        if (fieldRefs.length > 0) {
            blurElement(fieldRefs[fieldRefs.length - 1]);
        }

      const firstRow = document.querySelector('[data-row-index="0"]');
      if (firstRow) {
        (firstRow as HTMLElement).focus();
        const firstRowId = getRowId ? getRowId(tableData[0]) : tableData[0].id;
        onTableRowSelect?.(firstRowId);
      }
    }
  }, [fieldRefs, tableData, onTableRowSelect, getRowId, blurElement]);

  const focusLastTableRow = useCallback(() => {
    // Blur the last field before focusing table
    if (fieldRefs.length > 0) {
      blurElement(fieldRefs[fieldRefs.length - 1]);
    }

    // Focus the last row of the table
    if (tableData && tableData.length > 0) {
      const lastIndex = tableData.length - 1;
      const lastRow = document.querySelector(`[data-row-index="${lastIndex}"]`);
      if (lastRow) {
        (lastRow as HTMLElement).focus();
        const lastRowId = getRowId ? getRowId(tableData[lastIndex]) : tableData[lastIndex].id;
        onTableRowSelect?.(lastRowId);
      }
    }
  }, [fieldRefs, tableData, onTableRowSelect, getRowId, blurElement]);

  

  return {
    focusNextField,
    focusPreviousField,
    focusFirstTableRow,
    focusLastTableRow,
    focusLastFieldBeforeTable,
  };
}; 