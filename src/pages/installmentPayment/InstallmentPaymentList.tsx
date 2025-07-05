import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { Grid, TextField, Box, Autocomplete, IconButton, Tooltip } from '@mui/material';
import { Payment, Visibility, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { InstallmentPayment, getInstallmentPayments, InstallmentPaymentStatus } from '../../model/installmentPayment';
import { useAuth } from '../../context/auth';
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from '../../components/PageTitle';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';
import { PaymentModal } from '../../components/PaymentModal';
import { formatCurrency } from 'lib/math';
import { DatePicker } from '@mui/x-date-pickers';
import { useOverdueCheck } from '../../lib/overdueCheck';
import { getDateStartTimestamp, getDateEndTimestamp } from '../../lib/date';

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
  // Define columns inside component to access navigate function
  const columns: GridColDef[] = [
    { 
      field: 'publicId', 
      headerName: 'ID', 
      width: 180,
      minWidth: 150,
    },
    { 
      field: 'installmentNumber', 
      headerName: '# Parcela', 
      width: 80,
      minWidth: 80,
    },
    { 
      field: 'amount', 
      headerName: 'Valor a Pagar', 
      width: 120,
      minWidth: 100,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    { 
      field: 'paymentMethod.label', 
      headerName: 'Forma de Pagamento', 
      width: 160,
      minWidth: 140,
      valueGetter: (params) => params.row.paymentMethod?.label || '',
    },
    {
      field: 'dueDate',
      headerName: 'Vencimento',
      width: 120,
      minWidth: 100,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('pt-BR'),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      minWidth: 90,
      renderCell: (params) => {
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
        return (
          <Box
            sx={{
              backgroundColor: statusColors[params.value as keyof typeof statusColors] || '#757575',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {statusLabels[params.value as keyof typeof statusLabels] || params.value}
          </Box>
        );
      },
    },
    {
      field: 'paidAmount',
      headerName: 'Valor Pago',
      width: 120,
      minWidth: 100,
      valueFormatter: (params) => params.value ? formatCurrency(params.value) : '-',
    },
    {
      field: 'paidAt',
      headerName: 'Data do Pagamento',
      width: 130,
      minWidth: 110,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('pt-BR') : '-',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      minWidth: 90,
      sortable: false,
      renderCell: (params) => {
        const installment = params.row as InstallmentPayment;
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

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleRowSelection = (rowSelection: GridRowSelectionModel) => {
    if (rowSelection && rowSelection[0]) {
      const id = String(rowSelection[0]);
      if (id === selectedRowID) {
        setSelectedRowID(null);
      } else {
        setSelectedRowID(id);
      }
    }
  };

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

  const handleRowDoubleClick = (params: any) => {
    navigate(`/installment-payments/${params.row.id}`);
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

  console.log(page, pageSize, count, installmentPayments.length, currentCursor, statusSelected, startDate, endDate)

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <PageTitle>Parcelas</PageTitle>
        <Tooltip title="Verificar vencimentos">
          <IconButton onClick={handleRefreshOverdue} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <DatePicker
            label="Data início"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <DatePicker
            label="Data fim"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            id="status-filter"
            options={statuses}
            getOptionLabel={(option) => option.label}
            value={statusSelected}
            onChange={(_, value) => {
              setStatusSelected(value);
            }}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField {...params} label="Status" fullWidth variant="outlined" />
            )}
          />
        </Grid>
      </Grid>

      <DataGrid
        rows={installmentPayments}
        columns={columns}
        rowCount={count ?? 0}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 25, 50]}
        rowSelectionModel={selectedRowID ? [selectedRowID] : []}
        onRowSelectionModelChange={handleRowSelection}
        onRowDoubleClick={handleRowDoubleClick}
        loading={loading}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        disableRowSelectionOnClick
        paginationMode="server"
        getRowId={(row) => row.id}
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '0.875rem',
            fontWeight: 600,
          },
        }}
      />

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
      />
    </Box>
  );
}; 