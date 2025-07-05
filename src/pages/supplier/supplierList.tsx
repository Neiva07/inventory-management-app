import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { Autocomplete, Button, Grid, InputAdornment, TextField } from '@mui/material';
import { ProductCategory, getProductCategories } from 'model/productCategories';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { Supplier, getSuppliers, deactiveSupplier, deleteSupplier } from 'model/suppliers';
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
  { field: 'tradeName', headerName: 'Nome Fantasia', flex: 1 },
  { field: 'legalName', headerName: 'Razão Social', flex: 1 },
  { field: 'description', headerName: 'Descrição', flex: 1 },
  { field: 'companyPhone', headerName: 'Telefone', flex: 1 },
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

export const SupplierList = () => {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [count, setCount] = React.useState<number>();
  const [searchTitle, setSearchTitle] = React.useState<string>('');
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory>();
  const [statusSelected, setStatusSelected] = React.useState<SelectField<string>>();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<Supplier | undefined>();

  const navigate = useNavigate();

  React.useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user]);

  const querySuppliers = () => {
    setLoading(true);
    getSuppliers({
      userID: user.id,
      pageSize,
      tradeName: searchTitle,
      productCategory: categorySelected,
      cursor: page > 0 ? currentCursor : undefined,
      status: statusSelected?.value
    }).then(result => {
      const newSuppliers = result[0].docs.map(qr => qr.data() as Supplier);
      setSuppliers(newSuppliers);
      setCount(result[1].count);
      
      // Store cursor for next page
      if (newSuppliers.length > 0) {
        setCurrentCursor(newSuppliers[newSuppliers.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  // Reset cursor and page when filters change
  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, searchTitle, categorySelected, statusSelected, pageSize]);

  React.useEffect(() => {
    querySuppliers();
  }, [user, searchTitle, categorySelected, pageSize, statusSelected, page]);

  const handleSearchTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value)
  }

  const handleCategorySelect = (event: React.SyntheticEvent<Element, Event>, value: ProductCategory) => {
    setCategorySelected(value)
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
  const handleDeactivateSupplier = () => {
    deactiveSupplier(selectedRowID)
    querySuppliers();
  }
  const handleDeleteSupplier = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteSupplier(selectedRowID)
    querySuppliers();
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  console.log({page, pageSize, count, tamanho:suppliers.length, currentCursor, statusSelected, categorySelected, searchTitle})

  return (
    <>
      <PageTitle>Fornecedores</PageTitle>
      <Grid spacing={2} container>

        <Grid item xs={4}>
          <TextField
            value={searchTitle}
            fullWidth
            onChange={handleSearchTitle}
            placeholder={"Busque pelo nome do fornecedor..."}
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
        <Grid item xs={4}>
          <Autocomplete
            id="category-filter"
            options={categories}
            getOptionLabel={(option) => option.name}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                label="Categoria"
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id
            }
            onChange={handleCategorySelect}
          />
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
          <Button fullWidth disabled={!selectedRowID} onClick={() => navigate(`/suppliers/${selectedRowID}`)}
          > Editar Fornecedor </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeleteSupplier}
          > Deletar Fornecedor </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeactivateSupplier}
          > Desativar Fornecedor </Button>
        </Grid>

        <Grid item xs={3}>
          <Button fullWidth onClick={() => navigate(`/suppliers/create`)}
          > Cadastrar Fornecedor </Button>
        </Grid>


        <Grid xs={12} item marginTop="20px">
          <div style={{ height: '100%', minHeight: 400 }}>
            <DataGrid
              rows={suppliers}
              columns={columns}
              pageSizeOptions={[5,10, 20]}
              paginationModel={{ page, pageSize }}
              onRowSelectionModelChange={handleRowSelection}
              onPaginationModelChange={handlePaginationModelChange}
              onRowDoubleClick={(params) => navigate(`/suppliers/${params.row.id}`)}
              hideFooterSelectedRowCount
              rowCount={count ?? 0}
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
        resourceName="fornecedor"
      />
    </>
  );
}
