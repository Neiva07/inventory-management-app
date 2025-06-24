import { Button, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { DataGrid, GridCellParams, GridColDef, GridDeleteIcon, GridRowIdGetter } from "@mui/x-data-grid"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { InboundOrderItemDataInterface, InboundOrderFormDataInterface } from "./useInboundOrderForm"
import { add, divide, integerDivide, multiply, subtract } from "lib/math"
import { Product } from "model/products"
import { DeleteConfirmationDialog } from "components/DeleteConfirmationDialog"

export const InboundOrderFormLineItemList = ({ deleteLineItemFromForm }: { deleteLineItemFromForm: (item: InboundOrderItemDataInterface) => void  }) => {
  const formMethods = useFormContext<InboundOrderFormDataInterface>();

  const [pageSize, setPageSize] = useState<number>(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InboundOrderItemDataInterface | null>(null);
  const items = formMethods.watch("items");

  const handleGetRowID: GridRowIdGetter<InboundOrderItemDataInterface> = (row) => {
    return `${row.productID}-${row.variant.unit.id}`;
  }

  const handleDeleteItem = (item: InboundOrderItemDataInterface) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    deleteLineItemFromForm(itemToDelete);
    
  
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'title', headerName: 'Produto', flex: 1, sortable: false,
    },
    {
      field: 'balance',
      headerName: 'Saldo Estoque',
      type: 'number',
      flex: 1,
      sortable: false,
    },
    {
      field: 'quantity',
      headerName: 'Quantidade',
      type: 'string',
      flex: 1,
      sortable: false,
    },
    {
      field: 'unit',
      headerName: 'Unidade',
      type: 'number',
      flex: 1,
      valueGetter: (params: GridCellParams<InboundOrderItemDataInterface>) => {
        return params.row.variant.unit.name
      },
      sortable: false,
    },
    {
      field: 'unitCost',
      headerName: 'Custo Compra',
      type: 'number',
      sortable: false,
      flex: 1,
    },
    {
      field: 'itemTotalCost',
      headerName: 'Total do Item',
      type: 'number',
      flex: 1,
      sortable: false,
    },
    {
      headerName: 'Remover',
      field: 'delete',
      flex: 1,
      renderCell: (cell: GridCellParams<InboundOrderItemDataInterface>) => {
        return <Button onClick={() => handleDeleteItem(cell.row)}> <GridDeleteIcon /> </Button>;
      },
    }
  ];
  return <Box>
    <Grid container spacing={2}>
      <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
        <DataGrid
          rows={items}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize },
            },
          }}
          pageSizeOptions={[10, 20]}
          getRowId={handleGetRowID}
          pagination
          onPaginationModelChange={v => setPageSize(v.pageSize)}
          hideFooterSelectedRowCount
          paginationMode="client"
          disableColumnMenu
          disableRowSelectionOnClick
        />
      </Grid>
    </Grid>
    
    <DeleteConfirmationDialog
      open={deleteDialogOpen}
      onClose={cancelDelete}
      onConfirm={confirmDelete}
      resourceName={`item "${itemToDelete?.title}"`}
    />
  </Box>
} 