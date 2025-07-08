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
import { useListPageKeyboardShortcuts } from 'hooks/useListPageKeyboardShortcuts';
import { ListPageKeyboardHelp } from 'components/ListPageKeyboardHelp';
import { CustomDataTable } from 'components/CustomDataTable';
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
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
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
    setSelectedRowID(undefined);
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
    setSelectedRowID(undefined);
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
    setSelectedRowID(undefined);
  }

  const handleRowSelectionChange = (rowId: string | null) => {
    setSelectedRowID(rowId || undefined);
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
  }

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

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };


  // Focus navigation functions
  const focusNextField = (currentRef: React.RefObject<HTMLElement>) => {
    const fields = [searchFieldRef, categoryFilterRef, statusFilterRef];
    const currentIndex = fields.findIndex(ref => ref === currentRef);
    const nextIndex = (currentIndex + 1) % fields.length;
    const nextField = fields[nextIndex];
    
    if (nextField.current) {
      if (nextField.current.tagName === 'INPUT') {
        (nextField.current as HTMLInputElement).focus();
      } else {
        const input = nextField.current.querySelector('input');
        input?.focus();
      }
    }
  };

  // Focus the first row of the DataGrid
  const focusFirstDataGridRow = () => {
    // Blur the status filter
    if (statusFilterRef.current) {
      if (statusFilterRef.current.tagName === 'INPUT') {
        (statusFilterRef.current as HTMLInputElement).blur();
      } else {
        const input = statusFilterRef.current.querySelector('input');
        input?.blur();
      }
    }

    // Focus the first row of the table
    if (products.length > 0) {
      const firstRow = document.querySelector('[data-row-index="0"]');
      if (firstRow) {
        (firstRow as HTMLElement).focus();
        setSelectedRowID(products[0].id);
      }
    }
  };

  const focusPreviousField = (currentRef: React.RefObject<HTMLElement>) => {
    const fields = [searchFieldRef, categoryFilterRef, statusFilterRef];
    const currentIndex = fields.findIndex(ref => ref === currentRef);
    const prevIndex = currentIndex === 0 ? fields.length - 1 : currentIndex - 1;
    const prevField = fields[prevIndex];
    
    if (prevField.current) {
      if (prevField.current.tagName === 'INPUT') {
        (prevField.current as HTMLInputElement).focus();
      } else {
        const input = prevField.current.querySelector('input');
        input?.focus();
      }
    }
  };

  // Keyboard shortcuts
  useListPageKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteProduct,
    onToggleStatus: handleToggleStatus,
    onCreateNew: handleCreateNew,
    onRefresh: handleRefresh,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onShowHelp: handleShowHelp,
    hasSelectedItem: !!selectedRowID,
    canToggleStatus: true,
    hasNextPage: count ? (page + 1) * pageSize < count : false,
    hasPreviousPage: page > 0,
  });



  return (
    <>
      <PageTitle>Produtos</PageTitle>
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
              option.id === value.id
            }
            onChange={handleCategorySelect}
            onNextField={() => focusNextField(categoryFilterRef)}
            onPreviousField={() => focusPreviousField(categoryFilterRef)}
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
              option.value === value.value
            }
            onChange={handleStatusSelection}
            onNextField={focusFirstDataGridRow}
            onPreviousField={() => focusPreviousField(statusFilterRef)}
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
              if (statusFilterRef.current) {
                const input = statusFilterRef.current.querySelector('input');
                input?.focus();
              }
            }}
            getRowId={(product) => product.id}
            onEditSelected={handleEditSelected}
            onDeleteSelected={handleDeleteProduct}
          />
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="produto"
      />
      
      <ListPageKeyboardHelp
        open={showHelp}
        onClose={handleCloseHelp}
        title="Atalhos do Teclado - Produtos"
        showInactivate={true}
      />
    </>
  );
}
