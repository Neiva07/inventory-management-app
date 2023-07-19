import * as React from 'react';
import { DataGrid, GridCallbackDetails, GridCellParams, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon, GridValueGetterParams } from '@mui/x-data-grid';
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

export const ProductList = () => {

  const [products, setProducts] = React.useState<Array<Product>>([]);
  const [count, setCount] = React.useState<number>();
  const [searchTitle, setSearchTitle] = React.useState<string>('');
  const [selectedRowID, setSelectedRowID] = React.useState<string>();

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory>();
  const [pageSize, setPageSize] = React.useState<number>(10);
  console.log(products)

  React.useEffect(() => {
    getProductCategories().then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, []);

  // const productsByID = React.useMemo(() => products.reduce((acc, curr) => {
  //   acc.set(curr.id, curr)
  // }, new Map<string, Product>()), [products])
  console.log(count)

  React.useEffect(() => {
    getProducts({
      pageSize,
      title: searchTitle,
      productCategory: categorySelected,
      cursor: products[-1],
    }).then(result => {

      setProducts(result[0].docs.map(qr => qr.data() as Product))
      setCount(result[1].data().count)
    }
    )
  }, [searchTitle, categorySelected, pageSize]);

  const handleSearchTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value)
  }

  const handleCategorySelect = (event: React.SyntheticEvent<Element, Event>, value: ProductCategory) => {
    setCategorySelected(value)
  }
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageSize(model.pageSize)
  }
  const handleRowSelection = (rowSelection: GridRowSelectionModel) => {
    const id = String(rowSelection[0])
    if (id === selectedRowID) {
      setSelectedRowID(null);
    } else {
      setSelectedRowID(id);
    }
  }

  return (
    <>
      <Grid spacing={2} container>

        <Grid item xs={6}>
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
        <Grid item xs={6}>
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

        <Grid xs={12} item marginTop="20px">
          <div style={{ height: 600, width: 1200 }}>
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
            // local text is the prop in which defines the text to translate
            // localeText={}
            // checkboxSelection
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
}
