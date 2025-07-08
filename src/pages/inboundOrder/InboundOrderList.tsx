import * as React from 'react';
import { deleteInboundOrder, getInboundOrders, InboundOrder, InboundOrderStatus } from 'model/inboundOrder';
import { Button, Grid, TextField, Skeleton, Typography, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Supplier, getSuppliers } from 'model/suppliers';
import { useAuth } from 'context/auth';
import { statuses } from './useInboundOrderForm';
import { DatePicker } from '@mui/x-date-pickers';
import { SelectField } from 'pages/product/useProductCreateForm';
import { format } from "date-fns"
import { PageTitle } from 'components/PageTitle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { useListPageFocusNavigation } from 'hooks/listings/useListPageFocusNavigation';
import { KeyboardListPageKeyboardHelp } from 'components/KeyboardListPageKeyboardHelp';
import { CustomDataTable, CustomDataTableRef } from 'components/CustomDataTable';
import { ColumnDefinition } from 'components/CustomDataTable/types';

const columns: ColumnDefinition<InboundOrder>[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  {
    field: 'supplier.name',
    headerName: 'Fornecedor',
    flex: 1,
    valueGetter: (row: InboundOrder) => row.supplier.name
  },
  {
    field: 'createdAt',
    headerName: 'Data de Compra',
    flex: 1,
    valueGetter: (row: InboundOrder) => format(row.orderDate ?? row.createdAt, 'dd/MM/yyyy')
  },
  {
    field: 'totalCost',
    headerName: 'Total',
    width: 120,
    valueGetter: (row: InboundOrder) => row.totalCost
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
  }
];

