# Focus Navigation System

This document describes the reusable focus navigation system that has been extracted from the ProductList component to make it more reusable across different list pages.

## Overview

The focus navigation system provides consistent keyboard navigation between form fields, tables, and action buttons across list pages. It includes:

1. **useFocusNavigation** - Core hook for focus management
2. **useListPageFocusNavigation** - Combined hook with keyboard shortcuts
3. **ListPageWrapper** - Context provider for focus navigation
4. **GenericListPage** - Template component for list pages

## Components

### ListPageKeyboardHelperIcon

A reusable component that provides a help icon button with keyboard shortcuts dialog for list pages.

```typescript
import { ListPageKeyboardHelperIcon } from '../components/KeyboardListHelperIcon';

<ListPageKeyboardHelperIcon
  title="Atalhos do Teclado - Produtos"
  showInactivate={true}
  customShortcuts={[
    { shortcut: "Ctrl/Cmd + S", description: "Salvar produto" }
  ]}
/>
```

### PageTitle with Keyboard Help

The PageTitle component now supports an optional keyboard helper icon for list pages:

```typescript
import { PageTitle } from '../components/PageTitle';

<PageTitle 
  showKeyboardHelp={true}
  keyboardHelpTitle="Atalhos do Teclado - Produtos"
  showInactivate={true}
>
  Produtos
</PageTitle>
```

**Visual Consistency**: Both list and form keyboard helpers now use the same styling with primary-colored chips, consistent dialog layout, and filled help icons.

### useFocusNavigation

The core hook that handles focus navigation between different elements.

```typescript
import { useFocusNavigation } from '../hooks/useFocusNavigation';

const { focusNavigation } = useFocusNavigation({
  fieldRefs: [searchFieldRef, categoryFilterRef, statusFilterRef],
  tableRef,
  tableData: products,
  onTableRowSelect: setSelectedRowID,
  getRowId: (product: Product) => product.id,
});
```

**Available functions:**
- `focusNextField(currentRef)` - Focus the next field in the sequence
- `focusPreviousField(currentRef)` - Focus the previous field in the sequence
- `focusFirstTableRow()` - Focus the first row of the table
- `focusLastTableRow()` - Focus the last row of the table
- `focusLastFieldBeforeTable()` - Focus the last field before the table (useful for navigation back from table)

### useListPageFocusNavigation

A combined hook that includes both focus navigation and keyboard shortcuts.

```typescript
import { useListPageFocusNavigation } from '../hooks/useListPageFocusNavigation';

const { focusNavigation } = useListPageFocusNavigation({
  // Focus navigation options
  fieldRefs: [searchFieldRef, categoryFilterRef, statusFilterRef],
  tableRef,
  tableData: products,
  onTableRowSelect: setSelectedRowID,
  getRowId: (product: Product) => product.id,
  
  // Keyboard shortcuts handlers
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
  
  // Keyboard shortcuts state
  hasSelectedItem: !!selectedRowID,
  canToggleStatus: true,
  hasNextPage: count ? (page + 1) * pageSize < count : false,
  hasPreviousPage: page > 0,
});
```

### ListPageWrapper

A context provider that wraps list pages and provides focus navigation functionality.

```typescript
import { ListPageWrapper } from '../components/ListPageWrapper';

<ListPageWrapper
  fieldRefs={[searchFieldRef, categoryFilterRef, statusFilterRef]}
  tableRef={tableRef}
  tableData={products}
  onTableRowSelect={setSelectedRowID}
  getRowId={(product: Product) => product.id}
>
  {/* Your list page content */}
</ListPageWrapper>
```

### GenericListPage

A template component that demonstrates how to use the focus navigation system.

```typescript
import { GenericListPage } from '../components/GenericListPage';

<GenericListPage
  title="Produtos"
  data={products}
  columns={columns}
  totalCount={count}
  loading={loading}
  selectedRowId={selectedRowID}
  onRowSelectionChange={setSelectedRowID}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  searchValue={searchTitle}
  onSearchChange={setSearchTitle}
  searchPlaceholder="Busque pelo nome do produto..."
  filters={[
    {
      ref: categoryFilterRef,
      component: (
        <EnhancedAutocomplete
          ref={categoryFilterRef}
          options={categories}
          getOptionLabel={(option: ProductCategory) => option.name}
          label="Categoria"
          onChange={handleCategorySelect}
          value={categorySelected}
        />
      ),
    },
    {
      ref: statusFilterRef,
      component: (
        <EnhancedAutocomplete
          ref={statusFilterRef}
          options={statuses}
          getOptionLabel={(option: SelectField<string>) => option.label}
          label="Status"
          onChange={handleStatusSelection}
          value={statusSelected}
        />
      ),
    },
  ]}
  onEditSelected={(rowId) => navigate(`/products/${rowId}`)}
  onDeleteSelected={handleDeleteProduct}
  onToggleStatus={handleToggleStatus}
  onCreateNew={() => navigate('/products/create')}
  onRefresh={queryProducts}
  editRoute="/products"
  createRoute="/products/create"
  canToggleStatus={true}
  showInactivate={true}
  getRowId={(product: Product) => product.id}
/>
```

