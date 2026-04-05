import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui';
import { cn } from 'lib/utils';
import { CustomDataTableProps, ColumnDefinition } from './types';
import { useTableNavigation } from './useTableNavigation';
import { useTableSelection } from './useTableSelection';

export interface CustomDataTableRef {
  restoreFocusToSelectedRow: () => void;
}

type ColumnMeta = {
  width?: number | string;
  flex?: number;
};

const getColumnStyle = (column: ColumnDefinition) => {
  if (column.width == null) {
    return undefined;
  }

  return {
    width: column.width,
    minWidth: column.width,
  } as React.CSSProperties;
};

export const CustomDataTable = forwardRef<
  CustomDataTableRef,
  CustomDataTableProps<any>
>((props, ref) => {
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

  const tableRef = useRef<HTMLDivElement>(null);

  const getRowIdValue = useCallback(
    (row: any) => String(getRowId(row)),
    [getRowId]
  );

  const { handleKeyDown, focusRow } = useTableNavigation({
    data,
    selectedRowId,
    onRowSelectionChange,
    onNavigateToNextField,
    onNavigateToPreviousField,
    getRowId: getRowIdValue,
    onEditSelected,
    onDeleteSelected,
  });

  const { handleRowClick, handleRowDoubleClick } = useTableSelection({
    onRowSelectionChange,
    onRowClick,
    onRowDoubleClick,
    selectionMode,
  });

  const tanstackColumns = useMemo<ColumnDef<any>[]>(() => {
    return columns.map((column) => ({
      id: column.field,
      header: column.headerName,
      accessorFn: (row) =>
        column.valueGetter ? column.valueGetter(row) : row?.[column.field],
      cell: ({ row, getValue }) => {
        const value = getValue();
        if (column.renderCell) {
          return column.renderCell(value, row.original);
        }
        return value as React.ReactNode;
      },
      meta: {
        width: column.width,
        flex: column.flex,
      } satisfies ColumnMeta,
    }));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => getRowIdValue(row) || String(index),
  });

  const restoreFocusToSelectedRow = useCallback(() => {
    if (!selectedRowId) {
      return;
    }

    const rowIndex = data.findIndex((row) => getRowIdValue(row) === selectedRowId);
    if (rowIndex !== -1) {
      focusRow(rowIndex);
    }
  }, [data, focusRow, getRowIdValue, selectedRowId]);

  useImperativeHandle(ref, () => ({
    restoreFocusToSelectedRow,
  }));

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(!!selectedRowId);
    }
  }, [selectedRowId, onSelectionChange]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) {
      return;
    }

    const handleTableKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    tableElement.addEventListener('keydown', handleTableKeyDown);
    return () => {
      tableElement.removeEventListener('keydown', handleTableKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (data.length === 0 || !onFocusFirstRow) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const firstRow = tableRef.current?.querySelector('[data-row-index="0"]');
      if (firstRow) {
        (firstRow as HTMLElement).focus();
        onRowSelectionChange?.(getRowIdValue(data[0]));
      }
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [data, getRowIdValue, onFocusFirstRow, onRowSelectionChange]);

  useEffect(() => {
    restoreFocusToSelectedRow();
  }, [restoreFocusToSelectedRow]);

  const maxPage = Math.max(0, Math.ceil((totalCount || 0) / pageSize) - 1);
  const displayedFrom = totalCount > 0 ? page * pageSize + 1 : 0;
  const displayedTo = totalCount > 0 ? Math.min(totalCount, (page + 1) * pageSize) : 0;
  const canGoPrevious = page > 0;
  const canGoNext = page < maxPage;

  if (loading) {
    return (
      <div
        ref={tableRef}
        className="flex min-h-[200px] items-center justify-center gap-2 rounded-md border bg-background"
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{loadingMessage}</span>
      </div>
    );
  }

  return (
    <div
      ref={tableRef}
      className={cn(
        'flex flex-col overflow-hidden rounded-md border bg-background',
        className
      )}
      style={{
        ...style,
        maxHeight,
      }}
      tabIndex={0}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const columnMeta = (header.column.columnDef.meta || {}) as ColumnMeta;
                  const sourceColumn = columns.find((column) => column.field === header.column.id);
                  return (
                    <TableHead
                      key={header.id}
                      className="sticky top-0 z-10 bg-background font-semibold"
                      style={sourceColumn ? getColumnStyle(sourceColumn) : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowId = getRowIdValue(row.original);
                const isSelected = selectedRowId === rowId;

                return (
                  <TableRow
                    key={row.id}
                    data-row-index={row.index}
                    data-row-id={rowId}
                    data-state={isSelected ? 'selected' : undefined}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => {
                      handleRowClick(row.original, rowId);
                      onRowSelectionChange?.(rowId);
                    }}
                    onDoubleClick={() => handleRowDoubleClick(row.original, rowId)}
                    onFocus={() => {
                      onRowSelectionChange?.(rowId);
                    }}
                    className={cn(
                      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      isSelected && 'bg-accent/60'
                    )}
                    style={{ height: rowHeight }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const sourceColumn = columns.find(
                        (column) => column.field === cell.column.id
                      );
                      return (
                        <TableCell
                          key={cell.id}
                          style={sourceColumn ? getColumnStyle(sourceColumn) : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      {totalCount > 0 && (
        <div className="flex flex-col gap-3 border-t bg-muted/20 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Linhas por página:</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const newPageSize = parseInt(event.target.value, 10);
                if (!isNaN(newPageSize)) {
                  onPageSizeChange?.(newPageSize);
                }
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pageSizeOptions.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <span className="text-muted-foreground">
              {displayedFrom}-{displayedTo} de {totalCount}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={!canGoPrevious}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={!canGoNext}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CustomDataTable.displayName = 'CustomDataTable';