export const InboundOrderList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inboundOrders, setInboundOrders] = React.useState<Array<InboundOrder>>([]);
  const [count, setCount] = React.useState<number>();
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [statusSelected, setStatusSelected] = React.useState<InboundOrderStatus | null>(null);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<InboundOrder | undefined>();
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // Refs for focus navigation
  const supplierFilterRef = React.useRef<HTMLDivElement>(null);
  const startDateRef = React.useRef<HTMLDivElement>(null);
  const endDateRef = React.useRef<HTMLDivElement>(null);
  const statusFilterRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<CustomDataTableRef>(null);

  React.useEffect(() => {
    getSuppliers({ pageSize: 10000, userID: user.id }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, [user]);

  const queryInboundOrders = () => {
    setLoading(true);
    getInboundOrders({
      pageSize,
      dateRange: {
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
      },
      userID: user.id,
      supplierID: selectedSupplier?.id,
      cursor: page > 0 ? currentCursor : undefined,
      status: statusSelected,
    }).then(result => {
      const newInboundOrders = result.inboundOrders;
      setInboundOrders(newInboundOrders);
      setCount(result.count.count);
      
      // Store cursor for next page
      if (newInboundOrders.length > 0) {
        setCurrentCursor(newInboundOrders[newInboundOrders.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  // Reset cursor and page when filters change
  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, selectedSupplier, statusSelected, startDate, endDate]);

  React.useEffect(() => {
    queryInboundOrders();
  }, [user, selectedSupplier, statusSelected, startDate, endDate, pageSize, page]);

  const handleSupplierSelection = (_: React.SyntheticEvent<Element, Event>, value: Supplier) => {
    setSelectedSupplier(value)
  }

  const handleStatusSelection = (_: React.SyntheticEvent<Element, Event>, value: SelectField<InboundOrderStatus>) => {
    setStatusSelected(value?.value as InboundOrderStatus)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  }

  const handleRowSelectionChange = (rowId: string | null) => {
    setSelectedRowID(rowId || undefined);
  }

  const handleDeleteInboundOrder = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteInboundOrder(selectedRowID);
    queryInboundOrders();
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogClosed = () => {
    // Restore focus to the selected row in the table
    if (tableRef.current && selectedRowID) {
      tableRef.current.restoreFocusToSelectedRow();
    }
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = () => {
    if (supplierFilterRef.current) {
      const inputElement = supplierFilterRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
        inputElement.select(); // Also select the text for easy replacement
      }
    }
  };

  const handleClearFilters = () => {
    setSelectedSupplier(null);
    setStartDate(null);
    setEndDate(null);
    setStatusSelected(null);
    setTimeout(() => supplierFilterRef.current?.focus(), 100);
  };

  const handleEditSelected = () => {
    if (selectedRowID) {
      navigate(`/inbound-orders/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/inbound-orders/create');
  };

  const handleRefresh = () => {
    queryInboundOrders();
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (count && (page + 1) * pageSize < count) {
      setPage(page + 1);
    }
  };

  // Set up focus navigation
  const { focusNavigation } = useListPageFocusNavigation({
    fieldRefs: [supplierFilterRef, startDateRef, endDateRef, statusFilterRef],
    tableRef,
    tableData: inboundOrders,
    onTableRowSelect: setSelectedRowID,
    getRowId: (inboundOrder: InboundOrder) => inboundOrder.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteInboundOrder,
    onCreateNew: handleCreateNew,
    onRefresh: handleRefresh,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onShowHelp: () => setShowHelp(true),
    hasSelectedItem: !!selectedRowID,
    canToggleStatus: false, // Inbound orders don't have status toggle
    hasNextPage: count ? (page + 1) * pageSize < count : false,
    hasPreviousPage: page > 0,
  });

  return (
    <>
      <PageTitle 
        showKeyboardHelp={true}
        keyboardHelpTitle="Atalhos do Teclado - Compras"
        helpOpen={showHelp}
        onHelpOpenChange={setShowHelp}
      >
        Compras
      </PageTitle>
      <Grid spacing={1} container>
        <Grid item xs={4}>
          <EnhancedAutocomplete
            ref={supplierFilterRef}
            id="supplier-filter"
            options={suppliers}
            getOptionLabel={(option: Supplier) => option.tradeName}
            label="Fornecedor"
            isOptionEqualToValue={(option: Supplier, value: Supplier) =>
              option.id === value?.id
            }
            onChange={handleSupplierSelection}
            onNextField={() => focusNavigation.focusNextField(supplierFilterRef)}
            onPreviousField={() => focusNavigation.focusPreviousField(supplierFilterRef)}
            value={selectedSupplier}
            autoFocus
          />
        </Grid>
        <Grid item xs={2}>
          <DatePicker 
            value={startDate} 
            label="Inicio" 
            onChange={e => setStartDate(e ?? null)}
            ref={startDateRef}
            slotProps={{
              textField: {
                fullWidth: true,
              }
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <DatePicker 
            value={endDate} 
            label="Fim" 
            onChange={e => setEndDate(e ?? null)}
            ref={endDateRef}
            slotProps={{
              textField: {
                fullWidth: true,
              }
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <EnhancedAutocomplete
            ref={statusFilterRef}
            id="status-filter"
            options={statuses}
            getOptionLabel={(option: SelectField<InboundOrderStatus>) => option.label}
            label="Status"
            isOptionEqualToValue={(option: SelectField<InboundOrderStatus>, value: SelectField<InboundOrderStatus>) =>
              option.value === value?.value
            }
            onChange={handleStatusSelection}
            onNextField={focusNavigation.focusFirstTableRow}
            onPreviousField={() => focusNavigation.focusPreviousField(statusFilterRef)}
            value={statusSelected ? statuses.find(s => s.value === statusSelected) : null}
          />
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + E" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={() => navigate(`/inbound-orders/${selectedRowID}`)}
              tabIndex={-1}
            > 
              Editar Compra 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + D" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeleteInboundOrder}
              tabIndex={-1}
            > 
              Deletar Compra 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + N" placement="top">
            <Button 
              fullWidth 
              onClick={() => navigate(`/inbound-orders/create`)}
              tabIndex={-1}
            > 
              Cadastrar Compra 
            </Button>
          </Tooltip>
        </Grid>

        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <CustomDataTable
            data={inboundOrders}
            columns={columns}
            totalCount={count}
            loading={loading}
            selectedRowId={selectedRowID}
            onRowSelectionChange={handleRowSelectionChange}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowDoubleClick={(inboundOrder) => navigate(`/inbound-orders/${inboundOrder.id}`)}
            onNavigateToNextField={() => {
              // Navigate to next component after table (could be action buttons)
            }}
            onNavigateToPreviousField={() => {
              // Navigate back to status filter
              focusNavigation.focusLastFieldBeforeTable();
            }}
            getRowId={(inboundOrder) => inboundOrder.id}
            onEditSelected={handleEditSelected}
            onDeleteSelected={handleDeleteInboundOrder}
            ref={tableRef}
          />
        </Grid>
      </Grid>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="compra"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Compras"
        showInactivate={false}
      />
    </>
  )
} 