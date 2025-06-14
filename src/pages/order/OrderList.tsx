import * as React from 'react';
import { DataGrid, GridCellParams, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { deleteOrder, getOrders, Order, OrderStatus } from 'model/orders';
import { Autocomplete, Button, Grid, TextField, Skeleton, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Customer, getCustomers } from 'model/customer';
import { useAuth } from 'context/auth';
import { statuses } from './OrderFormHeader';
import { DatePicker } from '@mui/x-date-pickers';
import { SelectField } from 'pages/product/useProductCreateForm';
import { format } from "date-fns"
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from 'components/PageTitle';

const columns: GridColDef[] = [
  {
    field: 'customer',
    headerName: 'Cliente',
    flex: 1,
    sortable: false,
    valueGetter: (cell: GridCellParams<Order>) => {
      return cell.row.customer.name
    }
  },
  {
    field: 'createdAt',
    headerName: 'Data',
    type: 'string',
    flex: 1,
    sortable: false,
    valueGetter: (cell: GridCellParams<Order>) => {
      return format(new Date(cell.row.createdAt), "dd/MM/yyyy")
    }
  },
  {
    field: 'totalCost',
    headerName: 'Custo Total (R$)',
    type: 'number',
    flex: 1,
    sortable: false,
  },
  {
    field: 'totalComission',
    headerName: 'Comissão Total (R$)',
    type: 'number',
    flex: 1,
    sortable: false,
  },
  {
    field: 'dueDate',
    headerName: 'Vencimento',
    type: 'string',
    flex: 1,
    sortable: false,
    valueGetter: (cell: GridCellParams<Order>) => {
      return format(new Date(cell.row.dueDate), "dd/MM/yyyy")
    }
  },
  {
    field: 'paymentType',
    headerName: 'Tipo de pagamento',
    flex: 1,
    sortable: false,
    type: 'number',
    valueGetter: (cell: GridCellParams<Order>) => {
      return cell.row.paymentType.name
    }
  },
  {
    field: 'items',
    headerName: 'N de items',
    flex: 1,
    sortable: false,
    type: 'number',
    valueGetter: (cell: GridCellParams<Order>) => {
      return cell.row.items.length
    }
  }
  //sailsman
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
      setOrders(result[0].docs.map(qr => qr.data() as Order))
      setCount(result[1].data().count)
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
    deleteOrder(selectedRowID)
    queryOrders();
  }

  return (
    <>
      <PageTitle>Pedidos</PageTitle>
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
    </>
  );
}
