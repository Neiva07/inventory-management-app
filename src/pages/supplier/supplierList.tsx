import * as React from 'react';
import { GridSearchIcon } from '@mui/x-data-grid';
import { Button, Grid, InputAdornment, TextField, Tooltip } from '@mui/material';
import { ProductCategory, getProductCategories } from 'model/productCategories';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { Supplier, getSuppliers, deactiveSupplier, deleteSupplier, activeSupplier } from 'model/suppliers';
import { useAuth } from 'context/auth';
import { PageTitle } from 'components/PageTitle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { useListPageFocusNavigation } from 'hooks/listings/useListPageFocusNavigation';
import { KeyboardListPageKeyboardHelp } from 'components/KeyboardListPageKeyboardHelp';
import { CustomDataTable, CustomDataTableRef } from 'components/CustomDataTable';
import { ColumnDefinition } from 'components/CustomDataTable/types';

const columns: ColumnDefinition<Supplier>[] = [
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

export const SupplierList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = React.useState<Array<Supplier>>([]);
  const [count, setCount] = React.useState<number>();
  const [searchTitle, setSearchTitle] = React.useState<string>('');
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const [categories, setCategories] = React.useState<Array<ProductCategory>>([]);
  const [categorySelected, setCategorySelected] = React.useState<ProductCategory | null>(null);
  const [statusSelected, setStatusSelected] = React.useState<SelectField<string> | null>(null);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<Supplier | undefined>();

  // Refs for focus navigation
  const searchFieldRef = React.useRef<HTMLDivElement>(null);
  const categoryFilterRef = React.useRef<HTMLDivElement>(null);
  const statusFilterRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<CustomDataTableRef>(null);

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

  const handleStatusSelection = (event: React.SyntheticEvent<Element, Event>, value: SelectField<string>) => {
    setStatusSelected(value)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  }

  const handleRowSelectionChange = (rowId: string | null) => {
    setSelectedRowID(rowId || undefined);
  }

  const handleActivateSupplier = () => {
    if (!selectedRowID) return;
    activeSupplier(selectedRowID);
    querySuppliers();
  }

  const handleDeactivateSupplier = () => {
    if (!selectedRowID) return;
    deactiveSupplier(selectedRowID);
    querySuppliers();
  }

  const handleToggleStatus = () => {
    if (!selectedRowID) return;
    
    const selectedSupplier = suppliers.find(s => s.id === selectedRowID);
    if (!selectedSupplier) return;
    
    if (selectedSupplier.status === 'active') {
      handleDeactivateSupplier();
    } else {
      handleActivateSupplier();
    }
  }

  const handleDeleteSupplier = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteSupplier(selectedRowID);
    querySuppliers();
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
      navigate(`/suppliers/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/suppliers/create');
  };

  const handleRefresh = () => {
    querySuppliers();
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
    tableData: suppliers,
    onTableRowSelect: setSelectedRowID,
    getRowId: (supplier: Supplier) => supplier.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteSupplier,
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
        keyboardHelpTitle="Atalhos do Teclado - Fornecedores"
        showInactivate={true}
        helpOpen={showHelp}
        onHelpOpenChange={setShowHelp}
      >
        Fornecedores
      </PageTitle>
      <Grid spacing={1} container>

        <Grid item xs={4}>
          <TextField
            ref={searchFieldRef}
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
          <EnhancedAutocomplete
            ref={categoryFilterRef}
            id="category-filter"
            options={categories}
            getOptionLabel={(option: ProductCategory) => option.name}
            label="Categoria"
            isOptionEqualToValue={(option: ProductCategory, value: ProductCategory) =>
              option?.id === value?.id
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
              option?.value === value?.value
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
              onClick={() => navigate(`/suppliers/${selectedRowID}`)}
              tabIndex={-1}
            > 
              Editar Fornecedor 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + D" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeleteSupplier}
              tabIndex={-1}
            > 
              Deletar Fornecedor 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + I" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeactivateSupplier}
              tabIndex={-1}
            > 
              Desativar Fornecedor 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + N" placement="top">
            <Button 
              fullWidth 
              onClick={() => navigate(`/suppliers/create`)}
              tabIndex={-1}
            > 
              Cadastrar Fornecedor 
            </Button>
          </Tooltip>
        </Grid>

        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <CustomDataTable
            data={suppliers}
            columns={columns}
            totalCount={count}
            loading={loading}
            selectedRowId={selectedRowID}
            onRowSelectionChange={handleRowSelectionChange}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowDoubleClick={(supplier) => navigate(`/suppliers/${supplier.id}`)}
            onNavigateToNextField={() => {
              // Navigate to next component after table (could be action buttons)
            }}
            onNavigateToPreviousField={() => {
              // Navigate back to status filter
              focusNavigation.focusLastFieldBeforeTable();
            }}
            getRowId={(supplier) => supplier.id}
            onEditSelected={handleEditSelected}
            onDeleteSelected={handleDeleteSupplier}
            ref={tableRef}
          />
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="fornecedor"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Fornecedores"
        showInactivate={true}
      />
    </>
  );
}
