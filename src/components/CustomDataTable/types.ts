export interface ColumnDefinition<T = any> {
  field: string;
  headerName: string;
  width?: number | string;
  flex?: number;
  sortable?: boolean;
  renderCell?: (value: any, row: T) => React.ReactNode;
  valueGetter?: (row: T) => any;
}

export interface CustomDataTableProps<T = any> {
  // Data
  data: T[];
  totalCount?: number;
  loading?: boolean;
  
  // Columns
  columns: ColumnDefinition<T>[];
  
  // Selection
  selectedRowId?: string | null;
  onRowSelectionChange?: (rowId: string | null) => void;
  selectionMode?: 'single' | 'multiple';
  
  // Pagination
  page: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  
  // Events
  onRowDoubleClick?: (row: T) => void;
  onRowClick?: (row: T) => void;
  onEditSelected?: (row: T) => void;
  onDeleteSelected?: (row: T) => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Customization
  emptyMessage?: string;
  loadingMessage?: string;
  rowHeight?: number;
  maxHeight?: number;
  
  // Focus Management
  onFocusFirstRow?: () => void;
  onFocusLastRow?: () => void;
  onNavigateToNextField?: () => void;
  onNavigateToPreviousField?: () => void;
  
  // Selection State
  hasSelectedRow?: boolean;
  onSelectionChange?: (hasSelection: boolean) => void;
  
  // Row identification
  getRowId?: (row: T) => string;
} 