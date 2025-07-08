import React, { useRef, useState } from 'react';
import { Grid, TextField, Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useListPageFocusNavigation } from '../hooks/listings/useListPageFocusNavigation';
import { CustomDataTable, CustomDataTableRef } from './CustomDataTable';
import { ColumnDefinition } from './CustomDataTable/types';
import { EnhancedAutocomplete } from './EnhancedAutocomplete';
import { PageTitle } from './PageTitle';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { KeyboardListPageKeyboardHelp } from './KeyboardListPageKeyboardHelp';

export interface GenericListPageProps<T = any> {
  title: string;
  data: T[];
  columns: ColumnDefinition<T>[];
  totalCount?: number;
  loading?: boolean;
  selectedRowId?: string | null;
  onRowSelectionChange?: (rowId: string | null) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  
  // Search and filters
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    ref: React.RefObject<HTMLElement>;
    component: React.ReactNode;
  }>;
  
  // Actions
  onEditSelected?: (rowId: string) => void;
  onDeleteSelected?: (rowId: string) => void;
  onToggleStatus?: (rowId: string) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  
  // Navigation
  editRoute?: string;
  createRoute?: string;
  
  // Keyboard shortcuts
  canToggleStatus?: boolean;
  showInactivate?: boolean;
  
  // Row identification
  getRowId?: (row: T) => string;
  
  // Custom action buttons
  actionButtons?: React.ReactNode;
}

export function GenericListPage<T = any>({
  title,
  data,
  columns,
  totalCount = 0,
  loading = false,
  selectedRowId,
  onRowSelectionChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  onEditSelected,
  onDeleteSelected,
  onToggleStatus,
  onCreateNew,
  onRefresh,
  editRoute,
  createRoute,
  canToggleStatus = false,
  showInactivate = false,
  getRowId = (row: any) => row.id,
  actionButtons,
}: GenericListPageProps<T>) {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Refs for focus management
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<CustomDataTableRef>(null);

  // Extract refs from filters
  const filterRefs = filters.map(filter => filter.ref);

  // Set up focus navigation
  const { focusNavigation } = useListPageFocusNavigation({
    fieldRefs: [searchFieldRef, ...filterRefs],
    tableRef,
    tableData: data,
    onTableRowSelect: onRowSelectionChange,
    getRowId,
    onFocusSearch: () => {
      if (searchFieldRef.current) {
        searchFieldRef.current.focus();
        searchFieldRef.current.select();
      }
    },
    onClearFilters: () => {
      onSearchChange('');
      // Clear other filters if needed
      setTimeout(() => searchFieldRef.current?.focus(), 100);
    },
    onEditSelected: () => {
      if (selectedRowId && onEditSelected) {
        onEditSelected(selectedRowId);
      } else if (selectedRowId && editRoute) {
        navigate(`${editRoute}/${selectedRowId}`);
      }
    },
    onDeleteSelected: () => {
      if (selectedRowId) {
        setDeleteDialogOpen(true);
      }
    },
    onToggleStatus: () => {
      if (selectedRowId && onToggleStatus) {
        onToggleStatus(selectedRowId);
      }
    },
    onCreateNew: () => {
      if (onCreateNew) {
        onCreateNew();
      } else if (createRoute) {
        navigate(createRoute);
      }
    },
    onRefresh: () => {
      onRefresh?.();
    },
    onPreviousPage: () => {
      if (page > 0) {
        onPageChange(page - 1);
      }
    },
    onNextPage: () => {
      if (totalCount && (page + 1) * pageSize < totalCount) {
        onPageChange(page + 1);
      }
    },
    onShowHelp: () => {
      setShowHelp(true);
    },
    hasSelectedItem: !!selectedRowId,
    canToggleStatus,
    hasNextPage: totalCount ? (page + 1) * pageSize < totalCount : false,
    hasPreviousPage: page > 0,
  });

  const handleConfirmDelete = () => {
    if (selectedRowId && onDeleteSelected) {
      onDeleteSelected(selectedRowId);
    }
    setDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogClosed = () => {
    if (tableRef.current && selectedRowId) {
      tableRef.current.restoreFocusToSelectedRow();
    }
  };

  return (
    <>
      <PageTitle>{title}</PageTitle>
      <Grid spacing={1} container>
        {/* Search Field */}
        <Grid item xs={12 / (filters.length + 1)}>
          <TextField
            ref={searchFieldRef}
            value={searchValue}
            fullWidth
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
        </Grid>

        {/* Filters */}
        {filters.map((filter, index) => (
          <Grid item xs={12 / (filters.length + 1)} key={index}>
            {filter.component}
          </Grid>
        ))}

        {/* Action Buttons */}
        {actionButtons}

        {/* Table */}
        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <CustomDataTable
            data={data}
            columns={columns}
            totalCount={totalCount}
            loading={loading}
            selectedRowId={selectedRowId}
            onRowSelectionChange={onRowSelectionChange}
            page={page}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onRowDoubleClick={(row) => {
              const rowId = getRowId(row);
              if (onEditSelected) {
                onEditSelected(rowId);
              } else if (editRoute) {
                navigate(`${editRoute}/${rowId}`);
              }
            }}
            onNavigateToNextField={() => {
              // Navigate to next component after table
            }}
            onNavigateToPreviousField={() => {
              // Navigate back to last field before table
              focusNavigation.focusLastFieldBeforeTable();
            }}
            getRowId={getRowId}
            onEditSelected={(row) => {
              const rowId = getRowId(row);
              if (onEditSelected) {
                onEditSelected(rowId);
              } else if (editRoute) {
                navigate(`${editRoute}/${rowId}`);
              }
            }}
            onDeleteSelected={(row) => {
              const rowId = getRowId(row);
              if (onDeleteSelected) {
                onDeleteSelected(rowId);
              }
            }}
            ref={tableRef}
          />
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="item"
        onDialogClosed={handleDialogClosed}
      />

      {/* Keyboard Help */}
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title={`Atalhos do Teclado - ${title}`}
        showInactivate={showInactivate}
      />
    </>
  );
} 