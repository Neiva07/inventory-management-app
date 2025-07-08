import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { CustomDataTableProps, ColumnDefinition } from './types';
import { useTableNavigation } from './useTableNavigation';
import { useTableSelection } from './useTableSelection';

export interface CustomDataTableRef {
  restoreFocusToSelectedRow: () => void;
}

export const CustomDataTable = forwardRef<CustomDataTableRef, CustomDataTableProps<any>>((props, ref) => {
  const {
    data,
    columns,
    totalCount = 0,
    loading = false,
    selectedRowId,
    onRowSelectionChange,
    selectionMode = 'single',
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    onRowDoubleClick,
    onRowClick,
    className,
    style,
    emptyMessage = 'Nenhum dado encontrado',
    loadingMessage = 'Carregando...',
    rowHeight = 52,
    maxHeight = 1200,
    onFocusFirstRow,
    onNavigateToNextField,
    onNavigateToPreviousField,
    onSelectionChange,
    getRowId = (row: any) => row.id || row.publicId,
    onEditSelected,
    onDeleteSelected,
  } = props;

  const theme = useTheme();
  const tableRef = useRef<HTMLDivElement>(null);

  // Get row ID function
  const getRowIdValue = (row: any) => getRowId(row);

  // Table navigation hook
  const { handleKeyDown, focusRow } = useTableNavigation({
    data,
    selectedRowId,
    onRowSelectionChange,
    onNavigateToNextField,
    onNavigateToPreviousField,
    getRowId: getRowIdValue,
    onEditSelected,
    onDeleteSelected
  });

  // Table selection hook
  const { handleRowClick, handleRowDoubleClick } = useTableSelection({
    onRowSelectionChange,
    onRowClick,
    onRowDoubleClick,
    selectionMode
  });

  // Method to restore focus to selected row
  const restoreFocusToSelectedRow = () => {
    if (selectedRowId) {
      const rowIndex = data.findIndex(row => getRowIdValue(row) === selectedRowId);
      if (rowIndex !== -1) {
        focusRow(rowIndex);
      }
    }
  };

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    restoreFocusToSelectedRow
  }));

  // Handle row selection change
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(!!selectedRowId);
    }
  }, [selectedRowId, onSelectionChange]);

  // Focus management
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const handleTableKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    table.addEventListener('keydown', handleTableKeyDown);
    return () => {
      table.removeEventListener('keydown', handleTableKeyDown);
    };
  }, [handleKeyDown]);

  // Focus first row when data changes
  useEffect(() => {
    if (data.length > 0 && onFocusFirstRow) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const firstRow = tableRef.current?.querySelector('[data-row-index="0"]');
        if (firstRow) {
          (firstRow as HTMLElement).focus();
          onRowSelectionChange?.(getRowIdValue(data[0]));
        }
      }, 100);
    }
  }, [data, onFocusFirstRow, onRowSelectionChange]);

  // Restore focus to selected row after data refresh or selection change
  useEffect(() => {
    if (selectedRowId) {
      const rowIndex = data.findIndex(row => getRowIdValue(row) === selectedRowId);
      if (rowIndex !== -1) {
        focusRow(rowIndex);
      }
    }
  }, [data, selectedRowId, focusRow, getRowIdValue]);

  const renderCell = (column: ColumnDefinition, row: any) => {
    const value = column.valueGetter ? column.valueGetter(row) : row[column.field];
    if (column.renderCell) {
      return column.renderCell(value, row);
    }
    return value;
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange?.(newPageSize);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        ref={tableRef}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {loadingMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      ref={tableRef}
      className={className}
      style={style}
      tabIndex={0}
      sx={{ 
        maxHeight,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    width: column.width,
                    flex: column.flex,
                    fontWeight: 'bold',
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: `2px solid ${theme.palette.divider}`
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowIdValue(row);
                const isSelected = selectedRowId === rowId;
                return (
                  <TableRow
                    key={rowId}
                    data-row-index={index}
                    data-row-id={rowId}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => {
                      handleRowClick(row, rowId);
                      onRowSelectionChange?.(rowId);
                    }}
                    onDoubleClick={() => handleRowDoubleClick(row, rowId)}
                    onFocus={() => {
                      onRowSelectionChange?.(rowId);
                    }}
                    sx={{
                      cursor: 'pointer',
                      height: rowHeight,
                      '&:focus': {
                        backgroundColor: theme.palette.action.selected,
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: '-2px'
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        sx={{
                          width: column.width,
                          flex: column.flex,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {renderCell(column, row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalCount > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}
    </Paper>
  );
});

CustomDataTable.displayName = 'CustomDataTable'; 