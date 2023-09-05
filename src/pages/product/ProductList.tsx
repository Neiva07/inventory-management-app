import * as React from 'react';
import { DataGrid, GridCellParams, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { deactiveProduct, deleteProduct, getProducts, Product } from '../../model/products';
import { Autocomplete, Button, Grid, InputAdornment, TextField } from '@mui/material';
import { ProductCategory, getProductCategories } from '../../model/productCategories';
import { useNavigate } from 'react-router-dom';
import { SelectField } from './useProductCreateForm';
import { useAuth } from 'context/auth';

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 200 },
  { field: 'title', headerName: 'Nome', width: 200 },
  {
    field: 'inventory',
    headerName: 'Estoque',
    type: 'number',
    width: 140,
  },
  {
    field: 'productCategory.name',
    headerName: 'Categoria',
    type: 'string',
    width: 140,
    valueGetter: (params: GridCellParams<Product>) => {
      return params.row.productCategory.name
    }
  },
  {
    field: 'cost',
    headerName: 'Custo Compra',
    type: 'number',
    sortable: false,
    width: 140,
    renderCell: (params) => {

      return params.row.cost
    }
  },
  {
    field: 'buyUnit',
    headerName: 'Unidade Compra',
    sortable: false,
    width: 140,
    renderCell: (params: GridCellParams<Product>) => {

      return params.row.buyUnit.name
    }
  },
  {
    field: 'minInventory',
    headerName: 'Estoque Mínimo',
    type: 'number',
    width: 140,
  },
  {
    field: 'status',
    headerName: 'Status',
    type: 'string',
    width: 140,
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

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory>();
  const [statusSelected, setStatusSelected] = React.useState<SelectField<string>>();
  const [pageSize, setPageSize] = React.useState<number>(10);

  const navigate = useNavigate();

  React.useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user.id]);


  const queryProducts = React.useCallback(() => {
    getProducts({
      pageSize,
      title: searchTitle,
      productCategory: categorySelected,
      userID: user.id,
      cursor: products[-1],
      status: statusSelected?.value
    }).then(result => {

      setProducts(result[0].docs.map(qr => qr.data() as Product))
      setCount(result[1].data().count)
    }
    )

  }, [user, searchTitle, categorySelected, pageSize, statusSelected])


  React.useEffect(() => {
    queryProducts();
  }, [user, searchTitle, categorySelected, pageSize, statusSelected]);

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
  const handleDeactivateProduct = () => {
    deactiveProduct(selectedRowID)
    queryProducts();
  }
  const handleDeleteProduct = () => {
    deleteProduct(selectedRowID)
    queryProducts();
  }

  return (
    <>
      <Grid spacing={2} container>

        <Grid item xs={4}>
          <TextField
            value={searchTitle}
            fullWidth
            onChange={handleSearchTitle}
            placeholder={"Busque pelo nome do produto..."}
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
                paginationModel: { page: 0, pageSize },
              },
            }}
            pageSizeOptions={[10, 20]}
            pagination
            onRowSelectionModelChange={handleRowSelection}
            onPaginationModelChange={handlePaginationModelChange}
            hideFooterSelectedRowCount
            rowCount={count}
            rowSelectionModel={[selectedRowID]}
            paginationMode="server"
            disableColumnMenu
          // local text is the prop in which defines the text to translate
          // localetext={}
          // checkboxSelection
          />
        </Grid>
      </Grid>
    </>
  );
}
