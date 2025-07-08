import * as React from 'react';
import { Button, Grid, TextField, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { SupplierBill, getSupplierBills, SupplierBillStatus } from '../../model/supplierBill';
import { Supplier, getSuppliers } from 'model/suppliers';
import { useAuth } from '../../context/auth';
import { PageTitle } from '../../components/PageTitle';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';
import { formatCurrency } from 'lib/math';
import { DatePicker } from '@mui/x-date-pickers';
import { getDateStartTimestamp, getDateEndTimestamp } from '../../lib/date';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { useListPageFocusNavigation } from 'hooks/listings/useListPageFocusNavigation';
import { KeyboardListPageKeyboardHelp } from 'components/KeyboardListPageKeyboardHelp';
import { CustomDataTable, CustomDataTableRef } from 'components/CustomDataTable';
import { ColumnDefinition } from 'components/CustomDataTable/types';

const columns: ColumnDefinition<SupplierBill>[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  { 
    field: 'supplier.supplierName', 
    headerName: 'Fornecedor', 
    flex: 1,
    valueGetter: (row) => row.supplier?.supplierName ?? '',
  },
  { 
    field: 'inboundOrder.publicId', 
    headerName: 'Pedido', 
    width: 150,
    valueGetter: (row) => row.inboundOrder?.publicId ?? '',
  },
  { 
    field: 'totalValue', 
    headerName: 'Valor Total', 
    width: 150,
    valueGetter: (row) => formatCurrency(row.totalValue),
  },
  { 
    field: 'initialCashInstallment', 
    headerName: 'Entrada', 
    width: 120,
    valueGetter: (row) => formatCurrency(row.initialCashInstallment),
  },
  { 
    field: 'remainingValue', 
    headerName: 'Restante', 
    width: 120,
    valueGetter: (row) => formatCurrency(row.remainingValue),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    valueGetter: (row) => {
      const statusColors = {
        active: '#1976d2',
        paid: '#2e7d32',
        overdue: '#d32f2f',
        cancelled: '#757575',
      };
      const statusLabels = {
        active: 'Ativo',
        paid: 'Pago',
        overdue: 'Vencido',
        cancelled: 'Cancelado',
      };
      return {
        label: statusLabels[row.status as keyof typeof statusLabels] ?? row.status,
        color: statusColors[row.status as keyof typeof statusColors] ?? '#757575'
      };
    },
    renderCell: (value) => {
      const statusInfo = value as { label: string; color: string };
      return (
        <Box
          sx={{
            backgroundColor: statusInfo.color,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {statusInfo.label}
        </Box>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Data de Criação',
    width: 150,
    valueGetter: (row: SupplierBill) => new Date(row.createdAt).toLocaleDateString('pt-BR'),
  },
];

const statuses = [
  {
    label: "Todos",
    value: "",
  },
  {
    label: "Ativo",
    value: "active",
  },
  {
    label: "Pago",
    value: "paid",
  },
  {
    label: "Vencido",
    value: "overdue",
  },
  {
    label: "Cancelado",
    value: "cancelled",
  }
] as SelectField<SupplierBillStatus | "">[];

export const SupplierBillList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [supplierBills, setSupplierBills] = React.useState<Array<SupplierBill>>([]);
  const [count, setCount] = React.useState<number>();
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [selectedRowID, setSelectedRowID] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [statusSelected, setStatusSelected] = React.useState<SelectField<SupplierBillStatus | ""> | null>(statuses[0]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<SupplierBill | undefined>();
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
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

  const querySupplierBills = () => {
    setLoading(true);
    getSupplierBills({
      userID: user.id,
      pageSize,
      supplierID: selectedSupplier?.id ?? undefined,
      status: statusSelected?.value || undefined,
      dateRange: {
        startDate: startDate ? getDateStartTimestamp(startDate) : undefined,
        endDate: endDate ? getDateEndTimestamp(endDate) : undefined,
      },
      cursor: page > 0 ? currentCursor : undefined,
    }).then(result => {
      const newSupplierBills = result.supplierBills;
      setSupplierBills(newSupplierBills);
      setCount(result.count.count);
      
      // Store cursor for next page
      if (newSupplierBills.length > 0) {
        setCurrentCursor(newSupplierBills[newSupplierBills.length - 1]);
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
    querySupplierBills();
  }, [user, selectedSupplier, pageSize, statusSelected, startDate, endDate, page]);

  const handleSupplierSelection = (_: React.SyntheticEvent<Element, Event>, value: Supplier) => {
    setSelectedSupplier(value);
  };

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField<SupplierBillStatus | "">) => {
    setStatusSelected(value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  }

  const handleRowSelectionChange = (rowId: string | null) => {
    setSelectedRowID(rowId || undefined);
  }

  const handleDeleteSupplierBill = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete functionality
    querySupplierBills();
    setDeleteDialogOpen(false);
  };

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
    setStatusSelected(statuses[0]);
    setTimeout(() => supplierFilterRef.current?.focus(), 100);
  };

  const handleEditSelected = () => {
    if (selectedRowID) {
      navigate(`/supplier-bills/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/supplier-bills/create');
  };

  const handleRefresh = () => {
    querySupplierBills();
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
    tableData: supplierBills,
    onTableRowSelect: setSelectedRowID,
    getRowId: (supplierBill: SupplierBill) => supplierBill.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteSupplierBill,
    onCreateNew: handleCreateNew,
    onRefresh: handleRefresh,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onShowHelp: () => setShowHelp(true),
    hasSelectedItem: !!selectedRowID,
    canToggleStatus: false, // Supplier bills don't have status toggle
    hasNextPage: count ? (page + 1) * pageSize < count : false,
    hasPreviousPage: page > 0,
  });

  return (
    <>
      <PageTitle 
        showKeyboardHelp={true}
        keyboardHelpTitle="Atalhos do Teclado - Contas a Pagar"
        helpOpen={showHelp}
        onHelpOpenChange={setShowHelp}
      >
        Contas a Pagar
      </PageTitle>
      
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={6} md={2}>
          <DatePicker
            label="Data início"
            value={startDate}
            onChange={setStartDate}
            ref={startDateRef}
            slotProps={{ 
              textField: { 
                fullWidth: true,
              } 
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <DatePicker
            label="Data fim"
            value={endDate}
            onChange={setEndDate}
            ref={endDateRef}
            slotProps={{ 
              textField: { 
                fullWidth: true,
              } 
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EnhancedAutocomplete
            ref={statusFilterRef}
            id="status-filter"
            options={statuses}
            getOptionLabel={(option: SelectField<SupplierBillStatus | "">) => option.label}
            label="Status"
            isOptionEqualToValue={(option: SelectField<SupplierBillStatus | "">, value: SelectField<SupplierBillStatus | "">) =>
              option.value === value?.value
            }
            onChange={handleStatusSelection}
            onNextField={focusNavigation.focusFirstTableRow}
            onPreviousField={() => focusNavigation.focusPreviousField(statusFilterRef)}
            value={statusSelected}
          />
        </Grid>
      </Grid>

      <Grid xs={12} item style={{ minHeight: 400 }}>
        <CustomDataTable
          data={supplierBills}
          columns={columns}
          totalCount={count}
          loading={loading}
          selectedRowId={selectedRowID}
          onRowSelectionChange={handleRowSelectionChange}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowDoubleClick={(supplierBill) => navigate(`/supplier-bills/${supplierBill.id}`)}
          onNavigateToNextField={() => {
            // Navigate to next component after table (could be action buttons)
          }}
          onNavigateToPreviousField={() => {
            // Navigate back to status filter
            focusNavigation.focusLastFieldBeforeTable();
          }}
          getRowId={(supplierBill) => supplierBill.id}
          onEditSelected={handleEditSelected}
          onDeleteSelected={handleDeleteSupplierBill}
          ref={tableRef}
        />
      </Grid>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="conta a pagar"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Contas a Pagar"
        showInactivate={false}
      />
    </>
  );
}; 