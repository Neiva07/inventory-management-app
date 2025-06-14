import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { Autocomplete, Button, Grid, InputAdornment, TextField} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { Customer, deactiveCustomer, deleteCustomer, getCustomers } from 'model/customer';
import { useAuth } from 'context/auth';
import { ptBR } from '@mui/x-data-grid/locales';
import { PageTitle } from 'components/PageTitle';

const columns: GridColDef[] = [
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

  const [statusSelected, setStatusSelected] = React.useState<SelectField<string>>();
  const [pageSize, setPageSize] = React.useState<number>(10);

  const navigate = useNavigate();

  const queryCustomers = React.useCallback(() => {
    setLoading(true);
    getCustomers({
      userID: user.id,
      pageSize,
      name: searchName,
      cursor: customers[-1],
      status: statusSelected?.value
    }).then(result => {
      setCustomers(result[0].docs.map(qr => qr.data() as Customer))
      setCount(result[1].data().count)
    }).finally(() => {
      setLoading(false);
    });
  }, [user, searchName, pageSize, statusSelected])

  React.useEffect(() => {
    queryCustomers();
  }, [user, searchName, pageSize, statusSelected]);

  const handleSearchName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value)
  }

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField) => {
    setStatusSelected(value)
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
  const handleDeactiveCustomer = () => {
    deactiveCustomer(selectedRowID)
    queryCustomers();
  }
  const handleDeleteCustomer = () => {
    deleteCustomer(selectedRowID)
    queryCustomers();
  }

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
