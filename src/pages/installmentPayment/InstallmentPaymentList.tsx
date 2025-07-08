import * as React from 'react';
import { Grid, TextField, Box, IconButton, Tooltip } from '@mui/material';
import { Payment, Visibility, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { InstallmentPayment, getInstallmentPayments, InstallmentPaymentStatus } from '../../model/installmentPayment';
import { useAuth } from '../../context/auth';
import { PageTitle } from '../../components/PageTitle';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';
import { PaymentModal } from '../../components/PaymentModal';
import { formatCurrency } from 'lib/math';
import { DatePicker } from '@mui/x-date-pickers';
import { useOverdueCheck } from '../../lib/overdueCheck';
import { getDateStartTimestamp, getDateEndTimestamp } from '../../lib/date';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { useListPageFocusNavigation } from 'hooks/listings/useListPageFocusNavigation';
import { KeyboardListPageKeyboardHelp } from 'components/KeyboardListPageKeyboardHelp';
import { CustomDataTable, CustomDataTableRef } from 'components/CustomDataTable';
import { ColumnDefinition } from 'components/CustomDataTable/types';

const statuses = [
  {
    label: "Todos",
    value: "",
  },
  {
    label: "Pendente",
    value: "pending",
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
] as SelectField<InstallmentPaymentStatus | "">[];

export const InstallmentPaymentList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { forceCheckOverdue } = useOverdueCheck();

  const [installmentPayments, setInstallmentPayments] = React.useState<Array<InstallmentPayment>>([]);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [selectedInstallment, setSelectedInstallment] = React.useState<InstallmentPayment | null>(null);
  const [count, setCount] = React.useState<number>();
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [statusSelected, setStatusSelected] = React.useState<SelectField<InstallmentPaymentStatus | ""> | null>(statuses[1]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<InstallmentPayment | undefined>();
  const [showHelp, setShowHelp] = React.useState(false);

  // Refs for focus navigation
  const startDateRef = React.useRef<HTMLDivElement>(null);
  const endDateRef = React.useRef<HTMLDivElement>(null);
  const statusFilterRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<CustomDataTableRef>(null);

  // Define columns inside component to access navigate function
  const columns: ColumnDefinition<InstallmentPayment>[] = [
    { 
      field: 'publicId', 
      headerName: 'ID', 
      width: 180,
    },
    { 
      field: 'installmentNumber', 
      headerName: '# Parcela', 
      width: 80,
    },
    { 
      field: 'amount', 
      headerName: 'Valor a Pagar', 
      width: 120,
      valueGetter: (row: InstallmentPayment) => formatCurrency(row.amount),
    },
    { 
      field: 'paymentMethod.label', 
      headerName: 'Forma de Pagamento', 
      width: 160,
      valueGetter: (row: InstallmentPayment) => row.paymentMethod?.label || '',
    },
    {
      field: 'dueDate',
      headerName: 'Vencimento',
      width: 120,
      valueGetter: (row: InstallmentPayment) => new Date(row.dueDate).toLocaleDateString('pt-BR'),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      valueGetter: (row: InstallmentPayment) => {
        const statusColors = {
          pending: '#ff9800',
          paid: '#2e7d32',
          overdue: '#d32f2f',
          cancelled: '#757575',
        };
        const statusLabels = {
          pending: 'Pendente',
          paid: 'Pago',
          overdue: 'Vencido',
          cancelled: 'Cancelado',
        };
        return {
          label: statusLabels[row.status as keyof typeof statusLabels] || row.status,
          color: statusColors[row.status as keyof typeof statusColors] || '#757575'
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
      field: 'paidAmount',
      headerName: 'Valor Pago',
      width: 120,
      valueGetter: (row: InstallmentPayment) => row.paidAmount ? formatCurrency(row.paidAmount) : '-',
    },
    {
      field: 'paidAt',
      headerName: 'Data do Pagamento',
      width: 130,
      valueGetter: (row: InstallmentPayment) => row.paidAt ? new Date(row.paidAt).toLocaleDateString('pt-BR') : '-',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      valueGetter: (row: InstallmentPayment) => row,
      renderCell: (value) => {
        const installment = value as InstallmentPayment;
        const canPay = installment.status === 'pending' || installment.status === 'overdue';
        
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Ver Detalhes">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/installment-payments/${installment.id}`);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {canPay && (
              <Tooltip title="Registrar Pagamento">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInstallment(installment);
                    setPaymentModalOpen(true);
                  }}
                >
                  <Payment fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const queryInstallmentPayments = () => {
    setLoading(true);
    getInstallmentPayments({
      userID: user.id,
      pageSize,
      status: statusSelected?.value || undefined,
      dateRange: {
        startDate: startDate ? getDateStartTimestamp(startDate) : undefined,
        endDate: endDate ? getDateEndTimestamp(endDate) : undefined,
      },
      cursor: page > 0 ? currentCursor : undefined,
    }).then(result => {
      setInstallmentPayments(result.installmentPayments);
      setCount(result.count.count);
      if (result.installmentPayments.length > 0) {
        setCurrentCursor(result.installmentPayments[result.installmentPayments.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, statusSelected, startDate, endDate]);

  // Query when dependencies change
  React.useEffect(() => {
    queryInstallmentPayments();
  }, [user, pageSize, statusSelected, startDate, endDate, page]);

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField<InstallmentPaymentStatus | "">) => {
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

  const handleDeleteInstallmentPayment = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete functionality
    queryInstallmentPayments();
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

  const handlePaymentRecorded = () => {
    queryInstallmentPayments();
  };

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
    setSelectedInstallment(null);
  };

  const handleRefreshOverdue = async () => {
    await forceCheckOverdue();
    queryInstallmentPayments();
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = () => {
    if (startDateRef.current) {
      const inputElement = startDateRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
        inputElement.select(); // Also select the text for easy replacement
      }
    }
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatusSelected(statuses[1]);
    setTimeout(() => startDateRef.current?.focus(), 100);
  };

  const handleEditSelected = () => {
    if (selectedRowID) {
      navigate(`/installment-payments/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/installment-payments/create');
  };

  const handleRefresh = () => {
    queryInstallmentPayments();
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
    fieldRefs: [startDateRef, endDateRef, statusFilterRef],
    tableRef,
    tableData: installmentPayments,
    onTableRowSelect: setSelectedRowID,
    getRowId: (installmentPayment: InstallmentPayment) => installmentPayment.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteInstallmentPayment,
    onCreateNew: handleCreateNew,
    onRefresh: handleRefresh,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onShowHelp: () => setShowHelp(true),
    hasSelectedItem: !!selectedRowID,
    canToggleStatus: false, // Installment payments don't have status toggle
    hasNextPage: count ? (page + 1) * pageSize < count : false,
    hasPreviousPage: page > 0,
  });

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <PageTitle 
          showKeyboardHelp={true}
          keyboardHelpTitle="Atalhos do Teclado - Parcelas"
          helpOpen={showHelp}
          onHelpOpenChange={setShowHelp}
        >
          Parcelas
        </PageTitle>
        <Tooltip title="Verificar vencimentos">
          <IconButton onClick={handleRefreshOverdue} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
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
        <Grid item xs={6} md={3}>
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
        <Grid item xs={12} md={6}>
          <EnhancedAutocomplete
            ref={statusFilterRef}
            id="status-filter"
            options={statuses}
            getOptionLabel={(option: SelectField<InstallmentPaymentStatus | "">) => option.label}
            label="Status"
            isOptionEqualToValue={(option: SelectField<InstallmentPaymentStatus | "">, value: SelectField<InstallmentPaymentStatus | "">) =>
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
          data={installmentPayments}
          columns={columns}
          totalCount={count}
          loading={loading}
          selectedRowId={selectedRowID}
          onRowSelectionChange={handleRowSelectionChange}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowDoubleClick={(installmentPayment) => navigate(`/installment-payments/${installmentPayment.id}`)}
          onNavigateToNextField={() => {
            // Navigate to next component after table (could be action buttons)
          }}
          onNavigateToPreviousField={() => {
            // Navigate back to status filter
            focusNavigation.focusLastFieldBeforeTable();
          }}
          getRowId={(installmentPayment) => installmentPayment.id}
          onEditSelected={handleEditSelected}
          onDeleteSelected={handleDeleteInstallmentPayment}
          ref={tableRef}
        />
      </Grid>

      <PaymentModal
        open={paymentModalOpen}
        onClose={handlePaymentModalClose}
        onPaymentRecorded={handlePaymentRecorded}
        installment={selectedInstallment}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="parcela"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Parcelas"
        showInactivate={false}
      />
    </>
  );
}; 