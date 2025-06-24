import * as React from 'react';
import { DataGrid, GridCellParams, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { deleteInboundOrder, getInboundOrders, InboundOrder, InboundOrderStatus } from 'model/inboundOrder';
import { Autocomplete, Button, Grid, TextField, Skeleton, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Supplier, getSuppliers } from 'model/suppliers';
import { useAuth } from 'context/auth';
import { statuses } from './useInboundOrderForm';
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
    field: 'supplier.name',
    headerName: 'Fornecedor',
    flex: 1,
    valueGetter: (params: GridCellParams<InboundOrder>) => {
      return params.row.supplier.name
    }
  },
  {
    field: 'createdAt',
    headerName: 'Data de Compra',
    flex: 1,
    valueGetter: (params: GridCellParams<InboundOrder>) => {
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

export const InboundOrderList = () => {
  const { user } = useAuth();

  const [inboundOrders, setInboundOrders] = React.useState<Array<InboundOrder>>([]);
  const [count, setCount] = React.useState<number>();
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier>();
  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [statusSelected, setStatusSelected] = React.useState<InboundOrderStatus>();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    getSuppliers({ pageSize: 10000, userID: user.id }).then(queryResult => setSuppliers(queryResult[0].docs.map(qr => qr.data() as Supplier)))
  }, [user]);

  const queryInboundOrders = React.useCallback(() => {
    setLoading(true);
    getInboundOrders({
      pageSize,
      dateRange: {
        startDate: startDate?.getTime(),
        endDate: endDate?.getTime(),
      },
      userID: user.id,
      supplierID: selectedSupplier?.id,
      cursor: inboundOrders[-1],
      status: statusSelected,
    }).then(result => {
      setInboundOrders(result.inboundOrders)
      setCount(result.count.count)
    }).finally(() => {
      setLoading(false);
    });
  }, [startDate, endDate, selectedSupplier, pageSize, statusSelected])

  React.useEffect(() => {
    queryInboundOrders();
  }, [startDate, endDate, selectedSupplier, statusSelected]);

  const handleSupplierSelection = (_: React.SyntheticEvent<Element, Event>, value: Supplier) => {
    setSelectedSupplier(value)
  }
  const handleStatusSelection = (_: React.SyntheticEvent<Element, Event>, value: SelectField) => {
    setStatusSelected(value?.value as InboundOrderStatus)
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

  const handleDeleteInboundOrder = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteInboundOrder(selectedRowID)
    queryInboundOrders();
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  return (
    <>
      <PageTitle>Compras</PageTitle>
      <Grid spacing={2} container>
        <Grid item xs={4}>
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
          <Button fullWidth disabled={!selectedRowID} onClick={() => navigate(`/inbound-orders/${selectedRowID}`)}
          > Editar Compra </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeleteInboundOrder}
          > Deletar Compra </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth onClick={() => navigate(`/inbound-orders/create`)}
          > Cadastrar Compra </Button>
        </Grid>

        <Grid xs={12} item marginTop="20px">
          <div style={{ height: '100%', minHeight: 400 }}>
            <DataGrid
              rows={inboundOrders}
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
              onRowDoubleClick={(params) => navigate(`/inbound-orders/${params.row.id}`)}
              hideFooterSelectedRowCount
              rowCount={count ?? 0}
              rowSelectionModel={selectedRowID ? [selectedRowID] : []}
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
        resourceName="compra"
      />
    </>
  )
} 