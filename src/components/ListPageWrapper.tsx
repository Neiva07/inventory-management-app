import React, { useRef, useMemo } from 'react';
import { useFocusNavigation, FocusNavigationOptions } from '../hooks/listings/useFocusNavigation';

export interface ListPageWrapperProps {
  children: React.ReactNode;
  fieldRefs: React.RefObject<HTMLElement>[];
  tableRef?: React.RefObject<{ restoreFocusToSelectedRow: () => void }>;
  tableData?: any[];
  onTableRowSelect?: (rowId: string) => void;
  getRowId?: (row: any) => string;
  actionButtonRefs?: React.RefObject<HTMLElement>[];
}

export interface ListPageWrapperContextValue {
  focusNavigation: ReturnType<typeof useFocusNavigation>;
  fieldRefs: React.RefObject<HTMLElement>[];
  tableRef?: React.RefObject<{ restoreFocusToSelectedRow: () => void }>;
  actionButtonRefs?: React.RefObject<HTMLElement>[];
}

const ListPageWrapperContext = React.createContext<ListPageWrapperContextValue | null>(null);

export const useListPageWrapper = () => {
  const context = React.useContext(ListPageWrapperContext);
  if (!context) {
    throw new Error('useListPageWrapper must be used within a ListPageWrapper');
  }
  return context;
};

export const ListPageWrapper: React.FC<ListPageWrapperProps> = ({
  children,
  fieldRefs,
  tableRef,
  tableData,
  onTableRowSelect,
  getRowId,
  actionButtonRefs,
}) => {
  const focusNavigationOptions: FocusNavigationOptions = useMemo(() => ({
    fieldRefs,
    tableRef,
    tableData,
    onTableRowSelect,
    getRowId,
    actionButtonRefs,
  }), [fieldRefs, tableRef, tableData, onTableRowSelect, getRowId, actionButtonRefs]);

  const focusNavigation = useFocusNavigation(focusNavigationOptions);

  const contextValue: ListPageWrapperContextValue = useMemo(() => ({
    focusNavigation,
    fieldRefs,
    tableRef,
    actionButtonRefs,
  }), [focusNavigation, fieldRefs, tableRef, actionButtonRefs]);

  return (
    <ListPageWrapperContext.Provider value={contextValue}>
      {children}
    </ListPageWrapperContext.Provider>
  );
}; 