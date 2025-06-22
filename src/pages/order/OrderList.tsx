import * as React from 'react';
import { DataGrid, GridCellParams, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { deleteOrder, getOrders, Order, OrderStatus } from 'model/orders';
import { Autocomplete, Button, Grid, TextField, Skeleton, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Customer, getCustomers } from 'model/customer';
import { useAuth } from 'context/auth';
import { statuses } from './useOrderForm';
import { DatePicker } from '@mui/x-date-pickers';
import { SelectField } from 'pages/product/useProductCreateForm';
import { format } from "date-fns"
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from 'components/PageTitle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';

const columns: GridColDef[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  {
    field: 'customer.name',
    headerName: 'Cliente',
    flex: 1,
    valueGetter: (params: GridCellParams<Order>) => {
      return params.row.customer.name
    }
  },
  {
    field: 'createdAt',
    headerName: 'Data de Venda',
    flex: 1,
    valueGetter: (params: GridCellParams<Order>) => {
      return format(params.row.orderDate ?? params.row.createdAt, 'dd/MM/yyyy')
    }
  },
  {
    field: 'totalCost',
    headerName: 'Total',
    type: 'number',
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    type: 'string',
    flex: 1,
  }
];

export const OrderList = () => {
  const { user } = useAuth();

  const [orders, setOrders] = React.useState<Array<Order>>([]);
  const [count, setCount] = React.useState<number>();
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer>();
  const [customers, setCustomers] = React.useState<Array<Customer>>([]);
  const [statusSelected, setStatusSelected] = React.useState<OrderStatus>();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    getCustomers({ pageSize: 10000, userID: user.id }).then(queryResult => setCustomers(queryResult[0].docs.map(qr => qr.data() as Customer)))
  }, [user]);

  const queryOrders = React.useCallback(() => {
    setLoading(true);
    getOrders({
      pageSize,
      dateRange: {
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
      },
      userID: user.id,
      customerID: selectedCustomer?.id,
      cursor: orders[-1],
      status: statusSelected,
    }).then(result => {
      setOrders(result.orders)
      setCount(result.count.count)
    }).finally(() => {
      setLoading(false);
    });
  }, [startDate, endDate, selectedCustomer, pageSize, statusSelected])

  React.useEffect(() => {
    queryOrders();
  }, [startDate, endDate, selectedCustomer, statusSelected]);

  const handleCustomerSelection = (_: React.SyntheticEvent<Element, Event>, value: Customer) => {
    setSelectedCustomer(value)
  }
  const handleStatusSelection = (_: React.SyntheticEvent<Element, Event>, value: SelectField) => {
    setStatusSelected(value?.value as OrderStatus)
  }

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageSize(model.pageSize)
  }
  const handleRowSelection = (rowSelection: GridRowSelectionModel) => {
    if (rowSelection && rowSelection[0]) {
      const id = String(rowSelection[0])
      if (id === selectedRowID) {
        setSelectedRowID(null);
      } else {
        setSelectedRowID(id);
      }
    }
  }

  const handleDeleteOrder = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteOrder(selectedRowID)
    queryOrders();
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  return (
    <>
      <PageTitle>Vendas</PageTitle>
      <Grid spacing={2} container>
        <Grid item xs={4}>
          <Autocomplete
            id="customer-filter"
            options={customers}
            getOptionLabel={(option) => option.name}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                label="Cliente"
                autoFocus
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id
            }
            onChange={handleCustomerSelection}
          />
        </Grid>
        <Grid item xs={2}>
          <DatePicker value={startDate} label="Inicio" onChange={e => setStartDate(e)} />
        </Grid>
        <Grid item xs={2}>
          <DatePicker value={endDate} label="Fim" onChange={e => setEndDate(e)} />
        </Grid>

        <Grid item xs={4}>
          <Autocomplete
            id="status-filter"
            options={statuses}
            getOptionLabel={(option) => option.label}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                label="Status"
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onChange={handleStatusSelection}
          />
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={() => navigate(`/orders/${selectedRowID}`)}
          > Editar Venda </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeleteOrder}
          > Deletar Venda </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth onClick={() => navigate(`/orders/create`)}
          > Cadastrar Venda </Button>
        </Grid>

        <Grid xs={12} item marginTop="20px">
          <div style={{ height: '100%', minHeight: 400 }}>
            <DataGrid
              rows={orders}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize },
                },
              }}
              pageSizeOptions={[10, 20]}
              pagination
              onRowSelectionModelChange={handleRowSelection}
              onPaginationModelChange={handlePaginationModelChange}
              onRowDoubleClick={(params) => navigate(`/orders/${params.row.id}`)}
              hideFooterSelectedRowCount
              rowCount={count || 0}
              rowSelectionModel={[selectedRowID]}
              paginationMode="server"
              loading={loading}
              localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            />
          </div>
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="venda"
      />
    </>
  );
}
