import * as React from 'react';
import { DataGrid, GridCellParams, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { deactiveProduct, deleteProduct, getProducts, Product } from 'model/products';
import { Autocomplete, Button, Grid, InputAdornment, TextField, Skeleton, Typography, Box } from '@mui/material';
import { ProductCategory, getProductCategories } from 'model/productCategories';
import { useNavigate } from 'react-router-dom';
import { SelectField } from './useProductCreateForm';
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
  { field: 'title', headerName: 'Nome', flex: 1 },
  {
    field: 'inventory',
    headerName: 'Estoque',
    type: 'number',
    flex: 1,
  },
  {
    field: 'productCategory.name',
    headerName: 'Categoria',
    type: 'string',
    flex: 1,
    valueGetter: (params: GridCellParams<Product>) => {
      return params.row.productCategory.name
    }
  },
  {
    field: 'cost',
    headerName: 'Custo Compra',
    type: 'number',
    sortable: false,
    flex: 1,
    renderCell: (params) => {
      return params.row.cost
    }
  },
  {
    field: 'baseUnit',
    headerName: 'Unidade Base',
    sortable: false,
    flex: 1,
    renderCell: (params: GridCellParams<Product>) => {
      return params.row.baseUnit.name
    }
  },
  {
    field: 'minInventory',
    headerName: 'Estoque Mínimo',
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

export const ProductList = () => {

  const { user } = useAuth();

  const [products, setProducts] = React.useState<Array<Product>>([]);
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
  const [currentCursor, setCurrentCursor] = React.useState<Product | undefined>();

  const navigate = useNavigate();

  React.useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user.id]);

  const queryProducts = () => {
    setLoading(true);
    getProducts({
      pageSize,
      title: searchTitle,
      productCategory: categorySelected,
      userID: user.id,
      cursor: page > 0 ? currentCursor : undefined,
      status: statusSelected?.value
    }).then(result => { 
      const newProducts = result[0].map(p => p as Product);
      setProducts(newProducts);
      setCount(result[1].count);

      // Store cursor for next page
      if (newProducts.length > 0) {
        setCurrentCursor(newProducts[newProducts.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  // Reset cursor and page when filters change
  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, searchTitle, categorySelected, statusSelected]);

  React.useEffect(() => {
    queryProducts();
  }, [user, searchTitle, categorySelected, pageSize, statusSelected, page]);

  const handleSearchTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value)
  }

  const handleCategorySelect = (_: React.SyntheticEvent<Element, Event>, value: ProductCategory) => {
    setCategorySelected(value)
  }
  const handleStatusSelection = (_: React.SyntheticEvent<Element, Event>, value: SelectField) => {
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
  const handleDeactivateProduct = () => {
    deactiveProduct(selectedRowID)
    queryProducts();
  }
  const handleDeleteProduct = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteProduct(selectedRowID)
    queryProducts();
    setDeleteDialogOpen(false);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  }

  console.log(page, pageSize, count, products.length, currentCursor, statusSelected, categorySelected, searchTitle)

  return (
    <>
      <PageTitle>Produtos</PageTitle>
      <Grid spacing={1} container>

        <Grid item xs={4}>
          <TextField
            value={searchTitle}
            fullWidth
            onChange={handleSearchTitle}
            placeholder={"Busque pelo nome do produto..."}
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
          <Button fullWidth disabled={!selectedRowID} onClick={() => navigate(`/products/${selectedRowID}`)}
          > Editar Produto </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeleteProduct}
          > Deletar Produto </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeactivateProduct}
          > Desativar Produto </Button>
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth onClick={() => navigate(`/products/create`)}
          > Cadastrar Produto </Button>
        </Grid>

        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <DataGrid
            rows={products}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 20]}
            paginationModel={{ page, pageSize }}
            onRowSelectionModelChange={handleRowSelection}
            onPaginationModelChange={handlePaginationModelChange}
            onRowDoubleClick={(params) => navigate(`/products/${params.row.id}`)}
            hideFooterSelectedRowCount
            rowCount={count ?? 0}
            rowSelectionModel={[selectedRowID]} 
            paginationMode="server"
            loading={loading}
            disableColumnMenu
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          />
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="produto"
      />
    </>
  );
}
