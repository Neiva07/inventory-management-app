import * as React from 'react';
import { GridSearchIcon } from '@mui/x-data-grid';
import { Button, Grid, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectField } from '../product/useProductCreateForm';
import { Customer, deactiveCustomer, deleteCustomer, getCustomers, activeCustomer } from 'model/customer';
import { useAuth } from 'context/auth';
import { PageTitle } from 'components/PageTitle';
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { EnhancedAutocomplete } from 'components/EnhancedAutocomplete';
import { useListPageFocusNavigation } from 'hooks/listings/useListPageFocusNavigation';
import { KeyboardListPageKeyboardHelp } from 'components/KeyboardListPageKeyboardHelp';
import { CustomDataTable, CustomDataTableRef } from 'components/CustomDataTable';
import { ColumnDefinition } from 'components/CustomDataTable/types';

const columns: ColumnDefinition<Customer>[] = [
  { 
    field: 'publicId', 
    headerName: 'ID', 
    width: 200,
  },
  { field: 'name', headerName: 'Nome', flex: 1 },
  { field: 'cpf', headerName: 'CPF', flex: 1 },
  { field: 'rg', headerName: 'RG', flex: 1 },
  { field: 'phone', headerName: 'Telefone', flex: 1 },
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

export const CustomerList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = React.useState<Array<Customer>>([]);
  const [count, setCount] = React.useState<number>();
  const [searchName, setSearchName] = React.useState<string>('');
  const [selectedRowID, setSelectedRowID] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  const [statusSelected, setStatusSelected] = React.useState<SelectField<string> | null>(null);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(0);
  const [currentCursor, setCurrentCursor] = React.useState<Customer | undefined>();

  // Refs for focus navigation
  const searchFieldRef = React.useRef<HTMLDivElement>(null);
  const statusFilterRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<CustomDataTableRef>(null);

  const queryCustomers = () => {
    setLoading(true);
    getCustomers({
      userID: user.id,
      pageSize,
      name: searchName,
      cursor: page > 0 ? currentCursor : undefined,
      status: statusSelected?.value
    }).then(result => {
      const newCustomers = result[0].docs.map(qr => qr.data() as Customer);
      setCustomers(newCustomers);
      setCount(result[1].count);
      
      // Store cursor for next page
      if (newCustomers.length > 0) {
        setCurrentCursor(newCustomers[newCustomers.length - 1]);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  // Reset cursor and page when filters change
  React.useEffect(() => {
    setCurrentCursor(undefined);
    setPage(0);
  }, [user, searchName, statusSelected]);

  React.useEffect(() => {
    queryCustomers();
  }, [user, searchName, pageSize, statusSelected, page]);

  const handleSearchName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value)
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

  const handleActivateCustomer = () => {
    if (!selectedRowID) return;
    activeCustomer(selectedRowID);
    queryCustomers();
  }

  const handleDeactiveCustomer = () => {
    if (!selectedRowID) return;
    deactiveCustomer(selectedRowID);
    queryCustomers();
  }

  const handleToggleStatus = () => {
    if (!selectedRowID) return;
    
    const selectedCustomer = customers.find(c => c.id === selectedRowID);
    if (!selectedCustomer) return;
    
    if (selectedCustomer.status === 'active') {
      handleDeactiveCustomer();
    } else {
      handleActivateCustomer();
    }
  }

  const handleDeleteCustomer = () => {
    setDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteCustomer(selectedRowID);
    queryCustomers();
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
    setSearchName('');
    setStatusSelected(null);
    setTimeout(() => searchFieldRef.current?.focus(), 100);
  };

  const handleEditSelected = () => {
    if (selectedRowID) {
      navigate(`/customers/${selectedRowID}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/customers/create');
  };

  const handleRefresh = () => {
    queryCustomers();
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
    fieldRefs: [searchFieldRef, statusFilterRef],
    tableRef,
    tableData: customers,
    onTableRowSelect: setSelectedRowID,
    getRowId: (customer: Customer) => customer.id,
    onFocusSearch: handleFocusSearch,
    onClearFilters: handleClearFilters,
    onEditSelected: handleEditSelected,
    onDeleteSelected: handleDeleteCustomer,
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
        keyboardHelpTitle="Atalhos do Teclado - Clientes"
        showInactivate={true}
        helpOpen={showHelp}
        onHelpOpenChange={setShowHelp}
      >
        Clientes
      </PageTitle>
      <Grid spacing={1} container>

        <Grid item xs={6}>
          <TextField
            ref={searchFieldRef}
            value={searchName}
            fullWidth
            onChange={handleSearchName}
            placeholder={"Busque pelo nome do cliente..."}
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
        <Grid item xs={6}>
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
              onClick={() => navigate(`/customers/${selectedRowID}`)}
              tabIndex={-1}
            > 
              Editar Cliente 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + D" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeleteCustomer}
              tabIndex={-1}
            > 
              Deletar Cliente 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + I" placement="top">
            <Button 
              fullWidth 
              disabled={!selectedRowID} 
              onClick={handleDeactiveCustomer}
              tabIndex={-1}
            > 
              Desativar Cliente 
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Ctrl/Cmd + N" placement="top">
            <Button 
              fullWidth 
              onClick={() => navigate(`/customers/create`)}
              tabIndex={-1}
            > 
              Cadastrar Cliente 
            </Button>
          </Tooltip>
        </Grid>

        <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
          <CustomDataTable
            data={customers}
            columns={columns}
            totalCount={count}
            loading={loading}
            selectedRowId={selectedRowID}
            onRowSelectionChange={handleRowSelectionChange}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowDoubleClick={(customer) => navigate(`/customers/${customer.id}`)}
            onNavigateToNextField={() => {
              // Navigate to next component after table (could be action buttons)
            }}
            onNavigateToPreviousField={() => {
              // Navigate back to status filter
              focusNavigation.focusLastFieldBeforeTable();
            }}
            getRowId={(customer) => customer.id}
            onEditSelected={handleEditSelected}
            onDeleteSelected={handleDeleteCustomer}
            ref={tableRef}
          />
        </Grid>
      </Grid>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="cliente"
        onDialogClosed={handleDialogClosed}
      />
      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Atalhos do Teclado - Clientes"
        showInactivate={true}
      />
    </>
  );
}
