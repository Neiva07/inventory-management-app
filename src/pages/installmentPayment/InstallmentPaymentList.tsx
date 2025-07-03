import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { Button, Grid, InputAdornment, TextField, Box, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { InstallmentPayment, getInstallmentPayments, InstallmentPaymentStatus } from '../../model/installmentPayment';
import { useAuth } from '../../context/auth';
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from '../../components/PageTitle';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';
import { formatCurrency } from 'lib/math';
import { DatePicker } from '@mui/x-date-pickers';

const columns: GridColDef[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  { 
    field: 'installmentNumber', 
    headerName: 'Parcela', 
    width: 100,
  },
  { 
    field: 'amount', 
    headerName: 'Valor', 
    width: 150,
    valueFormatter: (params) => formatCurrency(params.value),
  },
  { 
    field: 'paymentMethod.label', 
    headerName: 'Forma de Pagamento', 
    width: 180,
    valueGetter: (params) => params.row.paymentMethod?.label || '',
  },
  {
    field: 'dueDate',
    headerName: 'Vencimento',
    width: 150,
    valueFormatter: (params) => new Date(params.value).toLocaleDateString('pt-BR'),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
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
    width: 150,
    valueFormatter: (params) => params.value ? formatCurrency(params.value) : '-',
  },
  {
    field: 'paidAt',
    headerName: 'Data do Pagamento',
    width: 150,
    valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('pt-BR') : '-',
  },
];

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

  const [installmentPayments, setInstallmentPayments] = React.useState<Array<InstallmentPayment>>([]);
  const [count, setCount] = React.useState<number>();
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [statusSelected, setStatusSelected] = React.useState<SelectField<InstallmentPaymentStatus | ""> | null>(statuses[0]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const queryInstallmentPayments = React.useCallback(() => {
    setLoading(true);
    getInstallmentPayments({
      userID: user.id,
      pageSize,
      status: statusSelected?.value || undefined,
      dateRange: {
        startDate: startDate ? startDate.getTime() : undefined,
        endDate: endDate ? endDate.getTime() : undefined,
      },
      cursor: installmentPayments[-1],
    }).then(result => {
      setInstallmentPayments(result.installmentPayments);
      setCount(result.count.count);
    }).finally(() => {
      setLoading(false);
    });
  }, [user, pageSize, statusSelected, installmentPayments, startDate, endDate]);

  React.useEffect(() => {
    queryInstallmentPayments();
  }, [user, pageSize, statusSelected, startDate, endDate]);

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField<InstallmentPaymentStatus | "">) => {
    setStatusSelected(value);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
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

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <PageTitle>Parcelas</PageTitle>
      
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
            onChange={(_, value) => setStatusSelected(value)}
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
        pagination
        rowCount={count ?? 0}
        paginationModel={{ page: 0, pageSize }}
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