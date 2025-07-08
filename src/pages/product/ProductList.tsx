import * as React from 'react';
import { GridSearchIcon } from '@mui/x-data-grid';
import { deactiveProduct, deleteProduct, getProducts, Product, activeProduct } from 'model/products';
import { Button, Grid, InputAdornment, TextField, Tooltip } from '@mui/material';
import { ProductCategory, getProductCategories } from 'model/productCategories';
import { useNavigate } from 'react-router-dom';
import { SelectField } from './useProductCreateForm';
import { useAuth } from 'context/auth';
import { PageTitle } from 'components/PageTitle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { useListPageFocusNavigation } from 'hooks/listings/useListPageFocusNavigation';
import { KeyboardListPageKeyboardHelp } from 'components/KeyboardListPageKeyboardHelp';
import { CustomDataTable, CustomDataTableRef } from 'components/CustomDataTable';
import { ColumnDefinition } from 'components/CustomDataTable/types';

const columns: ColumnDefinition<Product>[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  { 
    field: 'title', 
    headerName: 'Nome', 
    width: 200,
    flex: 1 
  },
  {
    field: 'inventory',
    headerName: 'Estoque',
    width: 100,
  },
  {
    field: 'productCategory.name',
    headerName: 'Categoria',
    flex: 1,
    valueGetter: (row: Product) => row.productCategory.name
  },
  {
    field: 'cost',
    headerName: 'Custo Compra',
    width: 120,
    valueGetter: (row: Product) => row.cost
  },
  {
    field: 'baseUnit',
    headerName: 'Unidade Base',
    width: 120,
    valueGetter: (row: Product) => row.baseUnit.name
  },
  {
    field: 'minInventory',
    headerName: 'Estoque Mínimo',
    width: 120,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
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
  const [selectedRowID, setSelectedRowID] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory | null>(null);
  const [statusSelected, setStatusSelected] = React.useState<SelectField<string> | null>(null);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<Product | undefined>();
  const [showHelp, setShowHelp] = React.useState(false);

  const navigate = useNavigate();

  // Refs for focus management
  const searchFieldRef = React.useRef<HTMLInputElement>(null);
  const categoryFilterRef = React.useRef<HTMLDivElement>(null);
  const statusFilterRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<CustomDataTableRef>(null);

  React.useEffect(() => {
    getProductCategories(user.id).then(queryResult => setCategories(queryResult.docs.map(qr => qr.data() as ProductCategory)))
  }, [user.id]);

  const queryProducts = () => {
    setLoading(true);
    getProducts({
      pageSize,
      title: searchTitle,
      productCategory: categorySelected ?? undefined,
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
    setSelectedRowID(null);
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedRowID(null);
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
    setSelectedRowID(null);
  }

  const handleRowSelectionChange = (rowId: string | null) => {
    setSelectedRowID(rowId);
  }
  const handleDeactivateProduct = () => {
    deactiveProduct(selectedRowID)
    queryProducts();
  }

  const handleActivateProduct = () => {
    activeProduct(selectedRowID)
    queryProducts();
  }

  const handleToggleStatus = () => {
    if (!selectedRowID) return;
    
    const selectedProduct = products.find(p => p.id === selectedRowID);
    if (!selectedProduct) return;
    
    if (selectedProduct.status === 'active') {
      handleDeactivateProduct();
    } else {
      handleActivateProduct();
    }
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
  };

  const handleDialogClosed = () => {
    // Restore focus to the selected row in the table
    if (tableRef.current && selectedRowID) {
      tableRef.current.restoreFocusToSelectedRow();
    }
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = () => {
    if (searchFieldRef.current) {
      const inputElement = searchFieldRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
        inputElement.select(); // Also select the text for easy replacement
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTitle('');
    setCategorySelected(null);
    setStatusSelected(null);
    setTimeout(() => searchFieldRef.current?.focus(), 100);
  };

  const handleEditSelected = () => {
    if (selectedRowID) {
      navigate(`/products/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/products/create');
  };

  const handleRefresh = () => {
    queryProducts();
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (count && (page + 1) * pageSize < count) {
      setPage(page + 1);
    }
  };


  // Set up focus navigation
  const { focusNavigation } = useListPageFocusNavigation({
    fieldRefs: [searchFieldRef, categoryFilterRef, statusFilterRef],
    tableRef,
    tableData: products,
    onTableRowSelect: setSelectedRowID,
    getRowId: (product: Product) => product.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteProduct,
    onToggleStatus: handleToggleStatus,
    onCreateNew: handleCreateNew,
    onRefresh: handleRefresh,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onShowHelp: () => setShowHelp(true),
    hasSelectedItem: !!selectedRowID,
    canToggleStatus: true,
    hasNextPage: count ? (page + 1) * pageSize < count : false,
    hasPreviousPage: page > 0,
  });



  return (
    <>
      <PageTitle 
        showKeyboardHelp={true}
        keyboardHelpTitle="Atalhos do Teclado - Produtos"
        showInactivate={true}
        helpOpen={showHelp}
        onHelpOpenChange={setShowHelp}
      >
        Produtos
      </PageTitle>
      <Grid spacing={1} container>

        <Grid item xs={4}>
          <TextField
            ref={searchFieldRef}
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
          <EnhancedAutocomplete
            ref={categoryFilterRef}
            id="category-filter"
            options={categories}
            getOptionLabel={(option: ProductCategory) => option.name}
            label="Categoria"
            isOptionEqualToValue={(option: ProductCategory, value: ProductCategory) =>
              option.id === value?.id
            }
            onChange={handleCategorySelect}
            onNextField={() => focusNavigation.focusNextField(categoryFilterRef)}
            onPreviousField={() => focusNavigation.focusPreviousField(categoryFilterRef)}
            value={categorySelected}
          />
        </Grid>
        <Grid item xs={4}>
          <EnhancedAutocomplete
            ref={statusFilterRef}
            id="status-filter"
            options={statuses}
            getOptionLabel={(option: SelectField<string>) => option.label}
            label="Status"
            isOptionEqualToValue={(option: SelectField<string>, value: SelectField<string>) =>
              option.value === value?.value
            }
            onChange={handleStatusSelection}
            onNextField={focusNavigation.focusFirstTableRow}
            onPreviousField={() => focusNavigation.focusPreviousField(statusFilterRef)}
            value={statusSelected}
          />
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + E" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={() => navigate(`/products/${selectedRowID}`)}
              tabIndex={-1}
            > 
              Editar Produto 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + D" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeleteProduct}
              tabIndex={-1}
            > 
              Deletar Produto 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + I" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeactivateProduct}
              tabIndex={-1}
            > 
              Desativar Produto 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + N" placement="top">
            <Button 
              fullWidth 
              onClick={() => navigate(`/products/create`)}
              tabIndex={-1}
            > 
              Cadastrar Produto 
            </Button>
          </Tooltip>
        </Grid>

        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <CustomDataTable
            data={products}
            columns={columns}
            totalCount={count}
            loading={loading}
            selectedRowId={selectedRowID}
            onRowSelectionChange={handleRowSelectionChange}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowDoubleClick={(product) => navigate(`/products/${product.id}`)}
            onNavigateToNextField={() => {
              // Navigate to next component after table (could be action buttons)
            }}
            onNavigateToPreviousField={() => {
              // Navigate back to status filter
              focusNavigation.focusLastFieldBeforeTable();
            }}
            getRowId={(product) => product.id}
            onEditSelected={handleEditSelected}
            onDeleteSelected={handleDeleteProduct}
            ref={tableRef}
          />
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="produto"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Produtos"
        showInactivate={true}
      />

    </>
  );
}
