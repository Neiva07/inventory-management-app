import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { Autocomplete, Button, Grid, InputAdornment, TextField} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { Customer, deactiveCustomer, deleteCustomer, getCustomers } from 'model/customer';
import { useAuth } from 'context/auth';
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from 'components/PageTitle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';

const columns: GridColDef[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  { field: 'name', headerName: 'Nome', flex: 1 },
  { field: 'cpf', headerName: 'CPF', flex: 1 },
  { field: 'rg', headerName: 'RG', flex: 1 },
  { field: 'phone', headerName: 'Telefone', flex: 1 },
  {
    field: 'status',
    headerName: 'Status',
    type: 'string',
    flex: 1,
  }
];

const statuses = [
  {
    label: "Ativo",
    value: "active",
  },
  {
    label: "Inativo",
    value: "inactive",
  },
  {
    label: "Todos",
    value: "",
  }
] as SelectField<string>[]

export const CustomerList = () => {
  const { user } = useAuth();

  const [customers, setCustomers] = React.useState<Array<Customer>>([]);
  const [count, setCount] = React.useState<number>();
  const [searchName, setSearchName] = React.useState<string>('');
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [statusSelected, setStatusSelected] = React.useState<SelectField<string>>();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<Customer | undefined>();

  const navigate = useNavigate();

  const queryCustomers = () => {
    setLoading(true);
    getCustomers({
      userID: user.id,
      pageSize,
      name: searchName,
      cursor: page > 0 ? currentCursor : undefined,
      status: statusSelected?.value
    }).then(result => {
      const newCustomers = result[0].docs.map(qr => qr.data() as Customer);
      setCustomers(newCustomers);
      setCount(result[1].count);
      
      // Store cursor for next page
      if (newCustomers.length > 0) {
        setCurrentCursor(newCustomers[newCustomers.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  // Reset cursor and page when filters change
  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, searchName, statusSelected]);

  React.useEffect(() => {
    queryCustomers();
  }, [user, searchName, pageSize, statusSelected, page]);

  const handleSearchName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value)
  }

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField) => {
    setStatusSelected(value)
  }

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
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
  const handleDeactiveCustomer = () => {
    deactiveCustomer(selectedRowID)
    queryCustomers();
  }
  const handleDeleteCustomer = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteCustomer(selectedRowID)
    queryCustomers();
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  console.log(page, pageSize, count, customers.length, currentCursor, statusSelected, searchName)

  return (
    <>
      <PageTitle>Clientes</PageTitle>
      <Grid spacing={2} container>

        <Grid item xs={6}>
          <TextField
            value={searchName}
            fullWidth
            onChange={handleSearchName}
            placeholder={"Busque pelo nome do cliente..."}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GridSearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6}>
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
          <Button fullWidth disabled={!selectedRowID} onClick={() => navigate(`/customers/${selectedRowID}`)}
          > Editar Cliente </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeleteCustomer}
          > Deletar Cliente </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeactiveCustomer}
          > Desativar Cliente </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth onClick={() => navigate(`/customers/create`)}
          > Cadastrar Cliente </Button>
        </Grid>

        <Grid xs={12} item marginTop="20px">
          <div style={{ height: '100%', minHeight: 400 }}>
            <DataGrid
              rows={customers}
              columns={columns}
              pageSizeOptions={[10, 20]}
              paginationModel={{ page, pageSize }}
              onRowSelectionModelChange={handleRowSelection}
              onPaginationModelChange={handlePaginationModelChange}
              onRowDoubleClick={(params) => navigate(`/customers/${params.row.id}`)}
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
        resourceName="cliente"
      />
    </>
  );
}