## Migration Guide

### From ProductList to GenericListPage

1. **Extract your data and state management logic**
2. **Define your columns**
3. **Create your filters array**
4. **Use the GenericListPage component**

Example migration:

```typescript
// Before (ProductList.tsx)
export const ProductList = () => {
  // ... lots of state and logic
  return (
    <>
      <PageTitle>Produtos</PageTitle>
      <Grid spacing={1} container>
        {/* ... lots of JSX */}
      </Grid>
    </>
  );
};

// After (using GenericListPage)
export const ProductList = () => {
  // ... same state and logic, but cleaner
  
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  
  return (
    <GenericListPage
      title="Produtos"
      data={products}
      columns={columns}
      totalCount={count}
      loading={loading}
      selectedRowId={selectedRowID}
      onRowSelectionChange={setSelectedRowID}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      searchValue={searchTitle}
      onSearchChange={setSearchTitle}
      searchPlaceholder="Busque pelo nome do produto..."
      filters={[
        {
          ref: categoryFilterRef,
          component: (
            <EnhancedAutocomplete
              ref={categoryFilterRef}
              options={categories}
              getOptionLabel={(option: ProductCategory) => option.name}
              label="Categoria"
              onChange={handleCategorySelect}
              value={categorySelected}
            />
          ),
        },
        {
          ref: statusFilterRef,
          component: (
            <EnhancedAutocomplete
              ref={statusFilterRef}
              options={statuses}
              getOptionLabel={(option: SelectField<string>) => option.label}
              label="Status"
              onChange={handleStatusSelection}
              value={statusSelected}
            />
          ),
        },
      ]}
      onEditSelected={(rowId) => navigate(`/products/${rowId}`)}
      onDeleteSelected={handleDeleteProduct}
      onToggleStatus={handleToggleStatus}
      onCreateNew={() => navigate('/products/create')}
      onRefresh={queryProducts}
      editRoute="/products"
      createRoute="/products/create"
      canToggleStatus={true}
      showInactivate={true}
      getRowId={(product: Product) => product.id}
    />
  );
};
```

## Keyboard Shortcuts

The system includes the following keyboard shortcuts:

- **Ctrl/Cmd + F** - Focus search field
- **Tab** - Next field/button
- **Shift + Tab** - Previous field/button
- **Escape** - Clear filters and focus search
- **Ctrl/Cmd + N** - Create new item
- **Ctrl/Cmd + E** - Edit selected item
- **Ctrl/Cmd + D** - Delete selected item
- **Ctrl/Cmd + I** - Toggle status (if enabled)
- **Ctrl/Cmd + R** - Refresh data
- **Ctrl/Cmd + ←** - Previous page
- **Ctrl/Cmd + →** - Next page
- **F1** - Show help

## Benefits

1. **Reusability** - The focus navigation logic can be used across different list pages
2. **Consistency** - All list pages will have the same keyboard navigation behavior
3. **Maintainability** - Changes to focus navigation only need to be made in one place
4. **Flexibility** - The system is configurable to work with different field arrangements
5. **Accessibility** - Provides consistent keyboard navigation for all users
6. **User-Friendly** - Keyboard helper icon provides easy access to shortcuts documentation
7. **Integrated UI** - Help icon is seamlessly integrated into the page title

## Navigation Behavior

### Field-to-Table Navigation

The system provides seamless navigation between form fields and the data table:

1. **Forward Navigation**: When pressing Tab on the last field, focus moves to the first row of the table
2. **Backward Navigation**: When pressing Shift+Tab on the first table row, focus returns to the last field before the table

### Table Navigation

- **Arrow Keys**: Navigate between table rows
- **Enter**: Edit the selected row
- **Delete**: Delete the selected row
- **Tab**: Move to the next component after the table
- **Shift+Tab**: Return to the last field before the table

### Focus Management

The `focusLastFieldBeforeTable()` function is particularly useful for:
- Returning focus from the table to the last filter field
- Maintaining consistent navigation flow
- Providing predictable keyboard behavior
- **Clearing table selection** - When navigating back from a table row to fields, the row selection is automatically cleared, disabling action buttons

### Practical Example

In the ProductList component, the navigation flow works as follows:

```typescript
// Navigation order: Search → Category → Status → Table
const fieldRefs = [searchFieldRef, categoryFilterRef, statusFilterRef];

// When user presses Tab on the status filter:
onNextField={focusNavigation.focusFirstTableRow}

// When user presses Shift+Tab on the first table row:
onNavigateToPreviousField={focusNavigation.focusLastFieldBeforeTable}
// This focuses the status filter and clears the table selection
```

This creates a natural navigation cycle: **Search → Category → Status → Table → Status (selection cleared) → Category → Search**

## Future Enhancements

1. **Custom field orders** - Allow different navigation orders for different pages
2. **Conditional fields** - Support fields that appear/disappear based on conditions
3. **Nested navigation** - Support for nested components with their own navigation
4. **Focus indicators** - Visual indicators for keyboard navigation
5. **Screen reader support** - Enhanced accessibility features 