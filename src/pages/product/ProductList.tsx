import * as React from 'react';
import { DataGrid, GridCallbackDetails, GridCellParams, GridColDef, GridPaginationModel, GridSearchIcon, GridValueGetterParams } from '@mui/x-data-grid';
import { getProducts, Product } from '../../model/products';
import { Autocomplete, Grid, InputAdornment, TextField } from '@mui/material';
import { ProductCategory, getProductCategories } from '../../model/productCategories';

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 200 },
  { field: 'title', headerName: 'Nome', width: 200 },
  { field: 'description', headerName: 'Desrição', width: 200 },
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
    headerName: 'Custo de compra',
    type: 'number',
    sortable: false,
    width: 140,
    renderCell: (params) => {

      return <h5>{params.row.cost}</h5>
    }
  },
  {
    field: 'buyUnit',
    headerName: 'Unidade de compra',
    sortable: false,
    width: 140,
    renderCell: (params: GridCellParams<Product>) => {

      return <h5>{params.row.buyUnit.name}</h5>
    }
  },
  {
    field: 'minInventory',
    headerName: 'Estoque Mínimo',
    type: 'number',
    width: 140,
  }


];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export const ProductList = () => {

  const [products, setProducts] = React.useState<Array<Product>>([]);
  const [searchTitle, setSearchTitle] = React.useState<string>('');

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory>();
  const [page, setPage] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(10);

  React.useEffect(() => {
    getProductCategories().then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, []);


  React.useEffect(() => {
    getProducts(searchTitle, categorySelected).then(queryResult => setProducts(queryResult.docs.map(qr => qr.data() as Product)))
  }, [searchTitle, categorySelected, page, pageSize]);

  const handleSearchTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value)
  }

  const handleCategorySelect = (event: React.SyntheticEvent<Element, Event>, value: ProductCategory) => {
    setCategorySelected(value)
  }
  const handlePaginationModelChange = (model: GridPaginationModel, details: GridCallbackDetails) => {
    setPage(model.page)
    setPageSize(model.pageSize)
  }

  return (
    <>
      <Grid spacing={2} container>
        <Grid spacing={2} container marginTop="20px">

          <Grid xs={4}>
            <TextField
              value={searchTitle}
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
          <Grid xs={4}>
            <Autocomplete
              id="category-filter"
              options={categories}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
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
        </Grid>

        <Grid xs={12} marginTop="20px">
          <div style={{ minHeight: 600, width: 1000 }}>
            <DataGrid
              rows={products}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page, pageSize },
                },
              }}
              pageSizeOptions={[10, 20]}
              pagination
              onPaginationModelChange={handlePaginationModelChange}
            // checkboxSelection
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
}
