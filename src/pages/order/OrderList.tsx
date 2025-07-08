import * as React from 'react';
import { deleteOrder, getOrders, Order, OrderStatus } from 'model/orders';
import { Button, Grid, TextField, Skeleton, Typography, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Customer, getCustomers } from 'model/customer';
import { useAuth } from 'context/auth';
import { statuses } from './useOrderForm';
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

const columns: ColumnDefinition<Order>[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  {
    field: 'customer.name',
    headerName: 'Cliente',
    flex: 1,
    valueGetter: (row: Order) => row.customer.name
  },
  {
    field: 'createdAt',
    headerName: 'Data de Venda',
    flex: 1,
    valueGetter: (row: Order) => format(row.orderDate ?? row.createdAt, 'dd/MM/yyyy')
  },
  {
    field: 'totalCost',
    headerName: 'Total',
    width: 120,
    valueGetter: (row: Order) => row.totalCost
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
  }
];

export const OrderList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = React.useState<Array<Order>>([]);
  const [count, setCount] = React.useState<number>();
  const [selectedRowID, setSelectedRowID] = React.useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [customers, setCustomers] = React.useState<Array<Customer>>([]);
  const [statusSelected, setStatusSelected] = React.useState<OrderStatus | null>(null);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<Order | undefined>();
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // Refs for focus navigation
  const customerFilterRef = React.useRef<HTMLDivElement>(null);
  const startDateRef = React.useRef<HTMLDivElement>(null);
  const endDateRef = React.useRef<HTMLDivElement>(null);
  const statusFilterRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<CustomDataTableRef>(null);

  React.useEffect(() => {
    getCustomers({ pageSize: 10000, userID: user.id }).then(queryResult => setCustomers(queryResult[0].docs.map(qr => qr.data() as Customer)))
  }, [user]);

  const queryOrders = () => {
    setLoading(true);
    getOrders({
      pageSize,
      dateRange: {
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
      },
      userID: user.id,
      customerID: selectedCustomer?.id,
      cursor: page > 0 ? currentCursor : undefined,
      status: statusSelected,
    }).then(result => {
      const newOrders = result.orders;
      setOrders(newOrders);
      setCount(result.count.count);
      
      // Store cursor for next page
      if (newOrders.length > 0) {
        setCurrentCursor(newOrders[newOrders.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  // Reset cursor and page when filters change
  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, selectedCustomer, statusSelected, startDate, endDate]);

  React.useEffect(() => {
    queryOrders();
  }, [user, selectedCustomer, statusSelected, startDate, endDate, pageSize, page]);

  const handleCustomerSelection = (_: React.SyntheticEvent<Element, Event>, value: Customer) => {
    setSelectedCustomer(value)
  }

  const handleStatusSelection = (_: React.SyntheticEvent<Element, Event>, value: SelectField<OrderStatus>) => {
    setStatusSelected(value?.value as OrderStatus)
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

  const handleDeleteOrder = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteOrder(selectedRowID);
    queryOrders();
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
    if (customerFilterRef.current) {
      const inputElement = customerFilterRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
        inputElement.select(); // Also select the text for easy replacement
      }
    }
  };

  const handleClearFilters = () => {
    setSelectedCustomer(null);
    setStartDate(null);
    setEndDate(null);
    setStatusSelected(null);
    setTimeout(() => customerFilterRef.current?.focus(), 100);
  };

  const handleEditSelected = () => {
    if (selectedRowID) {
      navigate(`/orders/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/orders/create');
  };

  const handleRefresh = () => {
    queryOrders();
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
    fieldRefs: [customerFilterRef, startDateRef, endDateRef, statusFilterRef],
    tableRef,
    tableData: orders,
    onTableRowSelect: setSelectedRowID,
    getRowId: (order: Order) => order.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteOrder,
    onCreateNew: handleCreateNew,
    onRefresh: handleRefresh,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onShowHelp: () => setShowHelp(true),
    hasSelectedItem: !!selectedRowID,
    canToggleStatus: false, // Orders don't have status toggle
    hasNextPage: count ? (page + 1) * pageSize < count : false,
    hasPreviousPage: page > 0,
  });

  return (
    <>
      <PageTitle 
        showKeyboardHelp={true}
        keyboardHelpTitle="Atalhos do Teclado - Vendas"
        helpOpen={showHelp}
        onHelpOpenChange={setShowHelp}
      >
        Vendas
      </PageTitle>
      <Grid spacing={1} container>
        <Grid item xs={4}>
          <EnhancedAutocomplete
            ref={customerFilterRef}
            id="customer-filter"
            options={customers}
            getOptionLabel={(option: Customer) => option.name}
            label="Cliente"
            isOptionEqualToValue={(option: Customer, value: Customer) =>
              option.id === value?.id
            }
            onChange={handleCustomerSelection}
            onNextField={() => focusNavigation.focusNextField(customerFilterRef)}
            onPreviousField={() => focusNavigation.focusPreviousField(customerFilterRef)}
            value={selectedCustomer}
            autoFocus
          />
        </Grid>
        <Grid item xs={2}>
          <DatePicker 
            value={startDate} 
            label="Inicio" 
            ref={startDateRef}
            onChange={e => setStartDate(e ?? null)}
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
            ref={endDateRef}
            label="Fim" 
            onChange={e => setEndDate(e ?? null)}
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
            getOptionLabel={(option: SelectField<OrderStatus>) => option.label}
            label="Status"
            isOptionEqualToValue={(option: SelectField<OrderStatus>, value: SelectField<OrderStatus>) =>
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
              onClick={() => navigate(`/orders/${selectedRowID}`)}
              tabIndex={-1}
            > 
              Editar Venda 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + D" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeleteOrder}
              tabIndex={-1}
            > 
              Deletar Venda 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + N" placement="top">
            <Button 
              fullWidth 
              onClick={() => navigate(`/orders/create`)}
              tabIndex={-1}
            > 
              Cadastrar Venda 
            </Button>
          </Tooltip>
        </Grid>

        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <CustomDataTable
            data={orders}
            columns={columns}
            totalCount={count}
            loading={loading}
            selectedRowId={selectedRowID}
            onRowSelectionChange={handleRowSelectionChange}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowDoubleClick={(order) => navigate(`/orders/${order.id}`)}
            onNavigateToNextField={() => {
              // Navigate to next component after table (could be action buttons)
            }}
            onNavigateToPreviousField={() => {
              // Navigate back to status filter
              focusNavigation.focusLastFieldBeforeTable();
            }}
            getRowId={(order) => order.id}
            onEditSelected={handleEditSelected}
            onDeleteSelected={handleDeleteOrder}
            ref={tableRef}
          />
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="venda"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Vendas"
        showInactivate={false}
      />
    </>
  );
}
