import * as React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel, GridSearchIcon } from '@mui/x-data-grid';
import { Autocomplete, Button, Grid, InputAdornment, TextField } from '@mui/material';
import { ProductCategory, getProductCategories } from '../../model/productCategories';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { Supplier, getSuppliers, deactiveSupplier, deleteSupplier } from '../../model/suppliers';

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 200 },
  { field: 'tradeName', headerName: 'Nome Fantasia', width: 200 },
  { field: 'legalName', headerName: 'Razão Social', width: 200 },
  { field: 'description', headerName: 'Descrição', width: 200 },
  { field: 'companyPhone', headerName: 'Telefone', width: 200 },
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

export const SupplierList = () => {

  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [count, setCount] = React.useState<number>();
  const [searchTitle, setSearchTitle] = React.useState<string>('');
  const [selectedRowID, setSelectedRowID] = React.useState<string>();

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory>();
  const [statusSelected, setStatusSelected] = React.useState<SelectField<string>>();
  const [pageSize, setPageSize] = React.useState<number>(10);

  const navigate = useNavigate();

  React.useEffect(() => {
    getProductCategories().then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, []);


  const querySuppliers = React.useCallback(() => {
    getSuppliers({
      pageSize,
      tradeName: searchTitle,
      productCategory: categorySelected,
      cursor: suppliers[-1],
      status: statusSelected?.value
    }).then(result => {

      setSuppliers(result[0].docs.map(qr => qr.data() as Supplier))
      setCount(result[1].data().count)
    }
    )

  }, [searchTitle, categorySelected, pageSize, statusSelected])


  React.useEffect(() => {
    querySuppliers();
  }, [searchTitle, categorySelected, pageSize, statusSelected]);

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
  const handleDeactivateSupplier = () => {
    deactiveSupplier(selectedRowID)
    querySuppliers();
  }
  const handleDeleteSupplier = () => {
    deleteSupplier(selectedRowID)
    querySuppliers();
  }

  return (
    <>
      <Grid spacing={2} container>

        <Grid item xs={4}>
          <TextField
            value={searchTitle}
            fullWidth
            onChange={handleSearchTitle}
            placeholder={"Busque pelo nome do fornecedor..."}
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
        <Grid item xs={4}>
          <Button fullWidth disabled={!selectedRowID} onClick={() => navigate(`/suppliers/${selectedRowID}`)}
          > Editar Fornecedor </Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeleteSupplier}
          > Deletar Fornecedor </Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth disabled={!selectedRowID} onClick={handleDeactivateSupplier}
          > Desativar Fornecedor </Button>
        </Grid>


        <Grid xs={12} item marginTop="20px">
          <div style={{ height: 600, width: 1200 }}>
            <DataGrid
              rows={suppliers}
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
