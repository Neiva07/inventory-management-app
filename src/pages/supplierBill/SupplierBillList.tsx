import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { Button, Grid, TextField, Box, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { SupplierBill, getSupplierBills, SupplierBillStatus } from '../../model/supplierBill';
import { Supplier, getSuppliers } from 'model/suppliers';
import { useAuth } from '../../context/auth';
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from '../../components/PageTitle';
import { DeleteConfirmationDialog } from '../../components/DeleteConfirmationDialog';
import { formatCurrency } from 'lib/math';
import { DatePicker } from '@mui/x-date-pickers';
import { getDateStartTimestamp, getDateEndTimestamp } from '../../lib/date';

const columns: GridColDef[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  { 
    field: 'supplier.supplierName', 
    headerName: 'Fornecedor', 
    flex: 1,
    valueGetter: (params) => params.row.supplier?.supplierName ?? '',
  },
  { 
    field: 'inboundOrder.publicId', 
    headerName: 'Pedido', 
    width: 150,
    valueGetter: (params) => params.row.inboundOrder?.publicId ?? '',
  },
  { 
    field: 'totalValue', 
    headerName: 'Valor Total', 
    width: 150,
    valueFormatter: (params) => formatCurrency(params.value),
  },
  { 
    field: 'initialCashInstallment', 
    headerName: 'Entrada', 
    width: 120,
    valueFormatter: (params) => formatCurrency(params.value),
  },
  { 
    field: 'remainingValue', 
    headerName: 'Restante', 
    width: 120,
    valueFormatter: (params) => formatCurrency(params.value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => {
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
      return (
        <Box
          sx={{
            backgroundColor: statusColors[params.value as keyof typeof statusColors] ?? '#757575',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {statusLabels[params.value as keyof typeof statusLabels] ?? params.value}
        </Box>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Data de Criação',
    width: 150,
    valueFormatter: (params) => new Date(params.value).toLocaleDateString('pt-BR'),
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
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier>();
  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [statusSelected, setStatusSelected] = React.useState<SelectField<SupplierBillStatus | ""> | null>(statuses[0]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    getSuppliers({ pageSize: 10000, userID: user.id }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, [user]);

  console.log(statusSelected, supplierBills);

  const querySupplierBills = React.useCallback(() => {
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
      cursor: supplierBills[-1],
    }).then(result => {
      setSupplierBills(result.supplierBills);
      setCount(result.count.count);
    }).finally(() => {
      setLoading(false);
    });
  }, [user, selectedSupplier, pageSize, statusSelected, supplierBills, startDate, endDate]);

  React.useEffect(() => {
    querySupplierBills();
  }, [user, selectedSupplier, pageSize, statusSelected, startDate, endDate]);

  const handleSupplierSelection = (_: React.SyntheticEvent<Element, Event>, value: Supplier) => {
    setSelectedSupplier(value);
  };

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField<SupplierBillStatus | "">) => {
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

  const handleRowDoubleClick = (params: any) => {
    navigate(`/supplier-bills/${params.row.id}`);
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <PageTitle>Contas a Pagar</PageTitle>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Autocomplete
            id="supplier-filter"
            options={suppliers}
            getOptionLabel={(option) => option.tradeName}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                label="Fornecedor"
                autoFocus
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id
            }
            onChange={handleSupplierSelection}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <DatePicker
            label="Data início"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <DatePicker
            label="Data fim"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
        rows={supplierBills}
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
        resourceName="conta a pagar"
      />
    </Box>
  );
}; 