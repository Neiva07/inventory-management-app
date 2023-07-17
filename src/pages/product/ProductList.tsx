import * as React from 'react';
import { DataGrid, GridCellParams, GridColDef, GridSearchIcon, GridValueGetterParams } from '@mui/x-data-grid';
import { getProducts, Product } from '../../model/products';
import { InputAdornment, TextField } from '@mui/material';

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


  React.useEffect(() => {
    getProducts(searchTitle).then(queryResult => setProducts(queryResult.docs.map(qr => qr.data() as Product)))
  }, [searchTitle]);

  const handleSearchTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value)
  }
  console.log(products)

  return (
    <>
      <TextField

        style={{ width: '300px' }}
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

      <div style={{ height: 600, width: 1000 }}>
        <DataGrid
          rows={products}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20]}
        // checkboxSelection
        />
      </div>
    </>
  );
}
